import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { format, startOfDay, endOfDay, addMinutes, isWithinInterval } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const { doctorId } = params
    const requestedDate = new Date(dateParam)
    
    // Get doctor's availability
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        availability: true,
        isActive: true
      }
    })

    if (!doctor || !doctor.isActive) {
      return NextResponse.json({ error: 'Doctor not found or inactive' }, { status: 404 })
    }

    // Get existing appointments for the date
    const dayStart = startOfDay(requestedDate)
    const dayEnd = endOfDay(requestedDate)
    
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        dateTime: {
          gte: dayStart,
          lte: dayEnd
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      },
      select: {
        dateTime: true,
        duration: true
      }
    })

    // Generate time slots based on doctor's availability
    const dayOfWeek = format(requestedDate, 'EEEE').toUpperCase()
    const availability = doctor.availability as any
    
    const daySchedule = availability?.[dayOfWeek]
    if (!daySchedule || !daySchedule.isActive) {
      return NextResponse.json([])
    }

    const timeSlots = []
    const startTime = daySchedule.startTime || '09:00'
    const endTime = daySchedule.endTime || '17:00'
    
    // Generate 30-minute slots
    const slotDuration = 30
    let currentTime = new Date(`${dateParam} ${startTime}`)
    const endDateTime = new Date(`${dateParam} ${endTime}`)

    while (currentTime < endDateTime) {
      const slotEnd = addMinutes(currentTime, slotDuration)
      
      // Check if slot conflicts with existing appointments
      const isBooked = existingAppointments.some((appointment: any) => {
        const appointmentStart = new Date(appointment.dateTime)
        const appointmentEnd = addMinutes(appointmentStart, appointment.duration)
        
        return isWithinInterval(currentTime, { start: appointmentStart, end: appointmentEnd }) ||
               isWithinInterval(slotEnd, { start: appointmentStart, end: appointmentEnd }) ||
               isWithinInterval(appointmentStart, { start: currentTime, end: slotEnd })
      })

      // Check if slot is in the past
      const isPast = currentTime <= new Date()

      timeSlots.push({
        time: format(currentTime, 'HH:mm'),
        available: !isBooked && !isPast
      })

      currentTime = addMinutes(currentTime, slotDuration)
    }

    return NextResponse.json(timeSlots)
  } catch (error) {
    console.error('Error fetching doctor availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
