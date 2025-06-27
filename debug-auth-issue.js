// Debug Authentication and Doctor Profile Issue
// Run this in the browser console on the schedule page

console.log('🔍 DEBUGGING DOCTOR PROFILE ISSUE')
console.log('=================================')

async function debugDoctorProfile() {
  try {
    // 1. Check authentication state
    console.log('\n1. 📋 CHECKING AUTHENTICATION STATE')
    console.log('-----------------------------------')
    
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const userEmail = localStorage.getItem('userEmail')
    
    console.log('Token exists:', !!token)
    console.log('User ID:', userId)
    console.log('User Email:', userEmail)
    
    if (!token || !userId) {
      console.log('❌ No authentication found - redirecting to login...')
      window.location.href = '/login'
      return
    }
    
    // 2. Test user endpoint
    console.log('\n2. 🔍 TESTING USER ENDPOINT')
    console.log('---------------------------')
    
    try {
      const userResponse = await fetch(`/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('User API Status:', userResponse.status)
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log('✅ User data received:', userData)
        
        if (userData.user?.doctorProfile) {
          console.log('✅ Doctor profile found in user data')
          console.log('Doctor Profile:', userData.user.doctorProfile)
        } else {
          console.log('❌ No doctor profile in user data')
          console.log('User role:', userData.user?.role)
        }
      } else {
        const errorText = await userResponse.text()
        console.log('❌ User API failed:', errorText)
      }
    } catch (error) {
      console.log('❌ User API error:', error.message)
    }
    
    // 3. Test alternative doctor lookup
    console.log('\n3. 🔄 TESTING ALTERNATIVE DOCTOR LOOKUP')
    console.log('---------------------------------------')
    
    try {
      const doctorResponse = await fetch(`/api/doctors/by-user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Doctor lookup API Status:', doctorResponse.status)
      
      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json()
        console.log('✅ Doctor lookup response:', doctorData)
        
        if (doctorData.success && doctorData.doctor) {
          console.log('✅ Doctor found via alternative lookup')
          console.log('Doctor:', doctorData.doctor)
        } else {
          console.log('❌ No doctor found via alternative lookup')
        }
      } else {
        const errorText = await doctorResponse.text()
        console.log('❌ Doctor lookup API failed:', errorText)
      }
    } catch (error) {
      console.log('❌ Doctor lookup error:', error.message)
    }
    
    // 4. Check all doctors endpoint
    console.log('\n4. 👥 CHECKING ALL DOCTORS')
    console.log('-------------------------')
    
    try {
      const allDoctorsResponse = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (allDoctorsResponse.ok) {
        const allDoctors = await allDoctorsResponse.json()
        console.log('✅ All doctors:', allDoctors)
        
        if (allDoctors.doctors && allDoctors.doctors.length > 0) {
          console.log(`Found ${allDoctors.doctors.length} doctors in system`)
          
          // Check if current user is among the doctors
          const currentUserDoctor = allDoctors.doctors.find(doc => 
            doc.email === userEmail || doc.userId === userId
          )
          
          if (currentUserDoctor) {
            console.log('✅ Current user found in doctors list:', currentUserDoctor)
          } else {
            console.log('❌ Current user NOT found in doctors list')
            console.log('Available doctors:', allDoctors.doctors.map(d => ({ 
              id: d.id, 
              email: d.email, 
              name: `${d.firstName} ${d.lastName}`,
              userId: d.userId 
            })))
          }
        } else {
          console.log('❌ No doctors found in system')
        }
      } else {
        console.log('❌ All doctors API failed:', allDoctorsResponse.status)
      }
    } catch (error) {
      console.log('❌ All doctors error:', error.message)
    }
    
    // 5. Suggest solutions
    console.log('\n5. 💡 SUGGESTED SOLUTIONS')
    console.log('------------------------')
    
    if (!token || !userId) {
      console.log('🔧 Solution: Log in again')
    } else {
      console.log('🔧 Possible solutions:')
      console.log('   1. User role is not "DOCTOR" - check user.role')
      console.log('   2. Doctor profile not created for this user')
      console.log('   3. User-Doctor relationship not established')
      console.log('   4. Database seeding issue')
      console.log('\n📝 To fix: Run the database seeding script or create doctor profile manually')
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Also provide manual login function
window.debugLogin = function() {
  console.log('🔐 Available test accounts:')
  console.log('1. Doctor: john.smith@hospital.com / password123')
  console.log('2. Patient: jane.doe@email.com / password123')
  console.log('\n🔧 To log in manually, go to /login page')
}

// Run the debug
debugDoctorProfile()

console.log('\n📝 Additional commands:')
console.log('- window.debugLogin() - Show available test accounts')
console.log('- localStorage.clear() - Clear all auth data')
console.log('- window.location.href = "/login" - Go to login page')
