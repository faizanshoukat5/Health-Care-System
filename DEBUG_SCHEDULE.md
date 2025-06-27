🔍 DOCTOR SCHEDULE DEBUGGING GUIDE
===================================

🧪 TEST STEPS:
1. Open browser dev tools (F12)
2. Go to Console tab to see debug logs
3. Login with correct credentials:
   Email: dr.smith@healthcare.com
   Password: password123

4. Navigate to: Doctor → Schedule
5. Watch console for debug messages

📊 EXPECTED CONSOLE OUTPUT:
🔍 Fetching doctor profile for userId: [some-uuid]
👤 User API response status: 200
👤 User data received: { user: { doctor: { id: "...", ... } } }
👨‍⚕️ Found doctor ID: [doctor-uuid]
👨‍⚕️ Doctor dashboard API response status: 200
👨‍⚕️ Doctor dashboard data received: { doctor: { ... } }
📅 Fetching schedule for doctorId: [doctor-uuid]
📅 Schedule API response status: 200 or 404
📅 Schedule data received: { availability: { ... } }

❌ IF YOU SEE ERRORS:
- Check the exact error message in console
- Note which API call is failing
- Check Network tab for failed requests
- Verify you're using the correct email: dr.smith@healthcare.com

🛠️  COMMON ISSUES:
1. "User not found" → Check if you're logged in with dr.smith@healthcare.com
2. "No doctor profile found" → Database may need seeding
3. "Unauthorized" → Token expired, try logging out and back in
4. "Access denied" → User role or permissions issue

🎯 The page now has detailed logging to help identify the exact issue!
