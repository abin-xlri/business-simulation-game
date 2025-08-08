"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJoinSession = exports.validateCreateSession = exports.validateLogin = exports.validateRegister = exports.getCurrentSession = exports.joinSession = exports.createSession = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
function isAdminEmail(targetEmail) {
    const list = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
    return list.includes((targetEmail || '').trim().toLowerCase());
}
const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, name, password } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        // Validate password
        if (!(0, password_1.validatePassword)(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long and contain at least one letter and one number'
            });
        }
        // Hash password
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // Create user
        let user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'STUDENT' // Default role
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });
        // Auto-promote to admin if email is in ADMIN_EMAILS
        if (isAdminEmail(email) && user.role !== 'ADMIN') {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' },
                select: { id: true, email: true, name: true, role: true, createdAt: true }
            });
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Find user
        let user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Verify password
        const isValidPassword = await (0, password_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Auto-promote to admin if email is in ADMIN_EMAILS
        if (isAdminEmail(email) && user.role !== 'ADMIN') {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            });
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const createSession = async (req, res) => {
    try {
        const { name, maxParticipants } = req.body;
        const user = req.user;
        // Generate unique session code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Create session
        const session = await prisma.session.create({
            data: {
                name,
                code,
                maxParticipants: maxParticipants || 10,
                status: 'WAITING'
            }
        });
        res.status(201).json({
            message: 'Session created successfully',
            session
        });
    }
    catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createSession = createSession;
const joinSession = async (req, res) => {
    try {
        const { code } = req.body;
        const user = req.user;
        // Find session by code
        const session = await prisma.session.findUnique({
            where: { code },
            include: {
                userSessions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.status !== 'WAITING') {
            return res.status(400).json({ error: 'Session is not accepting new participants' });
        }
        if (session.userSessions.length >= session.maxParticipants) {
            return res.status(400).json({ error: 'Session is full' });
        }
        // Check if user is already in the session
        const existingUserSession = session.userSessions.find(us => us.user.id === user.userId);
        if (existingUserSession) {
            return res.status(400).json({ error: 'User is already in this session' });
        }
        // Add user to session
        await prisma.userSession.create({
            data: {
                userId: user.userId,
                sessionId: session.id
            }
        });
        res.json({
            message: 'Successfully joined session',
            session: {
                id: session.id,
                name: session.name,
                code: session.code,
                status: session.status,
                currentRound: session.currentRound,
                maxParticipants: session.maxParticipants,
                participants: session.userSessions.length + 1
            }
        });
    }
    catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.joinSession = joinSession;
const getCurrentSession = async (req, res) => {
    try {
        const user = req.user;
        // Find user's current session
        const userSession = await prisma.userSession.findFirst({
            where: { userId: user.userId },
            include: {
                session: {
                    include: {
                        userSessions: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        });
        if (!userSession) {
            return res.status(404).json({ error: 'No active session found' });
        }
        res.json({
            session: {
                id: userSession.session.id,
                name: userSession.session.name,
                code: userSession.session.code,
                status: userSession.session.status,
                currentRound: userSession.session.currentRound,
                maxParticipants: userSession.session.maxParticipants,
                participants: userSession.session.userSessions.map(us => ({
                    id: us.user.id,
                    name: us.user.name,
                    email: us.user.email,
                    joinedAt: us.joinedAt
                }))
            }
        });
    }
    catch (error) {
        console.error('Get current session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCurrentSession = getCurrentSession;
// Validation middleware
exports.validateRegister = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('password').isLength({ min: 8 })
];
exports.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
];
exports.validateCreateSession = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('maxParticipants').optional().isInt({ min: 1, max: 50 })
];
exports.validateJoinSession = [
    (0, express_validator_1.body)('code').trim().isLength({ min: 6, max: 6 })
];
//# sourceMappingURL=authController.js.map