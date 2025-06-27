import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Set up Server-Sent Events
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = JSON.stringify({
          type: 'connected',
          userId: user.id,
          timestamp: new Date().toISOString(),
        })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))

        // Set up periodic heartbeat
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            })
            controller.enqueue(encoder.encode(`data: ${heartbeatData}\n\n`))
          } catch (error) {
            clearInterval(heartbeat)
            controller.close()
          }
        }, 30000) // Every 30 seconds

        // Set up data polling for notifications and updates
        const dataInterval = setInterval(async () => {
          try {
            // Fetch recent notifications
            const notifications = await getRecentNotifications(user.id)
            if (notifications.length > 0) {
              const notificationData = JSON.stringify({
                type: 'notifications',
                data: notifications,
                timestamp: new Date().toISOString(),
              })
              controller.enqueue(encoder.encode(`data: ${notificationData}\n\n`))
            }

            // Fetch appointment updates if user is a patient
            if (user.role === 'PATIENT') {
              const appointments = await getUpcomingAppointments(user.id)
              const appointmentData = JSON.stringify({
                type: 'appointments',
                data: appointments,
                timestamp: new Date().toISOString(),
              })
              controller.enqueue(encoder.encode(`data: ${appointmentData}\n\n`))
            }

            // Fetch patient updates if user is a doctor
            if (user.role === 'DOCTOR') {
              const patientUpdates = await getDoctorPatientUpdates(user.id)
              if (patientUpdates.length > 0) {
                const updateData = JSON.stringify({
                  type: 'patient_updates',
                  data: patientUpdates,
                  timestamp: new Date().toISOString(),
                })
                controller.enqueue(encoder.encode(`data: ${updateData}\n\n`))
              }
            }
          } catch (error) {
            console.error('SSE data fetch error:', error)
          }
        }, 60000) // Every minute

        // Cleanup on close
        request.signal?.addEventListener('abort', () => {
          clearInterval(heartbeat)
          clearInterval(dataInterval)
          controller.close()
        })
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })
  } catch (error) {
    console.error('SSE setup error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Helper functions
async function getRecentNotifications(userId: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.notification.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

async function getUpcomingAppointments(userId: string) {
  const { prisma } = await import('@/lib/prisma')
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  })
  
  if (!patient) return []

  return await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      dateTime: {
        gte: new Date(),
      },
    },
    include: {
      doctor: {
        select: { firstName: true, lastName: true, specialization: true },
      },
    },
    orderBy: { dateTime: 'asc' },
    take: 5,
  })
}

async function getDoctorPatientUpdates(userId: string) {
  const { prisma } = await import('@/lib/prisma')
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true },
  })
  
  if (!doctor) return []

  // Get recent vital signs from patients
  const recentVitals = await prisma.vitalSigns.findMany({
    where: {
      recordedAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
      patient: {
        appointments: {
          some: {
            doctorId: doctor.id,
          },
        },
      },
    },
    include: {
      patient: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { recordedAt: 'desc' },
    take: 10,
  })

  return recentVitals
}
