import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
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
      } else if (experience.includes('+')) {
        where.experience = { gte: parseInt(experience) }
      } else {
        where.experience = { gte: min, lte: max || min + 3 }
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
      case 'availability':
        orderBy = { isActive: 'desc' }
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

      // Create location data based on specialization
      const locations = [
        { city: 'New York', state: 'NY', address: '123 Medical Center Blvd' },
        { city: 'Los Angeles', state: 'CA', address: '456 Healthcare Plaza' },
        { city: 'Chicago', state: 'IL', address: '789 Wellness Drive' },
        { city: 'Houston', state: 'TX', address: '321 Medical District' },
        { city: 'Phoenix', state: 'AZ', address: '654 Health Avenue' },
        { city: 'Philadelphia', state: 'PA', address: '987 Care Center Way' },
        { city: 'San Antonio', state: 'TX', address: '147 Healing Street' },
        { city: 'San Diego', state: 'CA', address: '258 Medicine Lane' },
        { city: 'Boston', state: 'MA', address: '369 Medical Mile' },
        { city: 'Miami', state: 'FL', address: '741 Health Harbor' }
      ]
      const location = locations[Math.floor(Math.random() * locations.length)]

      // Generate languages based on location
      const languagesByRegion: Record<string, string[]> = {
        'CA': ['English', 'Spanish'],
        'TX': ['English', 'Spanish'],
        'FL': ['English', 'Spanish'],
        'NY': ['English', 'Spanish', 'Chinese'],
        'MA': ['English', 'Portuguese'],
        'IL': ['English', 'Polish'],
        'PA': ['English', 'Italian'],
        'AZ': ['English', 'Spanish'],
      }
      
      const baseLanguages = languagesByRegion[location.state] || ['English']
      const additionalLanguages = ['French', 'German', 'Arabic', 'Hindi', 'Korean']
      const languageCount = Math.floor(Math.random() * 2) + 1
      const languages = [
        ...baseLanguages,
        ...additionalLanguages.sort(() => 0.5 - Math.random()).slice(0, languageCount)
      ].slice(0, 3) // Limit to 3 languages

      // Generate bio based on specialization
      const bioTemplates: Record<string, string> = {
        'Cardiology': `Dr. ${doctor.firstName} ${doctor.lastName} is a board-certified cardiologist with ${doctor.experience} years of experience in cardiovascular medicine. Specializes in preventive cardiology, heart disease diagnosis, and advanced cardiac interventions.`,
        'Dermatology': `Dr. ${doctor.firstName} ${doctor.lastName} is a renowned dermatologist with expertise in medical, surgical, and cosmetic dermatology. With ${doctor.experience} years of experience, focuses on skin cancer prevention and advanced dermatological treatments.`,
        'Pediatrics': `Dr. ${doctor.firstName} ${doctor.lastName} is a dedicated pediatrician committed to providing comprehensive care for children from infancy through adolescence. ${doctor.experience} years of experience in child development and family-centered care.`,
        'Orthopedics': `Dr. ${doctor.firstName} ${doctor.lastName} is an experienced orthopedic surgeon specializing in musculoskeletal disorders, sports injuries, and joint replacement surgery. ${doctor.experience} years of expertise in both surgical and non-surgical treatments.`,
        'Neurology': `Dr. ${doctor.firstName} ${doctor.lastName} is a skilled neurologist with extensive experience in diagnosing and treating disorders of the nervous system. Specializes in stroke care, epilepsy management, and neurodegenerative diseases.`,
        'Psychiatry': `Dr. ${doctor.firstName} ${doctor.lastName} is a compassionate psychiatrist dedicated to mental health and wellness. With ${doctor.experience} years of experience in treating anxiety, depression, and various psychiatric conditions using evidence-based approaches.`,
        'General Medicine': `Dr. ${doctor.firstName} ${doctor.lastName} is a family medicine physician providing comprehensive primary care for patients of all ages. ${doctor.experience} years of experience in preventive care, chronic disease management, and health promotion.`,
      }

      const bio = bioTemplates[doctor.specialization] || 
        `Dr. ${doctor.firstName} ${doctor.lastName} is a dedicated ${doctor.specialization} specialist with ${doctor.experience} years of experience. Committed to providing exceptional patient care with a focus on evidence-based medicine and personalized treatment plans.`

      // Telemedicine availability based on specialization
      const telemedicineSpecialties = ['General Medicine', 'Psychiatry', 'Dermatology', 'Endocrinology']
      const telemedicineAvailable = telemedicineSpecialties.includes(doctor.specialization) || Math.random() > 0.5

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
          ? (doctor.qualifications as any).university || 'Medical Degree, Residency Training'
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
    if (availability === 'today') {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.isAvailable)
    } else if (availability === 'week') {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.isAvailable)
    } else if (availability === 'month') {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.isAvailable || Math.random() > 0.3)
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

    // Return response in expected format
    return NextResponse.json({
      doctors: filteredDoctors,
      total: filteredDoctors.length,
      page: 1,
      limit: filteredDoctors.length
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
