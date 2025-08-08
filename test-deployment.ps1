# Test Deployment Configuration Script
# This script helps test the deployment configuration locally

Write-Host "🧪 Business Simulation Game - Deployment Test" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found project root directory" -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Stop any running containers
Write-Host "`n🛑 Stopping any running containers..." -ForegroundColor Yellow
docker-compose down

# Build the containers
Write-Host "`n🏗️ Building containers..." -ForegroundColor Yellow
docker-compose build

# Start the containers in production mode
Write-Host "`n🚀 Starting containers in production mode..." -ForegroundColor Yellow
docker-compose up -d

# Wait for containers to start
Write-Host "`n⏳ Waiting for containers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if containers are running
Write-Host "`n🔍 Checking container status..." -ForegroundColor Yellow
docker-compose ps

# Test backend health endpoint
Write-Host "`n🏥 Testing backend health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    Write-Host "Backend health endpoint response (Status: $($response.StatusCode)):" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor Gray
} catch {
    Write-Host "❌ Error accessing backend health endpoint: $_" -ForegroundColor Red
}

# Test frontend
Write-Host "`n🖥️ Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80" -UseBasicParsing
    Write-Host "Frontend response (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Frontend is accessible at http://localhost:80" -ForegroundColor Green
} catch {
    Write-Host "❌ Error accessing frontend: $_" -ForegroundColor Red
}

Write-Host "`n📋 Test Results:" -ForegroundColor Cyan
Write-Host "If all tests passed, your deployment configuration is correct." -ForegroundColor White
Write-Host "If any tests failed, check the error messages and fix the issues." -ForegroundColor White
Write-Host "`nTo stop the containers, run: docker-compose down" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green