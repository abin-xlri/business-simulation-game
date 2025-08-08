"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const winston_1 = __importDefault(require("winston"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const playerRoutes_1 = __importDefault(require("./routes/playerRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const round1Routes_1 = __importDefault(require("./routes/round1Routes"));
const partnerSelectionRoutes_1 = __importDefault(require("./routes/partnerSelectionRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const crisisRoutes_1 = __importDefault(require("./routes/crisisRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const scoringRoutes_1 = __importDefault(require("./routes/scoringRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
// Import socket handlers
const socketService_1 = require("./services/socketService");
const groupSocketHandler_1 = require("./socket/groupSocketHandler");
const adminController_1 = require("./controllers/adminController");
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
// Create Express app
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Create Socket.io server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
// Configure logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'business-simulation-backend' },
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' })
    ]
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
// Health check endpoint
app.use('/api', healthRoutes_1.default);
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/players', playerRoutes_1.default);
app.use('/api/game', gameRoutes_1.default);
app.use('/api/companies', companyRoutes_1.default);
app.use('/api/round1', round1Routes_1.default);
app.use('/api/partner-selection', partnerSelectionRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/crisis', crisisRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/scoring', scoringRoutes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Setup Socket.io handlers
(0, socketService_1.setupSocketHandlers)(io);
// Setup Group Socket.io handlers
new groupSocketHandler_1.GroupSocketHandler(io);
// Setup admin controller io instance
(0, adminController_1.setIO)(io);
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map