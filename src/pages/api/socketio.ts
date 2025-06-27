import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface SocketWithAuth extends Socket {
  userId?: string
  userRole?: string
}

// Global IO instance for cross-API usage
declare global {
  var io: SocketIOServer | undefined
}

interface SocketServer extends NetServer {
  io?: SocketIOServer
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: { server: SocketServer } }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })
    res.socket.server.io = io
    
    // Store IO instance globally for use in API routes
    global.io = io

    io.use(async (socket: SocketWithAuth, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error'))
        }

        // Verify token (you'll need to adapt this to your auth system)
        const user = await verifyTokenForSocket(token)
        if (!user) {
          return next(new Error('Authentication error'))
        }

        socket.userId = user.id
        socket.userRole = user.role
        next()
      } catch (err) {
        next(new Error('Authentication error'))
      }
    })

    io.on('connection', (socket: SocketWithAuth) => {
      console.log(`User ${socket.userId} connected (${socket.userRole})`)

      // Join user-specific rooms
      socket.join(`user:${socket.userId}`)
      if (socket.userRole === 'PATIENT') {
        socket.join('patients')
      } else if (socket.userRole === 'DOCTOR') {
        socket.join('doctors')
      }

      // Handle patient data subscription
      socket.on('subscribe:patient', async (patientId: string) => {
        if (socket.userRole === 'PATIENT' && socket.userId === patientId) {
          socket.join(`patient:${patientId}`)
        } else if (socket.userRole === 'DOCTOR') {
          // Check if doctor has access to this patient
          const hasAccess = await checkDoctorPatientAccess(socket.userId!, patientId)
          if (hasAccess) {
            socket.join(`patient:${patientId}`)
          }
        }
      })

      // Handle doctor data subscription
      socket.on('subscribe:doctor', async (doctorId: string) => {
        if (socket.userRole === 'DOCTOR' && socket.userId === doctorId) {
          socket.join(`doctor:${doctorId}`)
        }
      })

      // Handle new appointment booking (most important for patient list updates)
      socket.on('appointment:booked', async (data) => {
        try {
          console.log(`[Socket] New appointment booked by ${socket.userId}:`, data)
          
          // Verify this is a patient booking
          if (socket.userRole !== 'PATIENT') {
            socket.emit('error', { message: 'Only patients can book appointments' })
            return
          }

          // Get patient data
          const patient = await prisma.patient.findUnique({
            where: { userId: socket.userId! },
            include: {
              user: { select: { email: true } },
              appointments: {
                where: { doctorId: data.doctorId },
                orderBy: { dateTime: 'desc' },
                take: 1
              },
              medicalRecords: {
                orderBy: { createdAt: 'desc' },
                take: 1
              },
              vitals: {
                orderBy: { recordedAt: 'desc' },
                take: 1
              }
            }
          })

          if (!patient) {
            socket.emit('error', { message: 'Patient profile not found' })
            return
          }

          // Get doctor's user ID for notifications
          const doctor = await prisma.doctor.findUnique({
            where: { id: data.doctorId },
            select: { userId: true, firstName: true, lastName: true }
          })

          if (!doctor) {
            socket.emit('error', { message: 'Doctor not found' })
            return
          }

          // Broadcast to doctor that they have a new patient
          io.to(`doctor:${data.doctorId}`).emit('patient:new', {
            patient: patient,
            appointment: data,
            message: `New appointment booked by ${patient.firstName} ${patient.lastName}`
          })

          // Broadcast to doctor's user room as well (for dashboard updates)
          io.to(`user:${doctor.userId}`).emit('patient-list:refresh', {
            action: 'new_patient',
            patientId: patient.id,
            appointmentId: data.appointmentId
          })

          // Confirm to patient
          socket.emit('appointment:confirmed', {
            appointmentId: data.appointmentId,
            doctor: doctor,
            message: 'Appointment booked successfully'
          })

          console.log(`[Socket] Doctor ${data.doctorId} notified of new patient ${patient.id}`)
        } catch (error) {
          console.error('[Socket] Error handling appointment booking:', error)
          socket.emit('error', { message: 'Failed to process appointment booking' })
        }
      })

      // Handle real-time appointment updates
      socket.on('appointment:update', async (data) => {
        try {
          // Verify permission and update appointment
          const result = await handleAppointmentUpdate(socket.userId!, socket.userRole!, data)
          if (result.success) {
            // Broadcast to relevant users
            io.to(`patient:${result.appointment.patientId}`).emit('appointment:updated', result.appointment)
            io.to(`doctor:${result.appointment.doctorId}`).emit('appointment:updated', result.appointment)
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to update appointment' })
        }
      })

      // Handle vital signs updates
      socket.on('vitals:update', async (data) => {
        try {
          if (socket.userRole === 'PATIENT') {
            const vitals = await updatePatientVitals(socket.userId!, data)
            io.to(`patient:${socket.userId}`).emit('vitals:updated', vitals)
            
            // Notify doctors who have access
            const doctorIds = await getDoctorsForPatient(socket.userId!)
            doctorIds.forEach(doctorId => {
              io.to(`doctor:${doctorId}`).emit('patient:vitals:updated', {
                patientId: socket.userId,
                vitals
              })
            })
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to update vitals' })
        }
      })

      // Handle notifications
      socket.on('notification:read', async (notificationId: string) => {
        try {
          await markNotificationAsRead(socket.userId!, notificationId)
          socket.emit('notification:updated', { id: notificationId, isRead: true })
        } catch (error) {
          socket.emit('error', { message: 'Failed to update notification' })
        }
      })

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`)
      })
    })
  }
  res.end()
}

// Helper functions
async function verifyTokenForSocket(token: string) {
  try {
    // This should use your existing token verification logic
    // For now, I'll create a placeholder
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, email: true }
    })
    return user
  } catch {
    return null
  }
}

async function checkDoctorPatientAccess(doctorId: string, patientId: string): Promise<boolean> {
  const appointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      patientId,
    },
  })
  return !!appointment
}

async function handleAppointmentUpdate(userId: string, userRole: string, data: any) {
  // Implement appointment update logic
  // This is a placeholder - you'll need to implement based on your business logic
  return { success: true, appointment: data }
}

async function updatePatientVitals(patientId: string, vitalsData: any) {
  return await prisma.vitalSigns.create({
    data: {
      patientId,
      ...vitalsData,
      recordedAt: new Date(),
    },
  })
}

async function getDoctorsForPatient(patientId: string): Promise<string[]> {
  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    select: { doctorId: true },
    distinct: ['doctorId'],
  })
  return appointments.map(apt => apt.doctorId)
}

async function markNotificationAsRead(userId: string, notificationId: string) {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  })
}

export default SocketHandler
