"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetData = exports.getMarketData = exports.getMessages = exports.sendMessage = exports.getGroups = exports.getGroup = exports.joinGroup = exports.createGroup = void 0;
const client_1 = require("@prisma/client");
const groupData_1 = require("../constants/groupData");
const prisma = new client_1.PrismaClient();
const createGroup = async (req, res) => {
    try {
        const { sessionId, name, taskType, memberIds } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (user?.role !== 'ADMIN') {
            return res.status(403).json({
                error: 'Only admins can create groups'
            });
        }
        // Validate session exists
        const session = await prisma.session.findUnique({
            where: { id: sessionId }
        });
        if (!session) {
            return res.status(404).json({
                error: 'Session not found'
            });
        }
        // Validate member IDs exist and are in the session
        const sessionMembers = await prisma.userSession.findMany({
            where: { sessionId },
            include: { user: true }
        });
        const validMemberIds = sessionMembers.map(member => member.userId);
        const invalidMemberIds = memberIds.filter((id) => !validMemberIds.includes(id));
        if (invalidMemberIds.length > 0) {
            return res.status(400).json({
                error: `Invalid member IDs: ${invalidMemberIds.join(', ')}`
            });
        }
        // Create group
        const group = await prisma.group.create({
            data: {
                sessionId,
                name,
                taskType: taskType,
                members: {
                    create: memberIds.map((memberId, index) => ({
                        userId: memberId,
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
        res.json({
            success: true,
            group
        });
    }
    catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            error: 'Internal server error while creating group'
        });
    }
};
exports.createGroup = createGroup;
const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        // Check if group exists
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                session: true,
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });
        if (!group) {
            return res.status(404).json({
                error: 'Group not found'
            });
        }
        // Check if user is already in the group
        const existingMember = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId
                }
            }
        });
        if (existingMember) {
            return res.status(400).json({
                error: 'Already a member of this group'
            });
        }
        // Check if user is in the session
        const userSession = await prisma.userSession.findFirst({
            where: {
                userId,
                sessionId: group.sessionId
            }
        });
        if (!userSession) {
            return res.status(403).json({
                error: 'You must be in the session to join this group'
            });
        }
        // Add user to group
        const member = await prisma.groupMember.create({
            data: {
                groupId,
                userId,
                role: 'MEMBER'
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        // Get updated group data
        const updatedGroup = await prisma.group.findUnique({
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
        res.json({
            success: true,
            group: updatedGroup,
            member
        });
    }
    catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({
            error: 'Internal server error while joining group'
        });
    }
};
exports.joinGroup = joinGroup;
const getGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        // Check if user is in the group
        const member = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId
                }
            }
        });
        if (!member) {
            return res.status(403).json({
                error: 'Not a member of this group'
            });
        }
        // Get group data
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
                },
                decisions: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!group) {
            return res.status(404).json({
                error: 'Group not found'
            });
        }
        res.json({
            success: true,
            group
        });
    }
    catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching group'
        });
    }
};
exports.getGroup = getGroup;
const getGroups = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        // Get user's groups
        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                session: {
                    select: { id: true, name: true, code: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            groups
        });
    }
    catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching groups'
        });
    }
};
exports.getGroups = getGroups;
const sendMessage = async (req, res) => {
    try {
        const { groupId, message, messageType = 'CHAT' } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        // Verify user is in the group
        const member = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId
                }
            }
        });
        if (!member) {
            return res.status(403).json({
                error: 'Not a member of this group'
            });
        }
        // Save message
        const savedMessage = await prisma.groupMessage.create({
            data: {
                groupId,
                userId,
                message,
                messageType: messageType
            },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            }
        });
        res.json({
            success: true,
            message: savedMessage
        });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            error: 'Internal server error while sending message'
        });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        // Verify user is in the group
        const member = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId
                }
            }
        });
        if (!member) {
            return res.status(403).json({
                error: 'Not a member of this group'
            });
        }
        // Get messages
        const messages = await prisma.groupMessage.findMany({
            where: { groupId },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json({
            success: true,
            messages
        });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching messages'
        });
    }
};
exports.getMessages = getMessages;
const getMarketData = async (req, res) => {
    try {
        res.json({
            success: true,
            countries: groupData_1.MARKET_COUNTRIES
        });
    }
    catch (error) {
        console.error('Get market data error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching market data'
        });
    }
};
exports.getMarketData = getMarketData;
const getBudgetData = async (req, res) => {
    try {
        res.json({
            success: true,
            functions: groupData_1.BUDGET_FUNCTIONS
        });
    }
    catch (error) {
        console.error('Get budget data error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching budget data'
        });
    }
};
exports.getBudgetData = getBudgetData;
//# sourceMappingURL=groupController.js.map