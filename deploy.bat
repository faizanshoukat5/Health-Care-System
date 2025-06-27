@echo off
echo 🏥 Healthcare Management Platform - Windows Deployment
echo ==================================================

echo ✅ Checking prerequisites...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is required but not installed.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is required but not installed.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

echo 📦 Installing dependencies...
call npm install

echo 🔨 Building production bundle...
call npm run build

echo 🗄️ Generating Prisma client...
call npm run db:generate

echo.
echo ✅ Build completed successfully!
echo.
echo 🚀 Deployment Options:
echo ======================
echo.
echo 1. 🔷 Vercel (Recommended)
echo    Visit: https://vercel.com
echo    Steps: Connect GitHub → Set env vars → Deploy
echo.
echo 2. 🚂 Railway
echo    Visit: https://railway.app
echo    Steps: Import from GitHub → Add PostgreSQL → Configure
echo.
echo 3. ☁️ Cloud Providers
echo    AWS, DigitalOcean, Google Cloud
echo.
echo 📝 Important: Set these environment variables in production:
echo - DATABASE_URL (PostgreSQL connection string)
echo - JWT_SECRET (32+ character secret)
echo - NEXTAUTH_SECRET (32+ character secret)
echo - NEXTAUTH_URL (your production domain)
echo.
echo 🔒 HIPAA Compliance Note:
echo For healthcare applications, ensure your hosting provider
echo offers Business Associate Agreements (BAA) and meets
echo HIPAA compliance requirements.
echo.
echo ✅ Ready for deployment! See DEPLOYMENT.md for details.
pause
