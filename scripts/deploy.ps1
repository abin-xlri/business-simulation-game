# Deployment script for Business Simulation Game (Windows PowerShell)
# Usage: .\scripts\deploy.ps1 [frontend|backend|all]

param(
    [Parameter(Position=0)]
    [ValidateSet("frontend", "backend", "all")]
    [string]$Target = "all"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to deploy frontend
function Deploy-Frontend {
    Write-Status "Deploying frontend to Vercel..."
    
    # Check if Vercel CLI is installed
    try {
        $null = Get-Command vercel -ErrorAction Stop
    }
    catch {
        Write-Error "Vercel CLI is not installed. Please install it first: npm i -g vercel"
        exit 1
    }
    
    Set-Location frontend
    
    # Build the project
    Write-Status "Building frontend..."
    npm run build
    
    # Deploy to Vercel
    Write-Status "Deploying to Vercel..."
    vercel --prod
    
    Set-Location ..
    Write-Status "Frontend deployment completed!"
}

# Function to deploy backend
function Deploy-Backend {
    Write-Status "Deploying backend to Railway..."
    
    # Check if Railway CLI is installed
    try {
        $null = Get-Command railway -ErrorAction Stop
    }
    catch {
        Write-Error "Railway CLI is not installed. Please install it first: npm i -g @railway/cli"
        exit 1
    }
    
    Set-Location backend
    
    # Build the project
    Write-Status "Building backend..."
    npm run build
    
    # Deploy to Railway
    Write-Status "Deploying to Railway..."
    railway up
    
    Set-Location ..
    Write-Status "Backend deployment completed!"
}

# Function to deploy both
function Deploy-All {
    Write-Status "Deploying both frontend and backend..."
    Deploy-Backend
    Deploy-Frontend
    Write-Status "Full deployment completed!"
}

# Function to check environment
function Test-Environment {
    Write-Status "Checking deployment environment..."
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Error "Please run this script from the project root directory"
        exit 1
    }
    
    # Check if .env files exist
    if (-not (Test-Path "backend\.env")) {
        Write-Warning "backend\.env file not found. Please create it with required environment variables"
    }
    
    if (-not (Test-Path "frontend\.env.local")) {
        Write-Warning "frontend\.env.local file not found. Please create it with required environment variables"
    }
    
    Write-Status "Environment check completed"
}

# Main script logic
Test-Environment

switch ($Target) {
    "frontend" {
        Deploy-Frontend
    }
    "backend" {
        Deploy-Backend
    }
    "all" {
        Deploy-All
    }
    default {
        Write-Error "Usage: .\scripts\deploy.ps1 [frontend|backend|all]"
        Write-Error "Default: all"
        exit 1
    }
} 