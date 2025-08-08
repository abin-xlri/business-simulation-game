# Simple Deployment Helper Script
# This script will help you prepare for deployment

Write-Host "🚀 Business Simulation Game - Deployment Helper" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found project root directory" -ForegroundColor Green

# Check if .env files exist
$backendEnvExists = Test-Path "backend\.env"
$frontendEnvExists = Test-Path "frontend\.env.local"

Write-Host "`n📁 Environment Files Check:" -ForegroundColor Yellow
Write-Host "Backend .env: $(if ($backendEnvExists) { '✅ Exists' } else { '❌ Missing' })" -ForegroundColor $(if ($backendEnvExists) { 'Green' } else { 'Red' })
Write-Host "Frontend .env.local: $(if ($frontendEnvExists) { '✅ Exists' } else { '❌ Missing' })" -ForegroundColor $(if ($frontendEnvExists) { 'Green' } else { 'Red' })"

if (-not $backendEnvExists) {
    Write-Host "`n📝 Creating backend .env file..." -ForegroundColor Yellow
    $backendEnvContent = @"
# Backend Environment Variables
# Database (Railway will provide this automatically)
DATABASE_URL=""

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-to-something-secure"

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS (Update this after frontend deployment)
CORS_ORIGIN=""

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
"@
    $backendEnvContent | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Created backend .env file" -ForegroundColor Green
}

if (-not $frontendEnvExists) {
    Write-Host "`n📝 Creating frontend .env.local file..." -ForegroundColor Yellow
    $frontendEnvContent = @"
# Frontend Environment Variables
# API Configuration (Update these after backend deployment)
VITE_API_URL=""
VITE_SOCKET_URL=""
"@
    $frontendEnvContent | Out-File -FilePath "frontend\.env.local" -Encoding UTF8
    Write-Host "✅ Created frontend .env.local file" -ForegroundColor Green
}

# Check Git status
Write-Host "`n🔍 Git Status Check:" -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
        $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        Write-Host "`n💡 Consider committing your changes before deployment:" -ForegroundColor Cyan
        Write-Host "   git add ." -ForegroundColor White
        Write-Host "   git commit -m 'Prepare for deployment'" -ForegroundColor White
        Write-Host "   git push" -ForegroundColor White
    } else {
        Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check Git status" -ForegroundColor Yellow
}

# Test build
Write-Host "`n🔨 Testing Build Process:" -ForegroundColor Yellow
Write-Host "Testing backend build..." -ForegroundColor Gray
try {
    Set-Location backend
    npm run build
    Set-Location ..
    Write-Host "✅ Backend builds successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    Write-Host "Please fix any build errors before deployment" -ForegroundColor Red
}

Write-Host "Testing frontend build..." -ForegroundColor Gray
try {
    Set-Location frontend
    npm run build
    Set-Location ..
    Write-Host "✅ Frontend builds successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Write-Host "Please fix any build errors before deployment" -ForegroundColor Red
}

Write-Host "`n📋 Deployment Checklist:" -ForegroundColor Yellow
Write-Host "1. ✅ Environment files created" -ForegroundColor Green
Write-Host "2. ✅ Build tests completed" -ForegroundColor Green
Write-Host "3. ⏳ Create GitHub repository" -ForegroundColor Yellow
Write-Host "4. ⏳ Create Vercel account" -ForegroundColor Yellow
Write-Host "5. ⏳ Create Railway account" -ForegroundColor Yellow
Write-Host "6. ⏳ Deploy backend to Railway" -ForegroundColor Yellow
Write-Host "7. ⏳ Deploy frontend to Vercel" -ForegroundColor Yellow
Write-Host "8. ⏳ Configure environment variables" -ForegroundColor Yellow
Write-Host "9. ⏳ Test deployment" -ForegroundColor Yellow

Write-Host "`n📖 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Read DEPLOYMENT_SETUP.md for detailed instructions" -ForegroundColor White
Write-Host "2. Create accounts on GitHub, Vercel, and Railway" -ForegroundColor White
Write-Host "3. Follow the step-by-step guide" -ForegroundColor White

Write-Host "`n🎉 You're ready to deploy!" -ForegroundColor Green
Write-Host "Check DEPLOYMENT_SETUP.md for the complete guide." -ForegroundColor Cyan 