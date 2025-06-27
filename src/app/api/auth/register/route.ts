import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/lib/auth'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN'], {
    required_error: 'Role is required',
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  adminSecret: z.string().optional(), // Required for ADMIN role creation
  additionalInfo: z.object({
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    phoneNumber: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    }).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phoneNumber: z.string().optional(),
    }).optional(),
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
    experience: z.number().optional(),
    consultationFee: z.number().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Validate admin role creation
    if (validatedData.role === 'ADMIN') {
      const ADMIN_SECRET = process.env.ADMIN_SECRET || 'healthcare-admin-2024'
      if (!validatedData.adminSecret || validatedData.adminSecret !== ADMIN_SECRET) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid admin secret. Admin accounts can only be created with proper authorization.'
          },
          { status: 403 }
        )
      }
    }

    // Transform date strings to Date objects
    const additionalInfo = validatedData.additionalInfo ? {
      ...validatedData.additionalInfo,
      dateOfBirth: validatedData.additionalInfo.dateOfBirth 
        ? new Date(validatedData.additionalInfo.dateOfBirth) 
        : undefined
    } : undefined

    const result = await AuthService.register({
      ...validatedData,
      additionalInfo
    })
    
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Registration successful', 
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        token: result.token
      },
      { status: 201 }
    )

    // Set HTTP-only cookie
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      },
      { status: 400 }
    )
  }
}
