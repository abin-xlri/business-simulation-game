#!/bin/bash

# Deployment script for Business Simulation Game
# Usage: ./scripts/deploy.sh [frontend|backend|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please install it first: npm i -g vercel"
        exit 1
    fi
    
    cd frontend
    
    # Build the project
    print_status "Building frontend..."
    npm run build
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod
    
    cd ..
    print_status "Frontend deployment completed!"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed. Please install it first: npm i -g @railway/cli"
        exit 1
    fi
    
    cd backend
    
    # Build the project
    print_status "Building backend..."
    npm run build
    
    # Deploy to Railway
    print_status "Deploying to Railway..."
    railway up
    
    cd ..
    print_status "Backend deployment completed!"
}

# Function to deploy both
deploy_all() {
    print_status "Deploying both frontend and backend..."
    deploy_backend
    deploy_frontend
    print_status "Full deployment completed!"
}

# Function to check environment
check_environment() {
    print_status "Checking deployment environment..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check if .env files exist
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env file not found. Please create it with required environment variables"
    fi
    
    if [ ! -f "frontend/.env.local" ]; then
        print_warning "frontend/.env.local file not found. Please create it with required environment variables"
    fi
    
    print_status "Environment check completed"
}

# Main script logic
case "${1:-all}" in
    "frontend")
        check_environment
        deploy_frontend
        ;;
    "backend")
        check_environment
        deploy_backend
        ;;
    "all")
        check_environment
        deploy_all
        ;;
    *)
        print_error "Usage: $0 [frontend|backend|all]"
        print_error "Default: all"
        exit 1
        ;;
esac 