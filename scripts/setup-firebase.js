#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔥 Firebase Setup for Healthcare Management Platform');
console.log('================================================\n');

// Generate secure secrets
function generateSecrets() {
  return {
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex'),
    JWT_SECRET: crypto.randomBytes(32).toString('hex'),
  };
}

const secrets = generateSecrets();

console.log('📋 STEP-BY-STEP FIREBASE SETUP:\n');

console.log('1️⃣  CREATE FIREBASE PROJECT:');
console.log('   • Go to: https://console.firebase.google.com/');
console.log('   • Click "Add project"');
console.log('   • Project name: "Healthcare Management Platform"');
console.log('   • Enable Google Analytics (recommended)');
console.log('   • Create project\n');

console.log('2️⃣  ENABLE FIREBASE SERVICES:');
console.log('   • Authentication: Enable Email/Password');
console.log('   • Firestore Database: Create in production mode');
console.log('   • Storage: Enable for medical document uploads');
console.log('   • Hosting: Enable for web deployment\n');

console.log('3️⃣  GET FIREBASE CONFIG:');
console.log('   • Go to Project Settings > General');
console.log('   • Scroll down to "Your apps"');
console.log('   • Click "Add app" > Web app');
console.log('   • Register app name: "Healthcare Platform"');
console.log('   • Copy the firebaseConfig object\n');

console.log('4️⃣  CREATE SERVICE ACCOUNT:');
console.log('   • Go to Project Settings > Service accounts');
console.log('   • Click "Generate new private key"');
console.log('   • Download the JSON file');
console.log('   • Save it securely (DO NOT commit to Git)\n');

console.log('5️⃣  COPY THIS TO YOUR .env.local FILE:\n');

const envTemplate = `# ================================
# FIREBASE CLIENT CONFIGURATION (PUBLIC)
# ================================
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key-from-firebase-config"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef123456"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-ABCDEF123456"

# ================================
# FIREBASE ADMIN (FROM SERVICE ACCOUNT JSON)
# ================================
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET="your-project.appspot.com"

# ================================
# GENERATED SECURE SECRETS
# ================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${secrets.NEXTAUTH_SECRET}"
JWT_SECRET="${secrets.JWT_SECRET}"

# ================================
# OPTIONAL SERVICES
# ================================
# Email notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# SMS notifications
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-phone"

# Payment processing
STRIPE_SECRET_KEY="sk_test_your-stripe-secret"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-public"

NODE_ENV="development"`;

console.log(envTemplate);

console.log('\n6️⃣  FIREBASE RULES SETUP:');
console.log('   Copy these Firestore security rules:\n');

const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Patients can read/write their own data
    match /patients/{patientId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == patientId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Doctors can read their own data and patient data they treat
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == doctorId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Appointments - patients and doctors can access their own
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Medical records - only patient, treating doctor, and admin
    match /medical_records/{recordId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Admin can access everything
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`;

console.log(firestoreRules);

console.log('\n7️⃣  STORAGE RULES:');
console.log('   Copy these Storage security rules:\n');

const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Medical documents - only accessible by patient, doctor, and admin
    match /medical-documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'doctor' ||
         request.auth.token.role == 'admin');
    }
    
    // Profile pictures
    match /profile-pictures/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

console.log(storageRules);

console.log('\n🚀 NEXT STEPS:');
console.log('1. Complete the Firebase setup above');
console.log('2. Update your .env.local file with the actual values');
console.log('3. Run: npm run dev');
console.log('4. Test the Firebase connection');
console.log('5. Deploy to Vercel with environment variables\n');

console.log('⚠️  SECURITY REMINDERS:');
console.log('• Never commit .env.local to Git');
console.log('• Keep your Firebase service account key secure');
console.log('• Enable Firebase App Check for production');
console.log('• Regular security audits for HIPAA compliance\n');

// Write the environment template to a file
const fs = require('fs');
fs.writeFileSync('.env.local.template', envTemplate);
console.log('📄 Environment template saved to: .env.local.template');
console.log('🔧 Edit this file and rename it to .env.local');
