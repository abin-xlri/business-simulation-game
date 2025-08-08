"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class GameController {
    async getGameState(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                include: {
                    userSessions: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }
            const gameState = {
                id: session.id,
                status: session.status === 'COMPLETED' ? 'FINISHED' : session.status,
                currentRound: session.currentRound,
                maxRounds: 3,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt
            };
            const response = {
                success: true,
                data: gameState
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch game state'
            });
        }
    }
    async getMarketData(req, res) {
        try {
            // Get market data from products across all companies
            const products = await prisma.product.findMany({
                include: {
                    company: true
                }
            });
            const totalDemand = products.reduce((sum, product) => sum + product.demand, 0);
            const totalSupply = products.reduce((sum, product) => sum + product.supply, 0);
            const avgPrice = products.length > 0 ? products.reduce((sum, product) => sum + product.price, 0) / products.length : 0;
            const marketData = {
                id: 'global-market',
                name: 'Global Market',
                demand: totalDemand,
                supply: totalSupply,
                price: avgPrice,
                volatility: 0.15 // Could be calculated based on price variations
            };
            const response = {
                success: true,
                data: marketData
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch market data'
            });
        }
    }
    async getGameEvents(req, res) {
        try {
            const events = await prisma.gameEvent.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            const transformedEvents = events.map(event => ({
                id: event.id,
                type: event.type,
                title: event.title,
                description: event.description,
                impact: event.impactType,
                duration: event.duration,
                createdAt: event.createdAt
            }));
            const response = {
                success: true,
                data: transformedEvents
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch game events'
            });
        }
    }
    async startGame(req, res) {
        try {
            const { sessionId } = req.params;
            const gameConfig = req.body;
            const session = await prisma.session.update({
                where: { id: sessionId },
                data: {
                    status: 'ACTIVE',
                    currentRound: 1,
                    maxParticipants: gameConfig.maxParticipants || 10
                }
            });
            const response = {
                success: true,
                message: 'Game started successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to start game'
            });
        }
    }
    async pauseGame(req, res) {
        try {
            const { sessionId } = req.params;
            await prisma.session.update({
                where: { id: sessionId },
                data: {
                    status: 'PAUSED'
                }
            });
            const response = {
                success: true,
                message: 'Game paused successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to pause game'
            });
        }
    }
    async resumeGame(req, res) {
        try {
            const { sessionId } = req.params;
            await prisma.session.update({
                where: { id: sessionId },
                data: {
                    status: 'ACTIVE'
                }
            });
            const response = {
                success: true,
                message: 'Game resumed successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to resume game'
            });
        }
    }
    async endGame(req, res) {
        try {
            const { sessionId } = req.params;
            await prisma.session.update({
                where: { id: sessionId },
                data: {
                    status: 'COMPLETED'
                }
            });
            const response = {
                success: true,
                message: 'Game ended successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to end game'
            });
        }
    }
    async getLeaderboard(req, res) {
        try {
            const { sessionId } = req.params;
            // Get all players in the session
            const userSessions = await prisma.userSession.findMany({
                where: { sessionId },
                include: {
                    user: true
                }
            });
            const leaderboard = userSessions.map(userSession => {
                const user = userSession.user;
                // For now, use a simple score based on user ID (placeholder)
                const score = parseInt(user.id.slice(-4), 16) || 0;
                return {
                    userId: user.id,
                    name: user.name,
                    companyName: 'No Company', // Placeholder
                    score,
                    rank: 0 // Will be calculated below
                };
            });
            // Sort by score and assign ranks
            leaderboard.sort((a, b) => b.score - a.score);
            leaderboard.forEach((entry, index) => {
                entry.rank = index + 1;
            });
            const response = {
                success: true,
                data: leaderboard
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch leaderboard'
            });
        }
    }
}
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map