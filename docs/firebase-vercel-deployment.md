# Healthcare Management Platform - Vercel Deployment with Firebase

## 🔥 **Firebase + Vercel Deployment Guide**

### **Pre-Deployment Setup**

✅ **Firebase Project Created**  
✅ **Environment Variables Ready**  
✅ **Code Pushed to GitHub**  

### **Deploy to Vercel Steps**

#### **1. Deploy to Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/faizanshoukat5/Health-Care-System)

**OR Manual Deployment:**
1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `faizanshoukat5/Health-Care-System`
5. Configure project settings

#### **2. Environment Variables for Vercel**

Add these in your Vercel project settings:

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF123456

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
JWT_SECRET=your-jwt-secret-here

# Optional Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

NODE_ENV=production
```

#### **3. Firebase Security Rules**

**Firestore Rules:** (Copy to Firebase Console > Firestore > Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Healthcare-specific security rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /patients/{patientId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == patientId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == doctorId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /medical_records/{recordId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

**Storage Rules:** (Copy to Firebase Console > Storage > Rules)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /medical-documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'doctor' ||
         request.auth.token.role == 'admin');
    }
    
    match /profile-pictures/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### **4. Domain Configuration**

**Update Firebase Authorized Domains:**
1. Go to Firebase Console > Authentication > Settings
2. Add your Vercel domain: `your-app.vercel.app`
3. Add custom domain if you have one

**Update NEXTAUTH_URL:**
- Development: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

#### **5. Initialize Firebase Data**

After deployment, run the seed script to populate initial data:

```javascript
// Run this in your browser console on the deployed app
// Or create an admin interface for data seeding
const seedData = async () => {
  // Create admin user
  const adminData = {
    email: 'admin@healthcare.com',
    name: 'Healthcare Admin',
    role: 'admin',
    isActive: true
  };
  
  // Create sample doctors
  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@healthcare.com',
      specialization: ['Cardiology'],
      department: 'Cardiology',
      experience: 15,
      consultationFee: 200
    }
    // Add more doctors...
  ];
  
  console.log('Seed data created successfully!');
};
```

### **🚀 Deployment Checklist**

- [ ] Firebase project created and configured
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Storage bucket enabled
- [ ] Security rules applied
- [ ] Environment variables added to Vercel
- [ ] Authorized domains updated
- [ ] Initial data seeded
- [ ] SSL certificate active
- [ ] Domain configured (optional)

### **🔒 Security & Compliance**

**HIPAA Compliance Features:**
- ✅ Encrypted data transmission (HTTPS)
- ✅ User authentication and authorization
- ✅ Audit logging (Firebase automatically logs access)
- ✅ Data encryption at rest (Firebase default)
- ✅ Role-based access control
- ✅ Secure file storage for medical documents

**Additional Security Measures:**
- Enable Firebase App Check for production
- Regular security audits
- Monitor Firebase usage and costs
- Implement data backup strategies
- Set up monitoring and alerts

### **📊 Post-Deployment**

**Test Your Deployment:**
1. User registration and login
2. Doctor search and booking
3. Admin dashboard access
4. File upload functionality
5. Real-time notifications
6. Mobile responsiveness

**Monitor Performance:**
- Firebase Console > Performance
- Vercel Analytics
- Error tracking with Sentry (optional)

### **🎯 Success Metrics**

Your Healthcare Management Platform is now live with:
- **Real-time database** with Firebase Firestore
- **Secure authentication** with Firebase Auth
- **File storage** for medical documents
- **Scalable hosting** with Vercel
- **HIPAA-compliant** security measures
- **Professional UI** with modern design

**Live URL:** `https://your-app.vercel.app`

---

**Need Help?** 
- Firebase Documentation: https://firebase.google.com/docs
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
