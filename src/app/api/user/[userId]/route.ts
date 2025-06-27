import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = params

    // Verify user has access to this data (can only access their own data unless admin)
    if (user.role !== 'ADMIN' && user.id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get user with related doctor/patient data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctor: true,
        patient: true
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt,
        doctor: userData.doctor ? {
          id: userData.doctor.id,
          firstName: userData.doctor.firstName,
          lastName: userData.doctor.lastName,
          specialization: userData.doctor.specialization,
          experience: userData.doctor.experience,
          consultationFee: userData.doctor.consultationFee
        } : null,
        patient: userData.patient ? {
          id: userData.patient.id,
          firstName: userData.patient.firstName,
          lastName: userData.patient.lastName,
          dateOfBirth: userData.patient.dateOfBirth,
          gender: userData.patient.gender
        } : null
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
