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

    // Get upcoming appointments (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        dateTime: {
          gte: new Date(),
          lte: thirtyDaysFromNow
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
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
        dateTime: 'asc'
      },
      take: 5
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
