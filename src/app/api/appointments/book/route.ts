import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const BookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  dateTime: z.string().datetime('Invalid date format - must be ISO string'),
  type: z.enum(['IN_PERSON', 'TELEMEDICINE', 'FOLLOW_UP', 'EMERGENCY']),
  reason: z.string().min(10, 'Please provide a detailed reason for your visit (minimum 10 characters)'),
  duration: z.number().positive('Duration must be positive').default(30)
})

export async function POST(request: NextRequest) {
  try {
    console.log('📅 Booking appointment request received')
    
    const user = await verifyAuth(request)
    console.log('👤 User authenticated:', user?.email, 'Role:', user?.role)
    
    if (!user || user.role !== 'PATIENT') {
      console.log('❌ Authentication failed - not a patient')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id }
    })
    console.log('🏥 Patient found:', patient?.firstName, patient?.lastName)

    if (!patient) {
      console.log('❌ Patient profile not found')
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const validatedData = BookAppointmentSchema.parse(body)
    console.log('✅ Data validated:', validatedData)

    // Verify doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { id: validatedData.doctorId },
      select: { id: true, isActive: true, firstName: true, lastName: true }
    })

    if (!doctor || !doctor.isActive) {
      return NextResponse.json({ error: 'Doctor not available' }, { status: 400 })
    }

    // Check if time slot is available
    const requestedDateTime = new Date(validatedData.dateTime)
    const endTime = new Date(requestedDateTime.getTime() + validatedData.duration * 60000)

    console.log('⏰ Checking time slot:', {
      requested: requestedDateTime.toISOString(),
      end: endTime.toISOString(),
      doctorId: validatedData.doctorId
    })

    // Find any conflicting appointments (simpler logic)
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        },
        dateTime: {
          gte: new Date(requestedDateTime.getTime() - 30 * 60000), // 30 min before
          lt: new Date(requestedDateTime.getTime() + 60 * 60000)   // 60 min after
        }
      }
    })

    console.log('🔍 Conflicting appointment found:', conflictingAppointment)

    if (conflictingAppointment) {
      return NextResponse.json({ error: 'Time slot is not available' }, { status: 400 })
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: validatedData.doctorId,
        dateTime: requestedDateTime,
        duration: validatedData.duration,
        type: validatedData.type,
        status: 'SCHEDULED',
        reason: validatedData.reason,
        meetingLink: validatedData.type === 'TELEMEDICINE' ? 
          `https://meet.healthcare.com/room/${Math.random().toString(36).substring(7)}` : 
          null
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      }
    })

    // Create notifications for both patient and doctor
    await Promise.all([
      // Patient notification
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'APPOINTMENT_CONFIRMED',
          title: 'Appointment Scheduled',
          message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been scheduled for ${requestedDateTime.toLocaleDateString()} at ${requestedDateTime.toLocaleTimeString()}.`,
          data: {
            appointmentId: appointment.id,
            doctorName: `${doctor.firstName} ${doctor.lastName}`,
            dateTime: requestedDateTime.toISOString()
          }
        }
      }),
      // Doctor notification (get doctor's user ID)
      prisma.doctor.findUnique({
        where: { id: validatedData.doctorId },
        select: { userId: true }
      }).then(async (doctorData: any) => {
        if (doctorData) {
          await prisma.notification.create({
            data: {
              userId: doctorData.userId,
              type: 'APPOINTMENT_CONFIRMED',
              title: 'New Appointment Scheduled',
              message: `New appointment scheduled with ${patient.firstName} ${patient.lastName} for ${requestedDateTime.toLocaleDateString()} at ${requestedDateTime.toLocaleTimeString()}.`,
              data: {
                appointmentId: appointment.id,
                patientName: `${patient.firstName} ${patient.lastName}`,
                dateTime: requestedDateTime.toISOString()
              }
            }
          })
        }
      })
    ])

    // Emit WebSocket events for real-time updates
    try {
      // Get the global socket instance
      if (global.io) {
        const socketMessage = {
          type: 'appointment:booked',
          appointmentId: appointment.id,
          doctorId: validatedData.doctorId,
          patientId: patient.id,
          patient: {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: user.email
          },
          appointment: {
            id: appointment.id,
            dateTime: requestedDateTime.toISOString(),
            reason: validatedData.reason,
            type: validatedData.type,
            status: 'SCHEDULED'
          }
        }
        
        // Emit to doctor's room
        global.io.to(`doctor:${validatedData.doctorId}`).emit('patient:new', socketMessage)
        
        // Get doctor's user ID and emit to their user room
        const doctorUser = await prisma.doctor.findUnique({
          where: { id: validatedData.doctorId },
          select: { userId: true }
        })
        
        if (doctorUser) {
          global.io.to(`user:${doctorUser.userId}`).emit('patient-list:refresh', {
            action: 'new_patient',
            patientId: patient.id,
            appointmentId: appointment.id,
            doctorId: validatedData.doctorId
          })
        }
        
        // Emit general appointment booked event
        global.io.emit('appointment:booked', socketMessage)
        
        console.log('📡 WebSocket events emitted for new appointment')
      } else {
        console.log('⚠️ WebSocket server not available for real-time updates')
      }
    } catch (socketError) {
      console.log('⚠️ WebSocket event emission failed:', socketError)
    }

    console.log('✅ Appointment created successfully:', appointment.id)

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('❌ Error booking appointment:', error)
    
    if (error instanceof z.ZodError) {
      console.log('🔍 Validation errors:', error.errors)
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json(
        { 
          error: 'Invalid data', 
          details: error.errors,
          message: errorMessages
        },
        { status: 400 }
      )
    }
    
    console.error('💥 Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
