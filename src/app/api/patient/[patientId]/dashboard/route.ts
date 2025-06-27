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

    // Verify user has access to this patient data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true
      }
    })

    if (!patient || (user.role === 'PATIENT' && patient.userId !== user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get patient data with basic info
    const patientData = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        address: true,
        emergencyContact: true,
        insuranceInfo: true,
        allergies: true,
        medications: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(patientData)
  } catch (error) {
    console.error('Error fetching patient dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
