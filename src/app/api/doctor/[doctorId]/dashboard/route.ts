import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = params

    // Verify user has access to this doctor data
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: true
      }
    })

    if (!doctor || (user.role === 'DOCTOR' && doctor.userId !== user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    // Get doctor's basic info
    const doctorInfo = {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee
    }

    // Get total unique patients
    const totalPatients = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        status: 'COMPLETED'
      },
      distinct: ['patientId'],
      select: { patientId: true }
    })

    // Get monthly revenue
    const monthlyAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        status: 'COMPLETED',
        dateTime: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })
    const monthlyRevenue = monthlyAppointments.length * (doctor.consultationFee || 0)

    // Get weekly appointments
    const weeklyAppointments = await prisma.appointment.count({
      where: {
        doctorId: doctorId,
        dateTime: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    })

    // Calculate average consultation time (mock data for now)
    const avgConsultationTime = 25

    // Calculate patient satisfaction (mock data for now)
    const satisfaction = 94

    // Calculate patient retention (mock data for now)
    const patientRetention = 88

    const dashboardData = {
      ...doctorInfo,
      totalPatients: totalPatients.length,
      monthlyRevenue,
      weeklyAppointments,
      avgConsultationTime,
      satisfaction,
      patientRetention
    }

    return NextResponse.json({ doctor: dashboardData })
  } catch (error) {
    console.error('Error fetching doctor dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
