import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { type, title, message, targetType, targetUserId } = body

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      )
    }

    let targetUserIds: string[] = []

    // Determine target users based on targetType
    switch (targetType) {
      case 'all':
        const allUsers = await prisma.user.findMany({
          select: { id: true }
        })
        targetUserIds = allUsers.map(u => u.id)
        break
        
      case 'doctors':
        const doctors = await prisma.doctor.findMany({
          where: { isActive: true },
          select: { userId: true }
        })
        targetUserIds = doctors.map(d => d.userId)
        break
        
      case 'patients':
        const patients = await prisma.patient.findMany({
          select: { userId: true }
        })
        targetUserIds = patients.map(p => p.userId)
        break
        
      case 'specific':
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'targetUserId required for specific target type' },
            { status: 400 }
          )
        }
        
        // Verify user exists
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId }
        })
        
        if (!targetUser) {
          return NextResponse.json(
            { error: 'Target user not found' },
            { status: 404 }
          )
        }
        
        targetUserIds = [targetUserId]
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid targetType' },
          { status: 400 }
        )
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map(userId => ({
        userId,
        type,
        title,
        message,
        isRead: false,
        data: {}
      }))
    })

    return NextResponse.json({
      message: `Sent ${notifications.count} notifications`,
      sent: notifications.count,
      targetUsers: targetUserIds.length
    }, { status: 201 })
  } catch (error) {
    console.error('Admin notification send error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
