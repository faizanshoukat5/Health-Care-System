import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const VitalSignsSchema = z.object({
  bloodPressure: z.object({
    systolic: z.number().min(70).max(200),
    diastolic: z.number().min(40).max(120)
  }),
  heartRate: z.number().min(40).max(200).optional(),
  temperature: z.number().min(35).max(42).optional(),
  weight: z.number().min(20).max(300).optional(),
  height: z.number().min(100).max(250).optional(),
  oxygenSaturation: z.number().min(70).max(100).optional(),
  bloodSugar: z.number().min(3).max(30).optional()
})

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = VitalSignsSchema.parse(body)

    // Create vital signs record
    const vitalSigns = await prisma.vitalSigns.create({
      data: {
        patientId: patient.id,
        bloodPressure: validatedData.bloodPressure,
        heartRate: validatedData.heartRate,
        temperature: validatedData.temperature,
        weight: validatedData.weight,
        height: validatedData.height,
        oxygenSaturation: validatedData.oxygenSaturation,
        bloodSugar: validatedData.bloodSugar,
        recordedAt: new Date(),
        recordedBy: user.id
      }
    })

    // Create notification for doctor if values are concerning
    const { systolic, diastolic } = validatedData.bloodPressure
    const isHighBP = systolic >= 140 || diastolic >= 90
    const isLowO2 = validatedData.oxygenSaturation && validatedData.oxygenSaturation < 95
    const isHighHR = validatedData.heartRate && validatedData.heartRate > 100
    
    if (isHighBP || isLowO2 || isHighHR) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM_ALERT',
          title: 'Abnormal Vital Signs Detected',
          message: `Your recent vital signs reading shows values that may require attention. Please consult with your healthcare provider.`,
          data: {
            vitalSignsId: vitalSigns.id,
            concerning: {
              highBP: isHighBP,
              lowO2: isLowO2,
              highHR: isHighHR
            }
          }
        }
      })
    }

    return NextResponse.json(vitalSigns)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error logging vital signs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Get recent vital signs (last 10)
    const vitals = await prisma.vitalSigns.findMany({
      where: {
        patientId: patient.id
      },
      orderBy: {
        recordedAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json(vitals)
  } catch (error) {
    console.error('Error fetching vital signs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
