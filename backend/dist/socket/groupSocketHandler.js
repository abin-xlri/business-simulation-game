"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupSocketHandler = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const groupData_1 = require("../constants/groupData");
const prisma = new client_1.PrismaClient();
class GroupSocketHandler {
    constructor(io) {
        this.userSockets = new Map(); // userId -> socketId
        this.groupSockets = new Map(); // groupId -> Set<socketId>
        this.io = io;
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                const decoded = (0, jwt_1.verifyToken)(token);
                if (!decoded) {
                    return next(new Error('Invalid token'));
                }
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                // Get user's current session
                const userSession = await prisma.userSession.findFirst({
                    where: { userId: decoded.userId },
                    include: { session: true }
                });
                if (userSession) {
                    socket.sessionId = userSession.sessionId;
                }
                this.userSockets.set(decoded.userId, socket.id);
                next();
            }
            catch (error) {
                next(new Error('Invalid token'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected`);
            // Group Management Events
            socket.on('create-group', this.handleCreateGroup.bind(this, socket));
            socket.on('join-group', this.handleJoinGroup.bind(this, socket));
            socket.on('leave-group', this.handleLeaveGroup.bind(this, socket));
            // Messaging Events
            socket.on('group-message', this.handleGroupMessage.bind(this, socket));
            // Decision Making Events
            socket.on('group-decision', this.handleGroupDecision.bind(this, socket));
            // Market Selection Events
            socket.on('market-pitch-start', this.handleMarketPitchStart.bind(this, socket));
            socket.on('market-pitch-end', this.handleMarketPitchEnd.bind(this, socket));
            socket.on('market-vote', this.handleMarketVote.bind(this, socket));
            // Budget Allocation Events
            socket.on('budget-function-update', this.handleBudgetFunctionUpdate.bind(this, socket));
            socket.on('budget-consensus-request', this.handleBudgetConsensusRequest.bind(this, socket));
            socket.on('budget-consensus-response', this.handleBudgetConsensusResponse.bind(this, socket));
            socket.on('disconnect', () => {
                console.log(`User ${socket.userId} disconnected`);
                this.userSockets.delete(socket.userId);
                this.removeSocketFromAllGroups(socket.id);
            });
        });
    }
    async handleCreateGroup(socket, data) {
        try {
            if (socket.userRole !== 'ADMIN') {
                socket.emit('error', { message: 'Only admins can create groups' });
                return;
            }
            const { sessionId, name, taskType, memberIds } = data;
            // Validate session exists
            const session = await prisma.session.findUnique({
                where: { id: sessionId }
            });
            if (!session) {
                socket.emit('error', { message: 'Session not found' });
                return;
            }
            // Create group
            const group = await prisma.group.create({
                data: {
                    sessionId,
                    name,
                    taskType: taskType,
                    members: {
                        create: memberIds.map((userId, index) => ({
                            userId,
                            role: index === 0 ? 'LEADER' : 'MEMBER'
                        }))
                    }
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    }
                }
            });
            // Add sockets to group
            memberIds.forEach((userId) => {
                const socketId = this.userSockets.get(userId);
                if (socketId) {
                    this.addSocketToGroup(group.id, socketId);
                    this.io.to(socketId).emit('group-created', { group });
                }
            });
            // Send system message
            await this.sendSystemMessage(group.id, `${group.name} has been created for ${taskType}`);
        }
        catch (error) {
            console.error('Create group error:', error);
            socket.emit('error', { message: 'Failed to create group' });
        }
    }
    async handleJoinGroup(socket, data) {
        try {
            const { groupId } = data;
            // Check if user is already in the group
            const existingMember = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                }
            });
            if (existingMember) {
                socket.emit('error', { message: 'Already a member of this group' });
                return;
            }
            // Add user to group
            const member = await prisma.groupMember.create({
                data: {
                    groupId,
                    userId: socket.userId,
                    role: 'MEMBER'
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
            // Add socket to group
            this.addSocketToGroup(groupId, socket.id);
            // Get updated group data
            const group = await prisma.group.findUnique({
                where: { id: groupId },
                include: {
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    },
                    messages: {
                        include: {
                            user: {
                                select: { id: true, name: true }
                            }
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
            // Notify group members
            this.io.to(groupId).emit('member-joined', { member, group });
            // Send system message
            await this.sendSystemMessage(groupId, `${member.user.name} joined the group`);
        }
        catch (error) {
            console.error('Join group error:', error);
            socket.emit('error', { message: 'Failed to join group' });
        }
    }
    async handleLeaveGroup(socket, data) {
        try {
            const { groupId } = data;
            // Remove user from group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            await prisma.groupMember.delete({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                }
            });
            // Remove socket from group
            this.removeSocketFromGroup(groupId, socket.id);
            // Notify group members
            this.io.to(groupId).emit('member-left', { member });
            // Send system message
            await this.sendSystemMessage(groupId, `${member.user.name} left the group`);
        }
        catch (error) {
            console.error('Leave group error:', error);
            socket.emit('error', { message: 'Failed to leave group' });
        }
    }
    async handleGroupMessage(socket, data) {
        try {
            const { groupId, message, messageType = 'CHAT' } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Save message
            const savedMessage = await prisma.groupMessage.create({
                data: {
                    groupId,
                    userId: socket.userId,
                    message,
                    messageType: messageType
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            // Broadcast to group
            this.io.to(groupId).emit('new-message', { message: savedMessage });
        }
        catch (error) {
            console.error('Group message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }
    async handleGroupDecision(socket, data) {
        try {
            const { groupId, taskType, decision } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Save decision
            const savedDecision = await prisma.groupDecision.create({
                data: {
                    groupId,
                    userId: socket.userId,
                    taskType: taskType,
                    decision,
                    status: 'PENDING'
                }
            });
            // Broadcast to group
            this.io.to(groupId).emit('new-decision', { decision: savedDecision });
        }
        catch (error) {
            console.error('Group decision error:', error);
            socket.emit('error', { message: 'Failed to submit decision' });
        }
    }
    async handleMarketPitchStart(socket, data) {
        try {
            const { groupId, countryCode } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Notify group about pitch start
            this.io.to(groupId).emit('pitch-started', {
                userId: socket.userId,
                userName: member.user.name,
                countryCode,
                duration: groupData_1.GROUP_CONFIG.PITCH_DURATION
            });
            // Send system message
            await this.sendSystemMessage(groupId, `${member.user.name} started pitching for ${countryCode}`);
        }
        catch (error) {
            console.error('Market pitch start error:', error);
            socket.emit('error', { message: 'Failed to start pitch' });
        }
    }
    async handleMarketPitchEnd(socket, data) {
        try {
            const { groupId, countryCode } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Notify group about pitch end
            this.io.to(groupId).emit('pitch-ended', {
                userId: socket.userId,
                userName: member.user.name,
                countryCode
            });
            // Send system message
            await this.sendSystemMessage(groupId, `${member.user.name} finished pitching for ${countryCode}`);
        }
        catch (error) {
            console.error('Market pitch end error:', error);
            socket.emit('error', { message: 'Failed to end pitch' });
        }
    }
    async handleMarketVote(socket, data) {
        try {
            const { groupId, rankings } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Save vote as a decision
            const voteDecision = await prisma.groupDecision.create({
                data: {
                    groupId,
                    taskType: 'MARKET_SELECTION',
                    decision: {
                        type: 'vote',
                        userId: socket.userId,
                        userName: member.user.name,
                        rankings
                    },
                    status: 'PENDING'
                }
            });
            // Notify group about vote
            this.io.to(groupId).emit('vote-submitted', {
                userId: socket.userId,
                userName: member.user.name,
                rankings,
                decisionId: voteDecision.id
            });
            // Send system message
            await this.sendSystemMessage(groupId, `${member.user.name} submitted their vote`);
        }
        catch (error) {
            console.error('Market vote error:', error);
            socket.emit('error', { message: 'Failed to submit vote' });
        }
    }
    async handleBudgetFunctionUpdate(socket, data) {
        try {
            const { groupId, functionId, priority } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Save function update as a decision
            const functionDecision = await prisma.groupDecision.create({
                data: {
                    groupId,
                    userId: socket.userId,
                    taskType: 'BUDGET_ALLOCATION',
                    decision: {
                        type: 'function-update',
                        userId: socket.userId,
                        userName: member.user.name,
                        functionId,
                        priority
                    },
                    status: 'PENDING'
                }
            });
            // Notify group about function update
            this.io.to(groupId).emit('function-updated', {
                userId: socket.userId,
                userName: member.user.name,
                functionId,
                priority,
                decisionId: functionDecision.id
            });
        }
        catch (error) {
            console.error('Budget function update error:', error);
            socket.emit('error', { message: 'Failed to update function' });
        }
    }
    async handleBudgetConsensusRequest(socket, data) {
        try {
            const { groupId } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Notify group about consensus request
            this.io.to(groupId).emit('consensus-requested', {
                userId: socket.userId,
                userName: member.user.name,
                timeout: groupData_1.GROUP_CONFIG.CONSENSUS_TIMEOUT
            });
            // Send system message
            await this.sendSystemMessage(groupId, `${member.user.name} requested consensus on budget allocation`);
        }
        catch (error) {
            console.error('Budget consensus request error:', error);
            socket.emit('error', { message: 'Failed to request consensus' });
        }
    }
    async handleBudgetConsensusResponse(socket, data) {
        try {
            const { groupId, agreed } = data;
            // Verify user is in the group
            const member = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId: socket.userId
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true }
                    }
                }
            });
            if (!member) {
                socket.emit('error', { message: 'Not a member of this group' });
                return;
            }
            // Save consensus response
            const consensusDecision = await prisma.groupDecision.create({
                data: {
                    groupId,
                    userId: socket.userId,
                    taskType: 'BUDGET_ALLOCATION',
                    decision: {
                        type: 'consensus-response',
                        userId: socket.userId,
                        userName: member.user.name,
                        agreed
                    },
                    status: agreed ? 'APPROVED' : 'REJECTED'
                }
            });
            // Notify group about consensus response
            this.io.to(groupId).emit('consensus-response', {
                userId: socket.userId,
                userName: member.user.name,
                agreed,
                decisionId: consensusDecision.id
            });
            // Send system message
            await this.sendSystemMessage(groupId, `${member.user.name} ${agreed ? 'agreed' : 'disagreed'} with the budget allocation`);
        }
        catch (error) {
            console.error('Budget consensus response error:', error);
            socket.emit('error', { message: 'Failed to submit consensus response' });
        }
    }
    async sendSystemMessage(groupId, message) {
        try {
            const systemMessage = await prisma.groupMessage.create({
                data: {
                    groupId,
                    userId: 'system',
                    message,
                    messageType: 'SYSTEM'
                }
            });
            this.io.to(groupId).emit('new-message', { message: systemMessage });
        }
        catch (error) {
            console.error('Send system message error:', error);
        }
    }
    addSocketToGroup(groupId, socketId) {
        if (!this.groupSockets.has(groupId)) {
            this.groupSockets.set(groupId, new Set());
        }
        this.groupSockets.get(groupId).add(socketId);
        this.io.sockets.sockets.get(socketId)?.join(groupId);
    }
    removeSocketFromGroup(groupId, socketId) {
        const groupSockets = this.groupSockets.get(groupId);
        if (groupSockets) {
            groupSockets.delete(socketId);
            if (groupSockets.size === 0) {
                this.groupSockets.delete(groupId);
            }
        }
        this.io.sockets.sockets.get(socketId)?.leave(groupId);
    }
    removeSocketFromAllGroups(socketId) {
        for (const [groupId, sockets] of this.groupSockets.entries()) {
            if (sockets.has(socketId)) {
                this.removeSocketFromGroup(groupId, socketId);
            }
        }
    }
}
exports.GroupSocketHandler = GroupSocketHandler;
//# sourceMappingURL=groupSocketHandler.js.map