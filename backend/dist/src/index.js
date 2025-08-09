"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const round1Routes_1 = __importDefault(require("./routes/round1Routes"));
const partnerSelectionRoutes_1 = __importDefault(require("./routes/partnerSelectionRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const crisisRoutes_1 = __importDefault(require("./routes/crisisRoutes"));
const scoringRoutes_1 = __importDefault(require("./routes/scoringRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
// player routes file exists under routes directory
const playerRoutes_1 = __importDefault(require("./routes/playerRoutes"));
// Middleware
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Socket handlers
const groupSocketHandler_1 = require("./socket/groupSocketHandler");
const socketService_1 = require("./services/socketService");
const io_1 = require("./services/io");
// Load environment variables
dotenv_1.default.config();
console.log('=== BUSINESS SIMULATION SERVER (TypeScript) ===');
console.log('Build timestamp: ' + new Date().toISOString());
// Create Express app
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Normalize and support multiple CORS origins (comma-separated), trim trailing slashes
const parseOrigins = (value) => {
    if (!value)
        return [];
    return value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s.replace(/\/$/, ''));
};
const allowedOrigins = Array.from(new Set([
    ...parseOrigins(process.env.CORS_ORIGIN),
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
])).filter(Boolean);
// Create Socket.io server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const normalized = origin.replace(/\/$/, '');
            if (allowedOrigins.includes(normalized))
                return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
});
// Initialize socket handlers
(0, io_1.setIO)(io);
new groupSocketHandler_1.GroupSocketHandler(io);
new socketService_1.SocketService(io);
// Global middleware
app.use((0, helmet_1.default)());
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const normalized = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalized))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
app.use('/api', rateLimiter_1.apiLimiter);
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
app.use('/api', healthRoutes_1.default);
app.use('/api/auth', rateLimiter_1.authLimiter, authRoutes_1.default);
app.use('/api/round1', round1Routes_1.default);
app.use('/api/partner-selection', partnerSelectionRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/crisis', crisisRoutes_1.default);
app.use('/api/scoring', scoringRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/game', gameRoutes_1.default);
app.use('/api/companies', companyRoutes_1.default);
app.use('/api/players', playerRoutes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});
// Error handler
app.use(errorHandler_1.enhancedErrorHandler);
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
exports.default = app;
//# sourceMappingURL=index.js.map