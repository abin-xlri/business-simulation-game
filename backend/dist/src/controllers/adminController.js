"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const io_1 = require("../services/io");
const sessionOrchestrator_1 = require("../services/sessionOrchestrator");
// Legacy io reference removed in favor of getIO()
const prisma = new client_1.PrismaClient();
class AdminController {
    // Basic User Management
    static async listUsers(_req, res) {
        try {
            const users = await prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }
            });
            res.json({ success: true, users });
        }
        catch (error) {
            console.error('Error listing users:', error);
            res.status(500).json({ error: 'Failed to list users' });
        }
    }
    static async createUser(req, res) {
        try {
            const { email, name, password = 'Welcome123!', role = 'STUDENT' } = req.body;
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing)
                return res.status(400).json({ error: 'User already exists' });
            const { hashPassword } = await Promise.resolve().then(() => __importStar(require('../utils/password')));
            const user = await prisma.user.create({
                data: { email, name, password: await hashPassword(password), role },
                select: { id: true, email: true, name: true, role: true, createdAt: true }
            });
            res.status(201).json({ success: true, user, temporaryPassword: password });
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }
    static async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const { email, name, role, password } = req.body;
            const data = {};
            if (email !== undefined)
                data.email = email;
            if (name !== undefined)
                data.name = name;
            if (role !== undefined)
                data.role = role;
            if (password !== undefined && password.trim().length > 0) {
                const { hashPassword } = await Promise.resolve().then(() => __importStar(require('../utils/password')));
                data.password = await hashPassword(password);
            }
            const user = await prisma.user.update({
                where: { id: userId },
                data,
                select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }
            });
            res.json({ success: true, user });
        }
        catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            await prisma.user.delete({ where: { id: userId } });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
    // Session Management
    static async getSessions(req, res) {
        try {
            const sessions = await prisma.session.findMany({
                include: {
                    userSessions: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            userSessions: true,
                            routeCalculations: true,
                            partnerSelections: true,
                            crisisWebSubmissions: true,
                            reactivationSequences: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.json(sessions);
        }
        catch (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ error: 'Failed to fetch sessions' });
        }
    }
    static async updateSessionStatus(req, res) {
        try {
            const { sessionId } = req.params;
            const { status, currentRound } = req.body;
            const session = await prisma.session.update({
                where: { id: sessionId },
                data: {
                    status,
                    currentRound: currentRound || undefined
                }
            });
            // Broadcast session update to all connected clients
            try {
                (0, io_1.getIO)().to(sessionId).emit('session-updated', session);
            }
            catch { }
            res.json(session);
        }
        catch (error) {
            console.error('Error updating session:', error);
            res.status(500).json({ error: 'Failed to update session' });
        }
    }
    static async createSingleSession(req, res) {
        try {
            const { name, maxParticipants = 10 } = req.body;
            const session = await prisma.session.create({
                data: {
                    name,
                    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    maxParticipants,
                    status: 'WAITING',
                },
            });
            res.status(201).json({ success: true, session });
        }
        catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({ error: 'Failed to create session' });
        }
    }
    static async deleteSession(req, res) {
        try {
            const { sessionId } = req.params;
            // Ensure session exists
            const existing = await prisma.session.findUnique({ where: { id: sessionId } });
            if (!existing) {
                return res.status(404).json({ error: 'Session not found' });
            }
            // Cascade deletes are configured on relations via Prisma schema
            await prisma.session.delete({ where: { id: sessionId } });
            try {
                (0, io_1.getIO)().to(sessionId).emit('session:deleted', { sessionId });
            }
            catch { }
            return res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting session:', error);
            res.status(500).json({ error: 'Failed to delete session' });
        }
    }
    static async forceSubmitTask(req, res) {
        try {
            const pathSessionId = req.params.sessionId;
            const { sessionId: bodySessionId, userId, taskType } = req.body;
            const sessionId = pathSessionId || bodySessionId;
            if (!sessionId) {
                return res.status(400).json({ error: 'sessionId is required' });
            }
            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }
            if (!taskType) {
                return res.status(400).json({ error: 'taskType is required' });
            }
            // Create a default submission based on task type
            let submission;
            switch (taskType) {
                case 'route-calculation':
                    submission = await prisma.routeCalculation.create({
                        data: {
                            userId,
                            sessionId,
                            route: ['J', 'J'], // Default route
                            totalDistance: 0,
                            totalTime: 0,
                            coldChainBreaches: 0,
                            baseRevenue: 0,
                            regionalModifier: 0,
                            operatingCosts: 0,
                            penalties: 0,
                            netProfit: 0
                        }
                    });
                    break;
                case 'partner-selection':
                    submission = await prisma.partnerSelection.create({
                        data: {
                            userId,
                            sessionId,
                            partnerId: 'A', // Default selection
                            score: 0
                        }
                    });
                    break;
                case 'crisis-web':
                    submission = await prisma.crisisWebSubmission.create({
                        data: {
                            userId,
                            sessionId,
                            scenarioId: 'malaysia',
                            selectedAdvisors: [],
                            selectedActions: [],
                            totalCost: 0,
                            effectiveness: 0,
                            riskLevel: 'LOW'
                        }
                    });
                    break;
                case 'reactivation':
                    submission = await prisma.reactivationSequence.create({
                        data: {
                            userId,
                            sessionId,
                            sequence: [],
                            totalDuration: 0,
                            criticalPathTime: 0,
                            riskScore: 0,
                            resourceUtilization: {}
                        }
                    });
                    break;
            }
            // Broadcast force submit event
            try {
                (0, io_1.getIO)().to(sessionId).emit('task-force-submitted', { userId, taskType, submission });
            }
            catch { }
            res.json({ success: true, submission });
        }
        catch (error) {
            console.error('Error force submitting task:', error);
            res.status(500).json({ error: 'Failed to force submit task' });
        }
    }
    static async forceSubmitAllCurrentTask(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await prisma.session.findUnique({ where: { id: sessionId } });
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            // Get all participants
            const userSessions = await prisma.userSession.findMany({ where: { sessionId }, select: { userId: true } });
            const participantIds = new Set(userSessions.map((us) => us.userId));
            let createdCount = 0;
            switch (session.task) {
                case 'ROUND1_TASK1': {
                    const existing = await prisma.routeCalculation.findMany({ where: { sessionId }, select: { userId: true } });
                    const haveSubmitted = new Set(existing.map((e) => e.userId));
                    const missing = [...participantIds].filter(uid => !haveSubmitted.has(uid));
                    for (const userId of missing) {
                        await prisma.routeCalculation.create({
                            data: {
                                userId,
                                sessionId,
                                route: ['J', 'J'],
                                totalDistance: 0,
                                totalTime: 0,
                                coldChainBreaches: 0,
                                baseRevenue: 0,
                                regionalModifier: 0,
                                operatingCosts: 0,
                                penalties: 0,
                                netProfit: 0,
                            },
                        });
                        createdCount++;
                    }
                    break;
                }
                case 'ROUND1_TASK2': {
                    const existing = await prisma.partnerSelection.findMany({ where: { sessionId }, select: { userId: true } });
                    const haveSubmitted = new Set(existing.map((e) => e.userId));
                    const missing = [...participantIds].filter(uid => !haveSubmitted.has(uid));
                    for (const userId of missing) {
                        await prisma.partnerSelection.create({
                            data: { userId, sessionId, partnerId: 'A', score: 0 },
                        });
                        createdCount++;
                    }
                    break;
                }
                case 'ROUND3_CRISIS_WEB': {
                    const existing = await prisma.crisisWebSubmission.findMany({ where: { sessionId }, select: { userId: true } });
                    const haveSubmitted = new Set(existing.map((e) => e.userId));
                    const missing = [...participantIds].filter(uid => !haveSubmitted.has(uid));
                    for (const userId of missing) {
                        await prisma.crisisWebSubmission.create({
                            data: {
                                userId,
                                sessionId,
                                scenarioId: 'malaysia',
                                selectedAdvisors: [],
                                selectedActions: [],
                                totalCost: 0,
                                effectiveness: 0,
                                riskLevel: 'LOW',
                            },
                        });
                        createdCount++;
                    }
                    break;
                }
                case 'ROUND3_REACTIVATION_CHALLENGE': {
                    const existing = await prisma.reactivationSequence.findMany({ where: { sessionId }, select: { userId: true } });
                    const haveSubmitted = new Set(existing.map((e) => e.userId));
                    const missing = [...participantIds].filter(uid => !haveSubmitted.has(uid));
                    for (const userId of missing) {
                        await prisma.reactivationSequence.create({
                            data: {
                                userId,
                                sessionId,
                                sequence: [],
                                totalDuration: 0,
                                criticalPathTime: 0,
                                riskScore: 1,
                                resourceUtilization: {},
                            },
                        });
                        createdCount++;
                    }
                    break;
                }
                default:
                    return res.status(400).json({ error: `Force submit not supported for task ${session.task}` });
            }
            try {
                (0, io_1.getIO)().to(sessionId).emit('admin:force-submit-all', { sessionId, task: session.task, createdCount });
            }
            catch { }
            res.json({ success: true, createdCount, task: session.task });
        }
        catch (error) {
            console.error('Error force submitting all:', error);
            res.status(500).json({ error: 'Failed to force submit all' });
        }
    }
    // Real-time Monitoring
    static async getSessionStatus(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                include: {
                    userSessions: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    },
                    routeCalculations: {
                        select: {
                            userId: true,
                            calculatedAt: true
                        }
                    },
                    partnerSelections: {
                        select: {
                            userId: true,
                            selectedAt: true
                        }
                    },
                    crisisWebSubmissions: {
                        select: {
                            userId: true,
                            submittedAt: true
                        }
                    },
                    reactivationSequences: {
                        select: {
                            userId: true,
                            submittedAt: true
                        }
                    },
                    groups: {
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            // Calculate completion rates
            const totalParticipants = session.userSessions.length;
            const routeCompletion = session.routeCalculations.length;
            const partnerCompletion = session.partnerSelections.length;
            const crisisCompletion = session.crisisWebSubmissions.length;
            const reactivationCompletion = session.reactivationSequences.length;
            const status = {
                session,
                completionRates: {
                    routeCalculation: totalParticipants > 0 ? (routeCompletion / totalParticipants) * 100 : 0,
                    partnerSelection: totalParticipants > 0 ? (partnerCompletion / totalParticipants) * 100 : 0,
                    crisisWeb: totalParticipants > 0 ? (crisisCompletion / totalParticipants) * 100 : 0,
                    reactivation: totalParticipants > 0 ? (reactivationCompletion / totalParticipants) * 100 : 0
                },
                participantStatus: session.userSessions.map((us) => ({
                    user: us.user,
                    tasks: {
                        routeCalculation: session.routeCalculations.some((rc) => rc.userId === us.user.id),
                        partnerSelection: session.partnerSelections.some((ps) => ps.userId === us.user.id),
                        crisisWeb: session.crisisWebSubmissions.some((cws) => cws.userId === us.user.id),
                        reactivation: session.reactivationSequences.some((rs) => rs.userId === us.user.id)
                    }
                }))
            };
            res.json(status);
        }
        catch (error) {
            console.error('Error fetching session status:', error);
            res.status(500).json({ error: 'Failed to fetch session status' });
        }
    }
    // Scoring Dashboard
    static async calculateScores(req, res) {
        try {
            const { sessionId } = req.params;
            // Get all submissions for the session
            const routeCalculations = await prisma.routeCalculation.findMany({
                where: { sessionId },
                include: { user: { select: { name: true } } }
            });
            const partnerSelections = await prisma.partnerSelection.findMany({
                where: { sessionId },
                include: { user: { select: { name: true } } }
            });
            const crisisWebSubmissions = await prisma.crisisWebSubmission.findMany({
                where: { sessionId },
                include: { user: { select: { name: true } } }
            });
            const reactivationSequences = await prisma.reactivationSequence.findMany({
                where: { sessionId },
                include: { user: { select: { name: true } } }
            });
            // Calculate scores for each task
            const routeScores = routeCalculations.map((rc) => ({
                userId: rc.userId,
                userName: rc.user.name,
                task: 'Route Calculation',
                score: Math.max(0, rc.netProfit), // Score based on profit
                details: {
                    netProfit: rc.netProfit,
                    coldChainBreaches: rc.coldChainBreaches,
                    totalDistance: rc.totalDistance
                }
            }));
            const partnerScores = partnerSelections.map((ps) => ({
                userId: ps.userId,
                userName: ps.user.name,
                task: 'Partner Selection',
                score: ps.score,
                details: {
                    selectedPartner: ps.partnerId,
                    score: ps.score
                }
            }));
            const crisisScores = crisisWebSubmissions.map((cws) => ({
                userId: cws.userId,
                userName: cws.user.name,
                task: 'Crisis Web',
                score: Math.round(cws.effectiveness * 100), // Convert to percentage
                details: {
                    effectiveness: cws.effectiveness,
                    totalCost: cws.totalCost,
                    riskLevel: cws.riskLevel
                }
            }));
            const reactivationScores = reactivationSequences.map((rs) => ({
                userId: rs.userId,
                userName: rs.user.name,
                task: 'Reactivation Challenge',
                score: Math.round((1 - rs.riskScore) * 100), // Lower risk = higher score
                details: {
                    totalDuration: rs.totalDuration,
                    criticalPathTime: rs.criticalPathTime,
                    riskScore: rs.riskScore
                }
            }));
            // Combine all scores
            const allScores = [...routeScores, ...partnerScores, ...crisisScores, ...reactivationScores];
            // Calculate total scores per user
            const userTotals = allScores.reduce((acc, score) => {
                if (!acc[score.userId]) {
                    acc[score.userId] = {
                        userId: score.userId,
                        userName: score.userName,
                        totalScore: 0,
                        taskScores: {}
                    };
                }
                acc[score.userId].totalScore += score.score;
                acc[score.userId].taskScores[score.task] = score;
                return acc;
            }, {});
            const finalScores = Object.values(userTotals).sort((a, b) => b.totalScore - a.totalScore);
            res.json({
                sessionId,
                scores: finalScores,
                taskBreakdown: {
                    routeCalculation: routeScores,
                    partnerSelection: partnerScores,
                    crisisWeb: crisisScores,
                    reactivation: reactivationScores
                }
            });
        }
        catch (error) {
            console.error('Error calculating scores:', error);
            res.status(500).json({ error: 'Failed to calculate scores' });
        }
    }
    static async exportResults(req, res) {
        try {
            const { sessionId } = req.params;
            // Get session data directly instead of calling calculateScores
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
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
            // Generate CSV content
            const csvHeaders = [
                'User ID',
                'User Name',
                'Email',
                'Joined At'
            ];
            const csvRows = session.userSessions.map((userSession) => [
                userSession.user.id,
                userSession.user.name,
                userSession.user.email,
                userSession.joinedAt
            ]);
            const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map((cell) => `"${cell}"`).join(','))
                .join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}-results.csv"`);
            res.send(csvContent);
        }
        catch (error) {
            console.error('Error exporting results:', error);
            res.status(500).json({ error: 'Failed to export results' });
        }
    }
    // Timer Controls
    static async updateGlobalTimer(req, res) {
        try {
            const { sessionId } = req.params;
            const { taskType, duration, action } = req.body; // action: 'start', 'pause', 'reset'
            // Update session timer in database
            await prisma.session.update({
                where: { id: sessionId },
                data: {
                    currentRound: taskType === 'round1' ? 1 : taskType === 'round2' ? 2 : 3
                }
            });
            // Broadcast timer update to all clients in the session
            try {
                (0, io_1.getIO)().to(sessionId).emit('timer-update', { taskType, duration, action, startTime: action === 'start' ? new Date() : null, timestamp: Date.now() });
            }
            catch { }
            res.json({
                success: true,
                message: `Timer ${action}ed for ${taskType}`
            });
        }
        catch (error) {
            console.error('Error updating global timer:', error);
            res.status(500).json({ error: 'Failed to update timer' });
        }
    }
    // Bulk session management
    static async createBulkSessions(req, res) {
        try {
            const { sessionCount, participantsPerSession } = req.body;
            const sessions = [];
            for (let i = 0; i < sessionCount; i++) {
                const session = await prisma.session.create({
                    data: {
                        name: `Session ${i + 1}`,
                        code: `SESS${Date.now()}${i}`,
                        maxParticipants: participantsPerSession,
                        status: 'WAITING'
                    }
                });
                sessions.push(session);
            }
            res.json({
                success: true,
                data: sessions,
                message: `Created ${sessionCount} sessions`
            });
        }
        catch (error) {
            console.error('Error creating bulk sessions:', error);
            res.status(500).json({ error: 'Failed to create bulk sessions' });
        }
    }
    static async startAllSessions(req, res) {
        try {
            const { sessionIds } = req.body;
            await prisma.session.updateMany({
                where: { id: { in: sessionIds } },
                data: { status: 'ACTIVE' }
            });
            // Broadcast to all sessions
            try {
                sessionIds.forEach((id) => (0, io_1.getIO)().to(id).emit('session:started'));
            }
            catch { }
            res.json({
                success: true,
                message: `Started ${sessionIds.length} sessions`
            });
        }
        catch (error) {
            console.error('Error starting sessions:', error);
            res.status(500).json({ error: 'Failed to start sessions' });
        }
    }
    static async bulkAddUsersToSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { emails } = req.body;
            if (!Array.isArray(emails) || emails.length === 0) {
                return res.status(400).json({ error: 'Emails array is required' });
            }
            const session = await prisma.session.findUnique({ where: { id: sessionId } });
            if (!session)
                return res.status(404).json({ error: 'Session not found' });
            const normalized = emails.map(e => (e || '').trim().toLowerCase()).filter(Boolean);
            const results = [];
            for (const email of normalized) {
                let user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    const { hashPassword } = await Promise.resolve().then(() => __importStar(require('../utils/password')));
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: email.split('@')[0],
                            password: await hashPassword('Welcome123!'),
                            role: 'STUDENT',
                        },
                    });
                }
                const existing = await prisma.userSession.findFirst({ where: { userId: user.id, sessionId } });
                if (!existing) {
                    await prisma.userSession.create({ data: { userId: user.id, sessionId } });
                }
                results.push({ email, userId: user.id });
            }
            res.json({ success: true, added: results.length, participants: results });
        }
        catch (error) {
            console.error('Error adding users to session:', error);
            res.status(500).json({ error: 'Failed to add users to session' });
        }
    }
    static async removeUserFromSession(req, res) {
        try {
            const { sessionId, userId } = req.params;
            await prisma.userSession.deleteMany({ where: { sessionId, userId } });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error removing user from session:', error);
            res.status(500).json({ error: 'Failed to remove user from session' });
        }
    }
    // Start full automated simulation flow for a session
    static async startSimulation(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await sessionOrchestrator_1.sessionOrchestrator.startSimulation(sessionId);
            res.json({ success: true, message: 'Simulation started', session });
        }
        catch (error) {
            console.error('Error starting simulation:', error);
            res.status(500).json({ error: 'Failed to start simulation' });
        }
    }
    // Broadcast Announcements
    static async broadcastAnnouncement(req, res) {
        try {
            const { sessionId } = req.params;
            const { message, type = 'info' } = req.body; // type: 'info', 'warning', 'success', 'error'
            // Broadcast announcement to all clients in the session
            try {
                (0, io_1.getIO)().to(sessionId).emit('announcement', { message, type, timestamp: Date.now() });
            }
            catch { }
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error broadcasting announcement:', error);
            res.status(500).json({ error: 'Failed to broadcast announcement' });
        }
    }
    // Behavioral Indicators
    static async getBehavioralIndicators(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
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
                    },
                    groups: {
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            },
                            messages: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            // Calculate behavioral indicators
            const behavioralIndicators = session.userSessions.map((us) => {
                const userGroups = session.groups.filter((g) => g.members.some((m) => m.userId === us.user.id));
                const totalMessages = userGroups.reduce((sum, group) => sum + group.messages.filter((m) => m.userId === us.user.id).length, 0);
                const leadershipRoles = userGroups.filter((g) => g.members.find((m) => m.userId === us.user.id)?.role === 'LEADER').length;
                const collaborationScore = Math.min(100, (totalMessages * 10) + (leadershipRoles * 20));
                return {
                    userId: us.user.id,
                    userName: us.user.name,
                    indicators: {
                        participation: totalMessages > 0 ? 'High' : 'Low',
                        leadership: leadershipRoles > 0 ? 'Yes' : 'No',
                        collaboration: collaborationScore,
                        groupEngagement: userGroups.length,
                        communicationFrequency: totalMessages
                    }
                };
            });
            res.json(behavioralIndicators);
        }
        catch (error) {
            console.error('Error calculating behavioral indicators:', error);
            res.status(500).json({ error: 'Failed to calculate behavioral indicators' });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map