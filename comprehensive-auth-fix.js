// Comprehensive Auth Sync Fix
// Run this in browser console to fix auth storage issues

console.log('🔧 COMPREHENSIVE AUTH SYNC FIX')
console.log('==============================')

async function fixAuthSync() {
  try {
    console.log('🔍 Checking current auth state...')
    
    // Check what's in localStorage
    const localToken = localStorage.getItem('token')
    const localUserId = localStorage.getItem('userId')
    const localUserEmail = localStorage.getItem('userEmail')
    const localUserRole = localStorage.getItem('userRole')
    
    // Check what's in Zustand storage
    const authStorage = localStorage.getItem('auth-storage')
    let zustandAuth = null
    try {
      zustandAuth = authStorage ? JSON.parse(authStorage) : null
    } catch (e) {
      console.log('⚠️ Invalid Zustand auth data')
    }
    
    console.log('📊 Current Auth State:')
    console.log('  Local Storage Token:', !!localToken)
    console.log('  Local Storage User ID:', localUserId)
    console.log('  Local Storage Email:', localUserEmail)
    console.log('  Local Storage Role:', localUserRole)
    console.log('  Zustand Auth:', zustandAuth)
    
    // If we have a Zustand token but no localStorage token, sync them
    if (zustandAuth?.state?.token && !localToken) {
      console.log('🔄 Syncing Zustand to localStorage...')
      localStorage.setItem('token', zustandAuth.state.token)
      if (zustandAuth.state.user) {
        localStorage.setItem('userId', zustandAuth.state.user.id)
        localStorage.setItem('userEmail', zustandAuth.state.user.email)
        localStorage.setItem('userRole', zustandAuth.state.user.role)
      }
      window.location.reload()
      return
    }
    
    // If we have localStorage but no Zustand, try to restore from known good auth
    if (!zustandAuth?.state?.token || !localToken) {
      console.log('🔄 No valid auth found, attempting fresh login...')
      
      // Try the most likely doctor account
      const doctorAccounts = [
        'dr.smith@healthcare.com',
        'dr.johnson@healthcare.com', 
        'asd1@gmail.com'
      ]
      
      for (const email of doctorAccounts) {
        console.log(`🔍 Trying ${email}...`)
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Login successful with ${email}`)
            
            // Store in both localStorage and prepare for Zustand
            localStorage.setItem('token', data.token)
            localStorage.setItem('userId', data.user.id)
            localStorage.setItem('userEmail', data.user.email)
            localStorage.setItem('userRole', data.user.role)
            
            // Store in Zustand format
            const zustandData = {
              state: {
                user: data.user,
                token: data.token,
                isLoading: false
              },
              version: 0
            }
            localStorage.setItem('auth-storage', JSON.stringify(zustandData))
            
            console.log('✅ Auth synced to both storage systems')
            console.log('🔄 Reloading page...')
            window.location.reload()
            return
          }
        } catch (error) {
          console.log(`❌ ${email} failed:`, error.message)
        }
      }
      
      // If all failed, clear everything and redirect to login
      console.log('❌ All login attempts failed, redirecting to login...')
      localStorage.clear()
      window.location.href = '/login'
    }
    
  } catch (error) {
    console.error('❌ Auth sync fix failed:', error)
    localStorage.clear()
    window.location.href = '/login'
  }
}

// Provide manual fix functions
window.clearAllAuth = function() {
  localStorage.clear()
  sessionStorage.clear()
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  console.log('🧹 All auth data cleared')
  window.location.href = '/login'
}

window.forceLoginDoctor = function(email = 'dr.smith@healthcare.com') {
  console.log(`🔐 Force login as ${email}...`)
  
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Force login successful:', data)
    
    // Clear everything first
    localStorage.clear()
    
    // Set all auth data
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.user.id)
    localStorage.setItem('userEmail', data.user.email)
    localStorage.setItem('userRole', data.user.role)
    
    // Set Zustand storage
    const zustandData = {
      state: { user: data.user, token: data.token, isLoading: false },
      version: 0
    }
    localStorage.setItem('auth-storage', JSON.stringify(zustandData))
    
    console.log('🎉 All auth data set, redirecting...')
    window.location.href = '/doctor/schedule'
  })
  .catch(error => {
    console.error('❌ Force login failed:', error)
  })
}

// Run the comprehensive fix
fixAuthSync()

console.log('\n📝 Emergency Commands:')
console.log('- window.clearAllAuth() - Clear all auth data and go to login')
console.log('- window.forceLoginDoctor() - Force login as Dr. Smith and go to schedule')
console.log('- window.forceLoginDoctor("dr.johnson@healthcare.com") - Force login as Dr. Johnson')
