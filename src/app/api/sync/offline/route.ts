import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const offlineAction = await request.json()
    console.log('[Sync] Processing offline action:', offlineAction.type)

    // Validate action structure
    if (!offlineAction.type || !offlineAction.timestamp) {
      return NextResponse.json({ error: 'Invalid action format' }, { status: 400 })
    }

    let result
    switch (offlineAction.type) {
      case 'vitals:create':
        result = await syncVitalsCreation(user, offlineAction.data)
        break
      case 'appointment:book':
        result = await syncAppointmentBooking(user, offlineAction.data)
        break
      case 'appointment:update':
        result = await syncAppointmentUpdate(user, offlineAction.data)
        break
      case 'notification:read':
        result = await syncNotificationRead(user, offlineAction.data)
        break
      case 'prescription:update':
        result = await syncPrescriptionUpdate(user, offlineAction.data)
        break
      default:
        return NextResponse.json({ error: 'Unknown action type' }, { status: 400 })
    }

    console.log('[Sync] Action synced successfully:', offlineAction.type)
    return NextResponse.json({
      success: true,
      result,
      syncedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Sync] Error processing offline action:', error)
    return NextResponse.json(
      { error: 'Failed to sync offline action' },
      { status: 500 }
    )
  }
}

// Sync vital signs creation
async function syncVitalsCreation(user: any, data: any) {
  // Get patient ID
  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
    select: { id: true }
  })

  if (!patient) {
    throw new Error('Patient not found')
  }

  // Check for duplicates based on timestamp
  const existing = await prisma.vitalSigns.findFirst({
    where: {
      patientId: patient.id,
      recordedAt: new Date(data.recordedAt)
    }
  })

  if (existing) {
    console.log('[Sync] Vital signs already exist, skipping')
    return existing
  }

  // Create new vital signs record
  return await prisma.vitalSigns.create({
    data: {
      patientId: patient.id,
      bloodPressure: data.bloodPressure,
      heartRate: data.heartRate,
      temperature: data.temperature,
      weight: data.weight,
      height: data.height,
      oxygenSaturation: data.oxygenSaturation,
      recordedAt: new Date(data.recordedAt)
    }
  })
}

// Sync appointment booking
async function syncAppointmentBooking(user: any, data: any) {
  // Get patient ID
  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
    select: { id: true }
  })

  if (!patient) {
    throw new Error('Patient not found')
  }

  // Check if appointment already exists
  const existing = await prisma.appointment.findFirst({
    where: {
      patientId: patient.id,
      doctorId: data.doctorId,
      dateTime: new Date(data.dateTime)
    }
  })

  if (existing) {
    console.log('[Sync] Appointment already exists, skipping')
    return existing
  }

  // Verify doctor is still available
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      dateTime: {
        gte: new Date(new Date(data.dateTime).getTime() - 30 * 60000),
        lt: new Date(new Date(data.dateTime).getTime() + 60 * 60000)
      }
    }
  })

  if (conflictingAppointment) {
    throw new Error('Time slot no longer available')
  }

  // Create appointment
  return await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: data.doctorId,
      dateTime: new Date(data.dateTime),
      duration: data.duration || 30,
      type: data.type,
      status: 'SCHEDULED',
      reason: data.reason,
      meetingLink: data.type === 'TELEMEDICINE' ? 
        `https://meet.healthcare.com/room/${Math.random().toString(36).substring(7)}` : 
        null
    }
  })
}

// Sync appointment updates
async function syncAppointmentUpdate(user: any, data: any) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
    include: { patient: true, doctor: true }
  })

  if (!appointment) {
    throw new Error('Appointment not found')
  }

  // Verify user has permission to update
  if (user.role === 'PATIENT' && appointment.patient.userId !== user.id) {
    throw new Error('Permission denied')
  }
  if (user.role === 'DOCTOR' && appointment.doctor.userId !== user.id) {
    throw new Error('Permission denied')
  }

  // Update appointment
  return await prisma.appointment.update({
    where: { id: data.appointmentId },
    data: {
      status: data.status,
      notes: data.notes,
      ...(data.dateTime && { dateTime: new Date(data.dateTime) })
    }
  })
}

// Sync notification read status
async function syncNotificationRead(user: any, data: any) {
  return await prisma.notification.updateMany({
    where: {
      id: data.notificationId,
      userId: user.id
    },
    data: {
      isRead: true
    }
  })
}

// Sync prescription updates
async function syncPrescriptionUpdate(user: any, data: any) {
  // Verify patient owns this prescription
  const prescription = await prisma.prescription.findUnique({
    where: { id: data.prescriptionId },
    include: { patient: true }
  })

  if (!prescription) {
    throw new Error('Prescription not found')
  }

  if (prescription.patient.userId !== user.id) {
    throw new Error('Permission denied')
  }

  // Update prescription (e.g., mark as taken)
  return await prisma.prescription.update({
    where: { id: data.prescriptionId },
    data: {
      status: data.status,
      notes: data.notes,
      ...(data.lastTaken && { lastTaken: new Date(data.lastTaken) })
    }
  })
}
