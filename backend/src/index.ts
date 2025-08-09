import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes';
import round1Routes from './routes/round1Routes';
import partnerSelectionRoutes from './routes/partnerSelectionRoutes';
import groupRoutes from './routes/groupRoutes';
import crisisRoutes from './routes/crisisRoutes';
import scoringRoutes from './routes/scoringRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import gameRoutes from './routes/gameRoutes';
import companyRoutes from './routes/companyRoutes';
// player routes file exists under routes directory
import playerRoutes from './routes/playerRoutes';

// Middleware
import { requestLogger } from './middleware/requestLogger';
import { enhancedErrorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';

// Socket handlers
import { GroupSocketHandler } from './socket/groupSocketHandler';
import { SocketService } from './services/socketService';
import { setIO } from './services/io';

// Load environment variables
dotenv.config();

console.log('=== BUSINESS SIMULATION SERVER (TypeScript) ===');
console.log('Build timestamp: ' + new Date().toISOString());

// Create Express app
const app = express();
const server = createServer(app);

// Normalize and support multiple CORS origins (comma-separated), trim trailing slashes
const parseOrigins = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/\/$/, ''));
};

const allowedOrigins = Array.from(
  new Set([
    ...parseOrigins(process.env.CORS_ORIGIN),
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ])
).filter(Boolean);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// Initialize socket handlers
setIO(io);
new GroupSocketHandler(io);
new SocketService(io);

// Global middleware
app.use(helmet());
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/api', apiLimiter);

// Root route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Business Simulation Game Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/round1', round1Routes);
app.use('/api/partner-selection', partnerSelectionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/players', playerRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use(enhancedErrorHandler);

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('=== BUSINESS SIMULATION SERVER STARTED ===');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Error handling for server startup
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

export default app;
