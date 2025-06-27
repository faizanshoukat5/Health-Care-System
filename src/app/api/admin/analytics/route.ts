import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Overview statistics
    const [
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      scheduledAppointments,
      totalDoctors,
      totalPatients
    ] = await Promise.all([
      prisma.appointment.count({
        where: { 
          createdAt: { gte: startDate }
        }
      }),
      prisma.appointment.count({
        where: { 
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        }
      }),
      prisma.appointment.count({
        where: { 
          createdAt: { gte: startDate },
          status: 'CANCELLED'
        }
      }),
      prisma.appointment.count({
        where: { 
          createdAt: { gte: startDate },
          status: 'SCHEDULED'
        }
      }),
      prisma.doctor.count({
        where: { isActive: true }
      }),
      prisma.patient.count()
    ])

    const averageAppointmentsPerDay = totalAppointments / days
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

    // Appointment trends (daily data for the period)
    const trends = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [dayAppointments, dayCompleted, dayCancelled] = await Promise.all([
        prisma.appointment.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.appointment.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            },
            status: 'COMPLETED'
          }
        }),
        prisma.appointment.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            },
            status: 'CANCELLED'
          }
        })
      ])

      trends.push({
        date: date.toISOString().split('T')[0],
        appointments: dayAppointments,
        completed: dayCompleted,
        cancelled: dayCancelled
      })
    }

    // Doctor statistics
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        appointments: {
          where: {
            createdAt: { gte: startDate }
          }
        },
        _count: {
          select: {
            appointments: true
          }
        }
      }
    })

    const doctorStats = doctors.map(doctor => {
      const appointments = doctor.appointments
      const completed = appointments.filter((apt: any) => apt.status === 'COMPLETED').length
      const cancelled = appointments.filter((apt: any) => apt.status === 'CANCELLED').length
      
      return {
        id: doctor.id,
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        totalAppointments: appointments.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        averageRating: 4.5, // Placeholder - would need rating system
        patientCount: doctor._count.appointments // Using appointments as proxy for now
      }
    })

    // Appointments by specialization
    const specializationData = await prisma.appointment.groupBy({
      by: ['doctorId'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    })

    const specializationCounts: { [key: string]: number } = {}
    
    for (const item of specializationData) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: item.doctorId },
        select: { specialization: true }
      })
      
      if (doctor && item._count) {
        specializationCounts[doctor.specialization] = 
          (specializationCounts[doctor.specialization] || 0) + item._count.id
      }
    }

    const appointmentsBySpecialization = Object.entries(specializationCounts).map(([spec, count]) => ({
      specialization: spec,
      count,
      percentage: Math.round((count / totalAppointments) * 100) || 0
    }))

    // Appointments by status
    const statusCounts = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    })

    const appointmentsByStatus = statusCounts.map(item => ({
      status: item.status,
      count: item._count.id,
      percentage: Math.round((item._count.id / totalAppointments) * 100) || 0
    }))

    const analytics = {
      overview: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        scheduledAppointments,
        totalDoctors,
        totalPatients,
        averageAppointmentsPerDay: Math.round(averageAppointmentsPerDay * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100
      },
      trends,
      doctorStats,
      appointmentsBySpecialization,
      appointmentsByStatus
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
