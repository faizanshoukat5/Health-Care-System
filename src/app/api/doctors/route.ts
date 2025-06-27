import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search') || ''
    const specialization = searchParams.get('specialization') || ''
    const location = searchParams.get('location') || ''
    const availability = searchParams.get('availability') || ''
    const rating = searchParams.get('rating') || ''
    const experience = searchParams.get('experience') || ''
    const telemedicine = searchParams.get('telemedicine') === 'true'
    const sortBy = searchParams.get('sortBy') || 'relevance'

    // Build where clause
    const where: any = {
      isActive: true
    }

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Specialization filter
    if (specialization) {
      where.specialization = specialization
    }

    // Experience filter
    if (experience) {
      const [min, max] = experience.split('-').map(Number)
      if (max) {
        where.experience = { gte: min, lte: max }
      } else {
        where.experience = { gte: min }
      }
    }

    // Build orderBy clause
    let orderBy: any = { firstName: 'asc' }
    
    switch (sortBy) {
      case 'experience':
        orderBy = { experience: 'desc' }
        break
      case 'price':
        orderBy = { consultationFee: 'asc' }
        break
      case 'rating':
        // For now, we'll sort by experience as a proxy for rating
        orderBy = { experience: 'desc' }
        break
      default:
        orderBy = { firstName: 'asc' }
    }

    // Fetch doctors with enhanced data
    const doctors = await prisma.doctor.findMany({
      where,
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        specialization: true,
        licenseNumber: true,
        phoneNumber: true,
        qualifications: true,
        experience: true,
        consultationFee: true,
        availability: true,
        isActive: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy
    })

    // Enhance doctor data with calculated fields
    const enhancedDoctors = doctors.map(doctor => {
      // Calculate rating based on experience (temporary until we have real reviews)
      const baseRating = 3.5
      const experienceBonus = Math.min(doctor.experience * 0.1, 1.5)
      const rating = Math.min(baseRating + experienceBonus, 5.0)
      
      // Calculate review count (simulated)
      const reviewCount = Math.floor(doctor.experience * 8 + Math.random() * 20)
      
      // Determine availability status
      const isAvailable = doctor.isActive && Math.random() > 0.3 // 70% chance available
      
      // Generate next available slot
      const nextAvailableSlot = isAvailable 
        ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        : null

      // Create location data
      const locations = [
        { city: 'New York', state: 'NY', address: '123 Medical Center Blvd' },
        { city: 'Los Angeles', state: 'CA', address: '456 Healthcare Plaza' },
        { city: 'Chicago', state: 'IL', address: '789 Wellness Drive' },
        { city: 'Houston', state: 'TX', address: '321 Medical District' },
        { city: 'Phoenix', state: 'AZ', address: '654 Health Avenue' },
        { city: 'Philadelphia', state: 'PA', address: '987 Care Center Way' },
        { city: 'San Antonio', state: 'TX', address: '147 Healing Street' },
        { city: 'San Diego', state: 'CA', address: '258 Medicine Lane' }
      ]
      const location = locations[Math.floor(Math.random() * locations.length)]

      // Generate languages
      const allLanguages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Arabic']
      const languageCount = Math.floor(Math.random() * 3) + 1
      const languages = [
        'English',
        ...allLanguages.slice(1).sort(() => 0.5 - Math.random()).slice(0, languageCount - 1)
      ]

      // Generate bio
      const bios = [
        `Dr. ${doctor.firstName} ${doctor.lastName} is a dedicated ${doctor.specialization} specialist with ${doctor.experience} years of experience. Committed to providing exceptional patient care with a focus on evidence-based medicine.`,
        `Experienced ${doctor.specialization} physician with a passion for improving patient outcomes. Dr. ${doctor.lastName} combines clinical expertise with compassionate care.`,
        `Board-certified ${doctor.specialization} specialist with extensive experience in both clinical practice and patient education. Known for thorough consultations and personalized treatment plans.`
      ]
      const bio = bios[Math.floor(Math.random() * bios.length)]

      // Telemedicine availability
      const telemedicineAvailable = Math.random() > 0.4 // 60% offer telemedicine

      return {
        ...doctor,
        rating: Math.round(rating * 10) / 10,
        reviewCount,
        isAvailable,
        nextAvailableSlot,
        location,
        languages,
        bio,
        telemedicineAvailable,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        education: typeof doctor.qualifications === 'object' && doctor.qualifications 
          ? (doctor.qualifications as any).education || 'Medical Degree, Residency Training'
          : 'Medical Degree, Residency Training'
      }
    })

    // Apply client-side filters that couldn't be done in the database
    let filteredDoctors = enhancedDoctors

    // Location filter
    if (location) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.location.city.toLowerCase().includes(location.toLowerCase()) ||
        doctor.location.state.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Availability filter
    if (availability === 'available') {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.isAvailable)
    }

    // Rating filter
    if (rating) {
      const minRating = parseFloat(rating)
      filteredDoctors = filteredDoctors.filter(doctor => doctor.rating >= minRating)
    }

    // Telemedicine filter
    if (telemedicine) {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.telemedicineAvailable)
    }

    return NextResponse.json(filteredDoctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
