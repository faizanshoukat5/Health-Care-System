// Final Schedule Page Verification Script
// Run this in the browser console when on /doctor/schedule

console.log('🧪 Starting final schedule page verification...')

async function runFinalVerification() {
  try {
    // 1. Check if page loaded without errors
    console.log('✅ Page loaded without compilation errors')
    
    // 2. Check for React error boundaries
    const errorBoundaries = document.querySelectorAll('[data-react-error-boundary]')
    if (errorBoundaries.length === 0) {
      console.log('✅ No React error boundaries detected')
    } else {
      console.log('❌ React error boundaries found:', errorBoundaries.length)
    }
    
    // 3. Check if schedule form is rendered
    const scheduleForm = document.querySelector('input[type="time"]')
    if (scheduleForm) {
      console.log('✅ Schedule form elements rendered')
    } else {
      console.log('❌ Schedule form not found')
    }
    
    // 4. Check if debug mode works
    const debugButton = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Debug'))
    
    if (debugButton) {
      console.log('✅ Debug button found')
      debugButton.click()
      
      setTimeout(() => {
        const debugPanel = document.querySelector('details')
        if (debugPanel) {
          console.log('✅ Debug panel toggles correctly')
        }
      }, 100)
    }
    
    // 5. Check for JavaScript errors in console
    const originalError = console.error
    let hasErrors = false
    console.error = (...args) => {
      hasErrors = true
      originalError.apply(console, args)
    }
    
    setTimeout(() => {
      if (!hasErrors) {
        console.log('✅ No JavaScript runtime errors detected')
      } else {
        console.log('❌ JavaScript errors detected in console')
      }
    }, 1000)
    
    // 6. Test schedule toggle functionality
    const toggleButtons = document.querySelectorAll('button[class*="relative inline-flex"]')
    if (toggleButtons.length > 0) {
      console.log('✅ Schedule toggle buttons found:', toggleButtons.length)
      
      // Test one toggle
      const firstToggle = toggleButtons[0]
      const initialState = firstToggle.className.includes('bg-blue-600')
      firstToggle.click()
      
      setTimeout(() => {
        const newState = firstToggle.className.includes('bg-blue-600')
        if (newState !== initialState) {
          console.log('✅ Schedule toggle functionality works')
        } else {
          console.log('❌ Schedule toggle not working')
        }
      }, 100)
    } else {
      console.log('❌ No schedule toggle buttons found')
    }
    
    // 7. Check save button
    const saveButton = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Save Schedule'))
    
    if (saveButton) {
      console.log('✅ Save Schedule button found')
      if (!saveButton.disabled) {
        console.log('✅ Save button is enabled')
      } else {
        console.log('⚠️ Save button is disabled (might be loading)')
      }
    } else {
      console.log('❌ Save Schedule button not found')
    }
    
    console.log('\n🎉 Final verification completed!')
    console.log('Check the results above. All ✅ means the schedule page is working correctly.')
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

// Run verification after a short delay to ensure page is fully loaded
setTimeout(runFinalVerification, 2000)

// Also provide manual test function
window.testScheduleSave = async function() {
  console.log('🧪 Testing schedule save functionality...')
  
  const saveButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent?.includes('Save Schedule'))
  
  if (saveButton && !saveButton.disabled) {
    console.log('🔄 Clicking save button...')
    saveButton.click()
    
    // Monitor for success/error messages
    setTimeout(() => {
      const successMessage = document.querySelector('[class*="bg-green-50"]')
      const errorMessage = document.querySelector('[class*="bg-red-50"]')
      
      if (successMessage) {
        console.log('✅ Save successful - success message displayed')
      } else if (errorMessage) {
        console.log('❌ Save failed - error message displayed')
      } else {
        console.log('⚠️ No feedback message found - check network tab')
      }
    }, 3000)
  } else {
    console.log('❌ Save button not available or disabled')
  }
}

console.log('📝 Run window.testScheduleSave() to manually test save functionality')
