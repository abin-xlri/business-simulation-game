import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
// Importing enums from @prisma/client caused type issues in some environments; use string literals
import {
  MARKET_COUNTRIES,
  BUDGET_FUNCTIONS,
  GROUP_CONFIG
} from '../constants/groupData';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  sessionId?: string;
}

export class GroupSocketHandler {
  private io: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private groupSockets: Map<string, Set<string>> = new Map(); // groupId -> Set<socketId>

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Make auth non-blocking at the handshake level to avoid hard connection failures.
    // We still enforce auth inside each event handler.
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = (socket as any)?.handshake?.auth?.token as string | undefined;
        if (token) {
          const decoded = verifyToken(token);
          if (decoded) {
            socket.userId = decoded.userId;
            socket.userRole = decoded.role;
            try {
              const userSession = await prisma.userSession.findFirst({
                where: { userId: decoded.userId },
                include: { session: true }
              });
              if (userSession) {
                socket.sessionId = userSession.sessionId;
              }
              this.userSockets.set(decoded.userId, socket.id);
            } catch {}
          }
        }
      } catch {}
      next();
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);

      // Join session and admin rooms for orchestration broadcasts
      try {
        if (socket.sessionId) {
          socket.join(socket.sessionId);
        }
        if (socket.userRole === 'ADMIN') {
          socket.join('admins');
        }
      } catch (e) {
        console.warn('Room join failed:', (e as Error).message);
      }

      // Allow client to explicitly join a session room after joining via HTTP
      socket.on('user:join-session-room', async (data: { sessionId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }
          const { sessionId } = data || ({} as any);
          if (!sessionId) {
            socket.emit('error', { message: 'sessionId required' });
            return;
          }
          const userSession = await prisma.userSession.findFirst({ where: { userId: socket.userId, sessionId } });
          if (!userSession) {
            socket.emit('error', { message: 'Not a participant of this session' });
            return;
          }
          socket.join(sessionId);
          socket.sessionId = sessionId;
          socket.emit('session:joined', { sessionId });
        } catch (err) {
          console.error('user:join-session-room error:', err);
          socket.emit('error', { message: 'Failed to join session room' });
        }
      });

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
        this.userSockets.delete(socket.userId!);
        this.removeSocketFromAllGroups(socket.id);
      });
    });
  }

  private async handleCreateGroup(socket: AuthenticatedSocket, data: any) {
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
            create: memberIds.map((userId: string, index: number) => ({
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
      memberIds.forEach((userId: string) => {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
          this.addSocketToGroup(group.id, socketId);
          this.io.to(socketId).emit('group-created', { group });
        }
      });

      // Send system message
      await this.sendSystemMessage(group.id, `${group.name} has been created for ${taskType}`);

    } catch (error) {
      console.error('Create group error:', error);
      socket.emit('error', { message: 'Failed to create group' });
    }
  }

  private async handleJoinGroup(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId } = data;

      // Check if user is already in the group
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
          userId: socket.userId!,
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

    } catch (error) {
      console.error('Join group error:', error);
      socket.emit('error', { message: 'Failed to join group' });
    }
  }

  private async handleLeaveGroup(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId } = data;

      // Remove user from group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
            userId: socket.userId!
          }
        }
      });

      // Remove socket from group
      this.removeSocketFromGroup(groupId, socket.id);

      // Notify group members
      this.io.to(groupId).emit('member-left', { member });

      // Send system message
      await this.sendSystemMessage(groupId, `${member.user.name} left the group`);

    } catch (error) {
      console.error('Leave group error:', error);
      socket.emit('error', { message: 'Failed to leave group' });
    }
  }

  private async handleGroupMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId, message, messageType = 'CHAT' } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
          userId: socket.userId!,
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

    } catch (error) {
      console.error('Group message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async handleGroupDecision(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId, taskType, decision } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
          userId: socket.userId!,
          taskType: taskType,
          decision,
          status: 'PENDING'
        }
      });

      // Broadcast to group
      this.io.to(groupId).emit('new-decision', { decision: savedDecision });

    } catch (error) {
      console.error('Group decision error:', error);
      socket.emit('error', { message: 'Failed to submit decision' });
    }
  }

  private async handleMarketPitchStart(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId, countryCode } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
        duration: GROUP_CONFIG.PITCH_DURATION
      });

      // Send system message
      await this.sendSystemMessage(
        groupId,
        `${member.user.name} started pitching for ${countryCode}`
      );

    } catch (error) {
      console.error('Market pitch start error:', error);
      socket.emit('error', { message: 'Failed to start pitch' });
    }
  }

  private async handleMarketPitchEnd(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId, countryCode } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
      await this.sendSystemMessage(
        groupId,
        `${member.user.name} finished pitching for ${countryCode}`
      );

    } catch (error) {
      console.error('Market pitch end error:', error);
      socket.emit('error', { message: 'Failed to end pitch' });
    }
  }

  private async handleMarketVote(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId, rankings } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
          userId: socket.userId!,
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
      await this.sendSystemMessage(
        groupId,
        `${member.user.name} submitted their vote`
      );

    } catch (error) {
      console.error('Market vote error:', error);
      socket.emit('error', { message: 'Failed to submit vote' });
    }
  }

  private async handleBudgetFunctionUpdate(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId, functionId, priority } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
          userId: socket.userId!,
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

    } catch (error) {
      console.error('Budget function update error:', error);
      socket.emit('error', { message: 'Failed to update function' });
    }
  }

  private async handleBudgetConsensusRequest(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
        timeout: GROUP_CONFIG.CONSENSUS_TIMEOUT
      });

      // Send system message
      await this.sendSystemMessage(
        groupId,
        `${member.user.name} requested consensus on budget allocation`
      );

    } catch (error) {
      console.error('Budget consensus request error:', error);
      socket.emit('error', { message: 'Failed to request consensus' });
    }
  }

  private async handleBudgetConsensusResponse(socket: AuthenticatedSocket, data: any) {
    try {
      const { groupId, agreed } = data;

      // Verify user is in the group
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: socket.userId!
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
          userId: socket.userId!,
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
      await this.sendSystemMessage(
        groupId,
        `${member.user.name} ${agreed ? 'agreed' : 'disagreed'} with the budget allocation`
      );

    } catch (error) {
      console.error('Budget consensus response error:', error);
      socket.emit('error', { message: 'Failed to submit consensus response' });
    }
  }

  private async sendSystemMessage(groupId: string, message: string) {
    try {
      // Attempt to find or create a "System" user to avoid FK violations
      let systemUser = await prisma.user.findFirst({ where: { email: 'system@internal' } });
      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            email: 'system@internal',
            name: 'System',
            password: '!' // not used
          }
        });
      }

      const systemMessage = await prisma.groupMessage.create({
        data: {
          groupId,
          userId: systemUser.id,
          message,
          messageType: 'SYSTEM'
        }
      });

      this.io.to(groupId).emit('new-message', { message: systemMessage });
    } catch (error) {
      console.error('Send system message error:', error);
    }
  }

  private addSocketToGroup(groupId: string, socketId: string) {
    if (!this.groupSockets.has(groupId)) {
      this.groupSockets.set(groupId, new Set());
    }
    this.groupSockets.get(groupId)!.add(socketId);
    this.io.sockets.sockets.get(socketId)?.join(groupId);
  }

  private removeSocketFromGroup(groupId: string, socketId: string) {
    const groupSockets = this.groupSockets.get(groupId);
    if (groupSockets) {
      groupSockets.delete(socketId);
      if (groupSockets.size === 0) {
        this.groupSockets.delete(groupId);
      }
    }
    this.io.sockets.sockets.get(socketId)?.leave(groupId);
  }

  private removeSocketFromAllGroups(socketId: string) {
    for (const [groupId, sockets] of this.groupSockets.entries()) {
      if (sockets.has(socketId)) {
        this.removeSocketFromGroup(groupId, socketId);
      }
    }
  }
} 

