"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PlayerController {
    async getAllPlayers(req, res) {
        try {
            const players = await prisma.player.findMany({
                include: {
                    company: true
                }
            });
            // Transform to match Player interface
            const transformedPlayers = players.map(player => ({
                id: player.id,
                name: player.name,
                balance: player.balance,
                company: player.company?.id,
                createdAt: player.createdAt,
                updatedAt: player.updatedAt
            }));
            const response = {
                success: true,
                data: transformedPlayers
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch players'
            });
        }
    }
    async getPlayerById(req, res) {
        try {
            const { id } = req.params;
            const player = await prisma.player.findUnique({
                where: { id },
                include: {
                    company: true
                }
            });
            if (!player) {
                return res.status(404).json({
                    success: false,
                    error: 'Player not found'
                });
            }
            // Transform to match Player interface
            const transformedPlayer = {
                id: player.id,
                name: player.name,
                balance: player.balance,
                company: player.company?.id,
                createdAt: player.createdAt,
                updatedAt: player.updatedAt
            };
            const response = {
                success: true,
                data: transformedPlayer
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch player'
            });
        }
    }
    async createPlayer(req, res) {
        try {
            const playerData = req.body;
            const newPlayer = await prisma.player.create({
                data: {
                    name: playerData.name,
                    balance: playerData.balance || 1000000, // Starting balance
                    company: playerData.companyId ? {
                        connect: { id: playerData.companyId }
                    } : undefined
                },
                include: {
                    company: true
                }
            });
            // Transform to match Player interface
            const transformedPlayer = {
                id: newPlayer.id,
                name: newPlayer.name,
                balance: newPlayer.balance,
                company: newPlayer.company?.id,
                createdAt: newPlayer.createdAt,
                updatedAt: newPlayer.updatedAt
            };
            const response = {
                success: true,
                data: transformedPlayer,
                message: 'Player created successfully'
            };
            res.status(201).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to create player'
            });
        }
    }
    async updatePlayer(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedPlayer = await prisma.player.update({
                where: { id },
                data: {
                    name: updateData.name,
                    balance: updateData.balance,
                    company: updateData.companyId ? {
                        connect: { id: updateData.companyId }
                    } : undefined
                },
                include: {
                    company: true
                }
            });
            // Transform to match Player interface
            const transformedPlayer = {
                id: updatedPlayer.id,
                name: updatedPlayer.name,
                balance: updatedPlayer.balance,
                company: updatedPlayer.company?.id,
                createdAt: updatedPlayer.createdAt,
                updatedAt: updatedPlayer.updatedAt
            };
            const response = {
                success: true,
                data: transformedPlayer,
                message: 'Player updated successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to update player'
            });
        }
    }
    async deletePlayer(req, res) {
        try {
            const { id } = req.params;
            await prisma.player.delete({
                where: { id }
            });
            const response = {
                success: true,
                message: 'Player deleted successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to delete player'
            });
        }
    }
    async joinGame(req, res) {
        try {
            const { id } = req.params;
            const { sessionId } = req.body;
            // Create user session record
            await prisma.userSession.create({
                data: {
                    user: {
                        connect: { id }
                    },
                    session: {
                        connect: { id: sessionId }
                    }
                }
            });
            const response = {
                success: true,
                message: 'Player joined game successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to join game'
            });
        }
    }
    async leaveGame(req, res) {
        try {
            const { id } = req.params;
            const { sessionId } = req.body;
            // Remove user session record
            await prisma.userSession.deleteMany({
                where: {
                    userId: id,
                    sessionId: sessionId
                }
            });
            const response = {
                success: true,
                message: 'Player left game successfully'
            };
            res.json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to leave game'
            });
        }
    }
}
exports.PlayerController = PlayerController;
//# sourceMappingURL=playerController.js.map