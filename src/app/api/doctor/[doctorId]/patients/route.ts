import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    console.log('[Doctor Patients API] Request received for doctorId:', params.doctorId)
    
    const user = await verifyAuth(request)
    if (!user || user.role !== 'DOCTOR') {
      console.log('[Doctor Patients API] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = params
    console.log('[Doctor Patients API] Authenticated doctor requesting patients for:', doctorId)
    
    // Verify the doctor exists and belongs to the authenticated user
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { userId: true, firstName: true, lastName: true }
    })
    
    if (!doctor) {
      console.log('[Doctor Patients API] Doctor not found:', doctorId)
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }
    
    if (doctor.userId !== user.id) {
      console.log('[Doctor Patients API] Access denied - doctor belongs to different user')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    console.log(`[Doctor Patients API] Getting patients for Dr. ${doctor.firstName} ${doctor.lastName}`)
    
    // Get all patients who have appointments with this doctor
    const patients = await prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            doctorId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
        appointments: {
          where: {
            doctorId,
          },
          orderBy: {
            dateTime: 'desc',
          },
          take: 5, // Get latest 5 appointments instead of just 1
        },
        medicalRecords: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        vitals: {
          orderBy: {
            recordedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    })

    console.log(`[Doctor Patients API] Found ${patients.length} patients`)
    
    return NextResponse.json(patients)
  } catch (error) {
    console.error('[Doctor Patients API] Error fetching patients:', error)
    console.error('[Doctor Patients API] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
