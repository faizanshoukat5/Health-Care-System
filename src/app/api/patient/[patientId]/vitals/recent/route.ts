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

    // Get recent vital signs (last 10 readings)
    const vitals = await prisma.vitalSigns.findMany({
      where: {
        patientId
      },
      orderBy: {
        recordedAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json(vitals)
  } catch (error) {
    console.error('Error fetching recent vitals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
