import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all doctors with their user data and stats
    const doctors = await prisma.doctor.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Admin doctors fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      specialization,
      licenseNumber,
      phone,
      experience,
      education
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !specialization || !licenseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create user and doctor in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const newUser = await tx.user.create({
        data: {
          email,
          password: 'temp_password_123', // Should be hashed in production
          role: 'DOCTOR'
        }
      })

      // Create doctor profile
      const newDoctor = await tx.doctor.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          specialization,
          licenseNumber,
          phoneNumber: phone,
          experience: experience ? parseInt(experience) : 0,
          education,
          verified: false,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              createdAt: true,
            }
          },
          _count: {
            select: {
              appointments: true
            }
          }
        }
      })

      return newDoctor
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Admin doctor creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    )
  }
}
