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

    // Verify user has access to this data
    if (user.role !== 'ADMIN' && user.id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Find doctor by userId
    const doctor = await prisma.doctor.findFirst({
      where: { userId: userId }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        email: doctor.email
      }
    })
  } catch (error) {
    console.error('Error fetching doctor by user ID:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
