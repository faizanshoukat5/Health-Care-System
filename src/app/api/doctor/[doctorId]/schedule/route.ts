import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const updateScheduleSchema = z.object({
  availability: z.record(z.object({
    id: z.string(),
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
    breakStart: z.string().optional().nullable(),
    breakEnd: z.string().optional().nullable(),
  }))
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    console.log('📅 Schedule PUT request for doctorId:', params.doctorId)
    
    const user = await verifyAuth(request)
    if (!user) {
      console.log('❌ Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ User authenticated:', user.id, user.email, user.role)

    const { doctorId } = params
    const body = await request.json()
    console.log('📅 Request body received:', JSON.stringify(body, null, 2))
    
    // Validate the data
    let validatedData
    try {
      validatedData = updateScheduleSchema.parse(body)
      console.log('✅ Data validation successful')
      console.log('📅 Validated availability data:', JSON.stringify(validatedData.availability, null, 2))
    } catch (validationError) {
      console.error('❌ Validation error:', validationError)
      if (validationError instanceof z.ZodError) {
        console.error('❌ Validation issues:', validationError.issues)
      }
      return NextResponse.json({ 
        error: 'Invalid data format', 
        details: validationError 
      }, { status: 400 })
    }

    // Verify that the user is updating their own schedule or is an admin
    console.log('🔐 Checking user permissions...')
    if (user.role !== 'ADMIN') {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { userId: true, firstName: true, lastName: true }
      })
      console.log('👨‍⚕️ Doctor found:', doctor)

      if (!doctor || doctor.userId !== user.id) {
        console.log('❌ Access forbidden for user:', user.id, 'doctor userId:', doctor?.userId)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      console.log('✅ User authorized to update this schedule')
    } else {
      console.log('✅ Admin user, access granted')
    }

    // Update the doctor's availability
    console.log('💾 Updating doctor availability in database...')
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        availability: validatedData.availability
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        availability: true,
        updatedAt: true
      }
    })
    console.log('✅ Database update successful:', updatedDoctor.id)

    const responseData = {
      success: true,
      doctor: updatedDoctor,
      message: 'Schedule updated successfully'
    }
    console.log('✅ Sending success response:', responseData)
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('💥 Error updating doctor schedule:', error)
    
    if (error instanceof z.ZodError) {
      console.error('💥 Zod validation error details:', error.errors)
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      console.error('💥 Error message:', error.message)
      console.error('💥 Error stack:', error.stack)
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = params

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        availability: true,
        isActive: true
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
