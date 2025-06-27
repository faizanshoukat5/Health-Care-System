import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { patientId } = params

    // Verify access
    if (user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId, userId: user.id }
      })
      if (!patient) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get active prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId,
        status: 'ACTIVE'
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Error fetching active prescriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
