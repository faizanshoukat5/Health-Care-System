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

    // Get comprehensive admin dashboard data
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      activeDoctors,
      todayAppointments,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      unreadNotifications,
      recentUsers,
      recentAppointments
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.doctor.count({ where: { isActive: true } }),
      
      // Appointment statistics
      prisma.appointment.count({
        where: {
          dateTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      
      // Notification statistics
      prisma.notification.count({ where: { isRead: false } }),
      
      // Recent data
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { firstName: true, lastName: true }
          },
          doctor: {
            select: { firstName: true, lastName: true, specialization: true }
          }
        }
      }),
      
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { firstName: true, lastName: true }
          },
          doctor: {
            select: { firstName: true, lastName: true, specialization: true }
          }
        }
      })
    ])

    // Calculate revenue (mock data for now)
    const monthlyRevenue = completedAppointments * 150 // Average consultation fee
    const weeklyGrowth = Math.round(Math.random() * 20) // Mock growth percentage

    // Recent activity with proper formatting
    const recentActivity = [
      ...recentUsers.slice(0, 3).map(user => ({
        type: 'USER_REGISTERED',
        description: `New ${user.role.toLowerCase()} registered: ${
          user.patient 
            ? `${user.patient.firstName} ${user.patient.lastName}` 
            : user.doctor 
              ? `Dr. ${user.doctor.firstName} ${user.doctor.lastName}` 
              : user.email
        }`,
        timestamp: user.createdAt.toISOString(),
        user: user
      })),
      ...recentAppointments.slice(0, 3).map(appointment => ({
        type: 'APPOINTMENT_CREATED',
        description: `New appointment: ${appointment.patient.firstName} ${appointment.patient.lastName} with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        timestamp: appointment.createdAt.toISOString(),
        appointment: appointment
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    // System health metrics
    const systemHealth = {
      database: 'healthy',
      notifications: unreadNotifications < 100 ? 'healthy' : 'warning',
      appointments: todayAppointments > 0 ? 'active' : 'low',
      users: totalUsers > 0 ? 'healthy' : 'warning'
    }

    const dashboardData = {
      // Core statistics
      totalUsers,
      totalPatients,
      totalDoctors,
      activeDoctors,
      inactiveDoctors: totalDoctors - activeDoctors,
      
      // Appointment statistics
      todayAppointments,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      appointmentCompletionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
      
      // Financial data (mock)
      monthlyRevenue,
      weeklyGrowth,
      averageConsultationFee: 150,
      
      // Notification statistics
      unreadNotifications,
      totalNotifications: unreadNotifications + Math.round(unreadNotifications * 3), // Mock total
      
      // Recent activity
      recentActivity,
      
      // System health
      systemHealth,
      
      // Quick stats for cards
      quickStats: {
        newUsersToday: recentUsers.filter(u => {
          const today = new Date()
          const userDate = new Date(u.createdAt)
          return userDate.toDateString() === today.toDateString()
        }).length,
        appointmentsThisWeek: Math.round(todayAppointments * 7), // Mock weekly appointments
        activeSessionsNow: Math.round(Math.random() * 50) + 10, // Mock active sessions
        systemUptime: '99.9%'
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Admin dashboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
