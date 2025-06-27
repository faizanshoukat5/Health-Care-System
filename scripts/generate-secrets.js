#!/usr/bin/env node

const crypto = require('crypto');

function generateSecrets() {
  const secrets = {
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex'),
    JWT_SECRET: crypto.randomBytes(32).toString('hex'),
    ENCRYPTION_KEY: crypto.randomBytes(16).toString('hex'), // 32 characters for AES-256
  };
  
  console.log('🔐 Generated Secure Secrets for Healthcare Platform:');
  console.log('================================================\n');
  
  console.log('Copy these to your .env.local file:\n');
  
  Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}="${value}"`);
  });
  
  console.log('\n⚠️  IMPORTANT: Keep these secrets secure and never commit them to version control!');
  console.log('📝 These are required for HIPAA-compliant encryption of medical data.\n');
  
  return secrets;
}

// Generate and display secrets
const secrets = generateSecrets();

// Create .env.local template
const envTemplate = `# Healthcare Management Platform - Environment Variables
# Generated on ${new Date().toISOString()}

# ================================
# DATABASE CONFIGURATION
# ================================
DATABASE_URL="postgresql://username:password@localhost:5432/healthcare?sslmode=prefer"

# ================================
# AUTHENTICATION & SECURITY
# ================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${secrets.NEXTAUTH_SECRET}"
JWT_SECRET="${secrets.JWT_SECRET}"

# HIPAA-compliant encryption for medical data
ENCRYPTION_KEY="${secrets.ENCRYPTION_KEY}"

# ================================
# EMAIL SERVICE (Healthcare Notifications)
# ================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-healthcare-email@gmail.com"
SMTP_PASS="your-app-specific-password"

# ================================
# FILE STORAGE (Medical Records)
# ================================
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_BUCKET_NAME="healthcare-documents"
AWS_REGION="us-east-1"

# ================================
# SMS/PHONE NOTIFICATIONS
# ================================
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-phone"

# ================================
# PAYMENT PROCESSING (Billing)
# ================================
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"

# ================================
# TELEMEDICINE (Video Calls)
# ================================
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-certificate"

# ================================
# ENVIRONMENT
# ================================
NODE_ENV="development"
`;

require('fs').writeFileSync('.env.local.template', envTemplate);
console.log('📄 Created .env.local.template file with secure configuration!');
console.log('🔧 Edit the template file and rename it to .env.local');
