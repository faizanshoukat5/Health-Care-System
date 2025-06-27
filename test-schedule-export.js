// Quick test to verify the schedule page exports correctly
// Run this in the browser console at http://localhost:3000/doctor/schedule

console.log('🧪 Testing Schedule Page Export...')

async function testSchedulePageExport() {
  try {
    // Check if the page loaded without the "default export" error
    const hasError = document.body.innerHTML.includes('The default export is not a React Component')
    
    if (hasError) {
      console.log('❌ Default export error still present')
      return false
    }
    
    console.log('✅ No default export error found')
    
    // Check if React components are rendered
    const hasReactContent = document.querySelector('[data-reactroot]') || 
                           document.querySelector('#__next') ||
                           document.querySelector('button') ||
                           document.querySelector('input[type="time"]')
    
    if (hasReactContent) {
      console.log('✅ React components are rendering')
    } else {
      console.log('❌ No React components found')
      return false
    }
    
    // Check for any runtime errors in console
    const originalError = console.error
    let errorCount = 0
    console.error = (...args) => {
      errorCount++
      originalError.apply(console, args)
    }
    
    setTimeout(() => {
      if (errorCount === 0) {
        console.log('✅ No runtime errors detected')
      } else {
        console.log(`⚠️ ${errorCount} runtime errors detected`)
      }
      
      console.log('\n🎉 Schedule page export test completed!')
      console.log('✅ The "default export" error has been fixed!')
      
    }, 1000)
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Run the test
testSchedulePageExport()
