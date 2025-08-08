#!/bin/bash

# Deployment Script for Business Simulation
# Run this in terminal: chmod +x deploy-now.sh && ./deploy-now.sh

echo "🚀 Business Simulation Deployment Script"
echo "========================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ npm found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build the project
echo ""
echo "🔨 Building the project..."
npm run build

echo ""
echo "✅ Build complete!"

# Create env files
echo ""
echo "📝 Creating environment configuration files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Backend Environment Variables
DATABASE_URL=your_database_url_here
JWT_SECRET=your_secret_key_here_change_this_12345
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
PORT=3001
EOF
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
EOF
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists, skipping..."
fi

echo ""
echo "========================================"
echo "✅ SETUP COMPLETE!"
echo "========================================"

echo ""
echo "📋 NEXT STEPS:"
echo "1. Edit backend/.env and add your DATABASE_URL from Supabase/Railway"
echo "2. Run 'npm run dev' to start development server"
echo "3. Deploy to Railway (backend) and Vercel (frontend)"

echo ""
echo "🚀 DEPLOYMENT INSTRUCTIONS:"
echo "1. Railway: https://railway.app"
echo "   - Connect GitHub repo"
echo "   - Set root directory to /backend"
echo "   - Add environment variables"
echo ""
echo "2. Vercel: https://vercel.com"
echo "   - Import GitHub repo"
echo "   - Set root directory to /frontend"
echo "   - Add VITE_API_URL pointing to Railway"

echo ""
echo "📖 Full guide: QUICK_DEPLOYMENT.md"
echo "========================================"
