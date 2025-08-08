# Deployment Verification Script
Write-Host "🔍 Verifying Deployment Setup..." -ForegroundColor Blue

# Check if we're in the right directory
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: frontend directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Check frontend build
Write-Host "🔨 Testing frontend build..." -ForegroundColor Yellow
Set-Location frontend

try {
    npm run build
    if (Test-Path "dist") {
        Write-Host "✅ Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed - dist directory not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Frontend build failed: $_" -ForegroundColor Red
    exit 1
}

# Check for security vulnerabilities
Write-Host "🔒 Checking for security vulnerabilities..." -ForegroundColor Yellow
try {
    $auditResult = npm audit --audit-level=moderate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No security vulnerabilities found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Security vulnerabilities found. Run 'npm audit fix --force' to fix them." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check security vulnerabilities" -ForegroundColor Yellow
}

# Check Vercel configuration
Write-Host "📋 Checking Vercel configuration..." -ForegroundColor Yellow
if (Test-Path "vercel.json") {
    Write-Host "✅ Vercel configuration found" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Vercel configuration found in frontend directory" -ForegroundColor Yellow
}

# Return to root
Set-Location ..

# Check backend build
Write-Host "🔨 Testing backend build..." -ForegroundColor Yellow
Set-Location backend

try {
    npm run build
    if (Test-Path "dist") {
        Write-Host "✅ Backend build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build failed - dist directory not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend build failed: $_" -ForegroundColor Red
    exit 1
}

# Return to root
Set-Location ..

Write-Host "🎉 Deployment verification completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up environment variables in Vercel and Railway" -ForegroundColor White
Write-Host "2. Deploy backend: npm run deploy:backend" -ForegroundColor White
Write-Host "3. Deploy frontend: npm run deploy:frontend" -ForegroundColor White
Write-Host "4. Test the deployment with 30-50 students" -ForegroundColor White
