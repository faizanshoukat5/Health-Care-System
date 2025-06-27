import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { doctorId } = params
    const body = await request.json()

    // Validate doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Update doctor
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        ...body,
        experience: body.experience ? parseInt(body.experience) : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            appointments: true
          }
        }
      }
    })

    return NextResponse.json(updatedDoctor)
  } catch (error) {
    console.error('Admin doctor update error:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { doctorId } = params

    // Check if doctor has active appointments
    const activeAppointments = await prisma.appointment.count({
      where: {
        doctorId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        },
        dateTime: {
          gte: new Date()
        }
      }
    })

    if (activeAppointments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete doctor with active appointments' },
        { status: 400 }
      )
    }

    // Soft delete by deactivating
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ message: 'Doctor deactivated successfully' })
  } catch (error) {
    console.error('Admin doctor deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}
