import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'NURSE'
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
  private static JWT_EXPIRES_IN = '7d' as const

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(payload: AuthUser): string {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role
    }
    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
    }
    return jwt.sign(tokenPayload, this.JWT_SECRET, options)
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as AuthUser
    } catch {
      return null
    }
  }

  static async register(data: {
    email: string
    password: string
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
    firstName: string
    lastName: string
    additionalInfo?: any
    adminSecret?: string
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await this.hashPassword(data.password)
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
      },
    })

    // Create role-specific profile
    if (data.role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.additionalInfo?.dateOfBirth || new Date('1990-01-01'),
          gender: data.additionalInfo?.gender || 'OTHER',
          phoneNumber: data.additionalInfo?.phoneNumber || '+1-000-000-0000',
          address: JSON.stringify(data.additionalInfo?.address || {}),
          emergencyContact: JSON.stringify(data.additionalInfo?.emergencyContact || {}),
          insuranceInfo: JSON.stringify(data.additionalInfo?.insuranceInfo || {}),
        },
      })
    } else if (data.role === 'DOCTOR') {
      // Default schedule for new doctors
      const defaultSchedule = {
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

      await prisma.doctor.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          specialization: data.additionalInfo?.specialization || 'General Practice',
          licenseNumber: data.additionalInfo?.licenseNumber || `LIC-${user.id.slice(-8)}`,
          phoneNumber: data.additionalInfo?.phoneNumber || '+1-000-000-0000',
          qualifications: JSON.stringify(data.additionalInfo?.qualifications || {}),
          experience: data.additionalInfo?.experience || 0,
          consultationFee: data.additionalInfo?.consultationFee || 100,
          availability: defaultSchedule, // Use the default schedule instead of empty object
        },
      })
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: user.role as any,
    })

    return { user, token }
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true,
      },
    })

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new Error('Invalid credentials')
    }

    // Get firstName and lastName from patient or doctor profile
    const firstName = user.patient?.firstName || user.doctor?.firstName || 'User'
    const lastName = user.patient?.lastName || user.doctor?.lastName || ''

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      role: user.role as any,
    })

    return { user, token }
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    return AuthService.verifyToken(token)
  } catch {
    return null
  }
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  return getAuthUser(request)
}
