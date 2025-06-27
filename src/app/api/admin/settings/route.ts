import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'system-settings.json')

// Default settings
const DEFAULT_SETTINGS = {
  general: {
    platformName: 'Healthcare Management Platform',
    supportEmail: 'support@healthcare.com',
    supportPhone: '+1-555-0123',
    maintenanceMode: false,
    allowRegistration: true,
    maxAppointmentsPerDay: 50,
    appointmentDuration: 30,
    advanceBookingDays: 30,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    appointmentReminders: true,
    reminderHours: 24,
    systemNotifications: true,
  },
  security: {
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
  },
  integrations: {
    twilioEnabled: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    sendgridEnabled: false,
    sendgridApiKey: '',
    googleMapsApiKey: '',
  }
}

async function ensureSettingsFile() {
  const dataDir = path.join(process.cwd(), 'data')
  
  // Create data directory if it doesn't exist
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
  
  // Create settings file if it doesn't exist
  if (!existsSync(SETTINGS_FILE)) {
    await writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2))
  }
}

async function loadSettings() {
  try {
    await ensureSettingsFile()
    const data = await readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading settings:', error)
    return DEFAULT_SETTINGS
  }
}

async function saveSettings(settings: any) {
  try {
    await ensureSettingsFile()
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    return true
  } catch (error) {
    console.error('Error saving settings:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const settings = await loadSettings()
    
    // Don't return sensitive values to client (mask them)
    const clientSettings = {
      ...settings,
      integrations: {
        ...settings.integrations,
        twilioAuthToken: settings.integrations.twilioAuthToken ? '••••••••••••••••••••••••••••••••' : '',
        sendgridApiKey: settings.integrations.sendgridApiKey ? 'SG.••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••' : '',
        googleMapsApiKey: settings.integrations.googleMapsApiKey ? 'AIza••••••••••••••••••••••••••••••••••••••••' : '',
      }
    }

    return NextResponse.json(clientSettings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const updates = await request.json()
    const currentSettings = await loadSettings()
    
    // Merge updates with current settings
    const newSettings = {
      ...currentSettings,
      ...updates,
    }
    
    // Handle sensitive fields - only update if new value is provided and not masked
    if (updates.integrations) {
      if (updates.integrations.twilioAuthToken && !updates.integrations.twilioAuthToken.includes('••••')) {
        newSettings.integrations.twilioAuthToken = updates.integrations.twilioAuthToken
      }
      if (updates.integrations.sendgridApiKey && !updates.integrations.sendgridApiKey.includes('••••')) {
        newSettings.integrations.sendgridApiKey = updates.integrations.sendgridApiKey
      }
      if (updates.integrations.googleMapsApiKey && !updates.integrations.googleMapsApiKey.includes('••••')) {
        newSettings.integrations.googleMapsApiKey = updates.integrations.googleMapsApiKey
      }
    }

    const success = await saveSettings(newSettings)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
