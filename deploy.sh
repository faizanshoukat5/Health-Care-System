#!/bin/bash

# Healthcare Management Platform - Production Deployment Script
# This script helps deploy your healthcare platform to production

echo "🏥 Healthcare Management Platform - Deployment Script"
echo "=================================================="

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building production bundle..."
npm run build

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

echo "✅ Build completed successfully!"

echo ""
echo "🚀 Deployment Options:"
echo "======================"
echo ""
echo "1. 🔷 Vercel (Recommended for Next.js)"
echo "   - Automatic deployments from GitHub"
echo "   - Built-in analytics and monitoring"
echo "   - Excellent Next.js integration"
echo "   - Free tier available"
echo ""
echo "2. 🚂 Railway"
echo "   - Full-stack deployment with database"
echo "   - PostgreSQL included"
echo "   - Simple pricing model"
echo ""
echo "3. ☁️ AWS/DigitalOcean"
echo "   - Enterprise-grade hosting"
echo "   - Full control over infrastructure"
echo "   - HIPAA compliance options"
echo ""

echo "📝 Next Steps:"
echo "=============="
echo ""
echo "For Vercel Deployment:"
echo "1. Visit https://vercel.com and create an account"
echo "2. Connect your GitHub repository"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy automatically"
echo ""
echo "For Railway Deployment:"
echo "1. Visit https://railway.app and create an account"
echo "2. Create new project from GitHub"
echo "3. Add PostgreSQL service"
echo "4. Configure environment variables"
echo ""

echo "🔒 Security Checklist:"
echo "====================="
echo "□ Set strong JWT secrets (32+ characters)"
echo "□ Configure HTTPS/SSL"
echo "□ Set up CORS policies"
echo "□ Enable rate limiting"
echo "□ Configure audit logging"
echo "□ Set up backup strategies"
echo "□ Review HIPAA compliance requirements"
echo ""

echo "📊 Monitoring Setup:"
echo "==================="
echo "□ Error tracking (Sentry)"
echo "□ Performance monitoring"
echo "□ Health checks"
echo "□ Database monitoring"
echo "□ Security alerts"
echo ""

echo "✅ Your healthcare platform is ready for deployment!"
echo "📋 See DEPLOYMENT.md for detailed instructions."
