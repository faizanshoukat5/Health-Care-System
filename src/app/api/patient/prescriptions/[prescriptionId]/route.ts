import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { prescriptionId: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prescriptionId } = params
    const { status } = await request.json()

    // Verify prescription belongs to this patient
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patient: {
          userId: user.id
        }
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    // Update prescription status
    const updated = await prisma.prescription.update({
      where: {
        id: prescriptionId
      },
      data: {
        status: status
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating prescription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
