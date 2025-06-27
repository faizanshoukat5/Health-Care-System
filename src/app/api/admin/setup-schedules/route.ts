import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Default schedule template for new doctors
const DEFAULT_SCHEDULE = {
  MONDAY: {
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00'
  },
  TUESDAY: {
    dayOfWeek: 'TUESDAY',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00'
  },
  WEDNESDAY: {
    dayOfWeek: 'WEDNESDAY',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00'
  },
  THURSDAY: {
    dayOfWeek: 'THURSDAY',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00'
  },
  FRIDAY: {
    dayOfWeek: 'FRIDAY',
    startTime: '09:00',
    endTime: '15:00',
    isActive: true,
    breakStart: '12:00',
    breakEnd: '13:00'
  },
  SATURDAY: {
    dayOfWeek: 'SATURDAY',
    startTime: '10:00',
    endTime: '14:00',
    isActive: false
  },
  SUNDAY: {
    dayOfWeek: 'SUNDAY',
    startTime: '10:00',
    endTime: '14:00',
    isActive: false
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 AUTO-SETUP SCHEDULES API called')
    
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can run this bulk operation
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('✅ Admin user authenticated:', user.email)

    // Get all doctors
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        availability: true,
        isActive: true
      }
    })

    console.log(`📋 Found ${doctors.length} doctors`)

    let setupCount = 0
    let alreadyConfigured = 0
    let errors = 0

    for (const doctor of doctors) {
      try {
        // Check if doctor has any active schedule
        const availability = doctor.availability as any
        const hasActiveSchedule = availability && 
          Object.values(availability).some((day: any) => day?.isActive === true)

        if (hasActiveSchedule) {
          console.log(`✅ ${doctor.firstName} ${doctor.lastName} already has schedule`)
          alreadyConfigured++
          continue
        }

        // Set up default schedule
        console.log(`⚙️ Setting up schedule for ${doctor.firstName} ${doctor.lastName}`)
        
        await prisma.doctor.update({
          where: { id: doctor.id },
          data: {
            availability: DEFAULT_SCHEDULE
          }
        })

        setupCount++
        console.log(`✅ Schedule created for ${doctor.firstName} ${doctor.lastName}`)

      } catch (error) {
        console.error(`❌ Error setting up ${doctor.firstName} ${doctor.lastName}:`, error)
        errors++
      }
    }

    const summary = {
      total: doctors.length,
      setupCount,
      alreadyConfigured,
      errors,
      message: `Successfully set up schedules for ${setupCount} doctors`
    }

    console.log('📊 Setup complete:', summary)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('💥 Auto-setup failed:', error)
    return NextResponse.json(
      { error: 'Failed to setup schedules', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check which doctors need schedule setup
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        availability: true,
        isActive: true
      }
    })

    const doctorsStatus = doctors.map((doctor: any) => {
      const availability = doctor.availability as any
      const hasActiveSchedule = availability && 
        Object.values(availability).some((day: any) => day?.isActive === true)
      
      return {
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        hasSchedule: hasActiveSchedule,
        isActive: doctor.isActive
      }
    })

    const needsSetup = doctorsStatus.filter((d: any) => !d.hasSchedule && d.isActive)

    return NextResponse.json({
      total: doctors.length,
      withSchedule: doctorsStatus.filter((d: any) => d.hasSchedule).length,
      needsSetup: needsSetup.length,
      inactive: doctorsStatus.filter((d: any) => !d.isActive).length,
      doctors: doctorsStatus
    })

  } catch (error) {
    console.error('Error checking doctor schedules:', error)
    return NextResponse.json(
      { error: 'Failed to check schedules' },
      { status: 500 }
    )
  }
}
