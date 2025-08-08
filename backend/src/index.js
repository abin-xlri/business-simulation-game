const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

console.log('=== BUSINESS SIMULATION SERVER ===');
console.log('Starting server...');

// Create Express app
const app = express();
const server = createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({
    success: true,
    message: 'Business Simulation Game Backend API - DEPLOYED',
    version: '1.0.1',
    status: 'running',
    timestamp: new Date().toISOString(),
    deployment: 'railway-production',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      players: '/api/players',
      game: '/api/game',
      companies: '/api/companies',
      round1: '/api/round1',
      groups: '/api/groups',
      crisis: '/api/crisis',
      admin: '/api/admin',
      scoring: '/api/scoring'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check accessed');
  res.json({ 
    success: true, 
    message: 'Server is healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Test routes
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ success: true, message: 'Test route working' });
});

app.get('/testing', (req, res) => {
  console.log('Testing route accessed');
  res.json({ success: true, message: 'Testing route working' });
});

// API Routes - Round 1
app.get('/api/round1/stations', (req, res) => {
  console.log('Round 1 stations requested');
  const stations = [
    { id: 1, name: 'Mumbai Central', region: 'West', riskLevel: 'Low' },
    { id: 2, name: 'Delhi Junction', region: 'North', riskLevel: 'Medium' },
    { id: 3, name: 'Chennai Port', region: 'South', riskLevel: 'High' },
    { id: 4, name: 'Kolkata Hub', region: 'East', riskLevel: 'Medium' },
    { id: 5, name: 'Bangalore Terminal', region: 'South', riskLevel: 'Low' }
  ];
  res.json({ success: true, stations });
});

app.post('/api/round1/calculate-route', (req, res) => {
  console.log('Route calculation requested');
  const { route } = req.body;
  
  if (!route || route.length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Route must have at least 2 stations' 
    });
  }

  // Simple calculation
  const totalDistance = route.length * 150; // km
  const totalTime = route.length * 2; // hours
  const revenue = totalDistance * 10; // $ per km
  const costs = totalDistance * 5; // $ per km
  const profit = revenue - costs;

  res.json({
    success: true,
    route,
    metrics: {
      totalDistance,
      totalTime,
      revenue,
      costs,
      profit
    }
  });
});

// API Routes - Round 2
app.get('/api/round2/markets', (req, res) => {
  console.log('Round 2 markets requested');
  const markets = [
    { id: 1, name: 'Domestic Market', growthRate: 0.15, competition: 'Medium' },
    { id: 2, name: 'International Market', growthRate: 0.25, competition: 'High' },
    { id: 3, name: 'Emerging Markets', growthRate: 0.30, competition: 'Low' }
  ];
  res.json({ success: true, markets });
});

app.post('/api/round2/allocate-budget', (req, res) => {
  console.log('Budget allocation requested');
  const { allocations } = req.body;
  
  if (!allocations) {
    return res.status(400).json({ 
      success: false, 
      message: 'Budget allocations required' 
    });
  }

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const maxBudget = 1000000; // $1M

  if (totalAllocated > maxBudget) {
    return res.status(400).json({ 
      success: false, 
      message: 'Total allocation exceeds budget limit' 
    });
  }

  res.json({
    success: true,
    allocations,
    totalAllocated,
    remainingBudget: maxBudget - totalAllocated
  });
});

// API Routes - Round 3
app.get('/api/round3/crisis-data', (req, res) => {
  console.log('Round 3 crisis data requested');
  const crisisData = {
    scenario: 'Supply Chain Disruption',
    description: 'A major supplier has gone bankrupt, affecting 40% of your operations.',
    advisors: [
      { id: 1, name: 'Operations Expert', specialty: 'Supply Chain' },
      { id: 2, name: 'Financial Advisor', specialty: 'Risk Management' },
      { id: 3, name: 'Legal Counsel', specialty: 'Contract Law' }
    ],
    actions: [
      { id: 1, name: 'Find Alternative Suppliers', cost: 50000, impact: 'High' },
      { id: 2, name: 'Negotiate with Creditors', cost: 25000, impact: 'Medium' },
      { id: 3, name: 'Implement Emergency Protocols', cost: 10000, impact: 'Low' }
    ]
  };
  res.json({ success: true, crisisData });
});

app.get('/api/round3/reactivation-data', (req, res) => {
  console.log('Round 3 reactivation data requested');
  const reactivationData = {
    nodes: [
      { id: 1, name: 'Power Grid', dependencies: [], timeToRestore: 2 },
      { id: 2, name: 'Communication Network', dependencies: [1], timeToRestore: 1 },
      { id: 3, name: 'Transportation Hub', dependencies: [1, 2], timeToRestore: 3 },
      { id: 4, name: 'Data Center', dependencies: [1, 2], timeToRestore: 2 },
      { id: 5, name: 'Distribution Center', dependencies: [3, 4], timeToRestore: 1 }
    ]
  };
  res.json({ success: true, reactivationData });
});

// API Routes - Scoring
app.get('/api/scoring/dashboard', (req, res) => {
  console.log('Scoring dashboard requested');
  const scoringData = {
    round1: { score: 85, maxScore: 100, feedback: 'Excellent route optimization' },
    round2: { score: 78, maxScore: 100, feedback: 'Good market selection strategy' },
    round3: { score: 92, maxScore: 100, feedback: 'Outstanding crisis management' },
    total: { score: 255, maxScore: 300, percentage: 85 }
  };
  res.json({ success: true, scoringData });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 3001;

console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

server.listen(PORT, () => {
  console.log('=== BUSINESS SIMULATION SERVER STARTED SUCCESSFULLY ===');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log('=== READY TO ACCEPT REQUESTS ===');
});

// Error handling for server startup
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

module.exports = app;
