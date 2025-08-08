import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GroupTaskType, MessageType } from '@prisma/client';
import { MARKET_COUNTRIES, BUDGET_FUNCTIONS, REGION_GUIDANCE } from '../constants/groupData';

const prisma = new PrismaClient();

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { sessionId, name, taskType, memberIds } = req.body;
    const userId = (req as any).user?.userId;

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
    const invalidMemberIds = memberIds.filter((id: string) => !validMemberIds.includes(id));

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
        taskType: taskType as GroupTaskType,
        members: {
          create: memberIds.map((memberId: string, index: number) => ({
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

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      error: 'Internal server error while creating group'
    });
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.body;
    const userId = (req as any).user?.userId;

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

  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      error: 'Internal server error while joining group'
    });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user?.userId;

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

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching group'
    });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

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

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching groups'
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { groupId, message, messageType = 'CHAT' } = req.body;
    const userId = (req as any).user?.userId;

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
        messageType: messageType as MessageType
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

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Internal server error while sending message'
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user?.userId;

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

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching messages'
    });
  }
};

export const getMarketData = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      countries: MARKET_COUNTRIES
    });
  } catch (error) {
    console.error('Get market data error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching market data'
    });
  }
};

export const getBudgetData = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      functions: BUDGET_FUNCTIONS,
      regionGuidance: REGION_GUIDANCE
    });
  } catch (error) {
    console.error('Get budget data error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching budget data'
    });
  }
}; 

// Submit Market Selection decision (finalized rankings Top-3)
export const submitMarketDecision = async (req: Request, res: Response) => {
  try {
    const { groupId, rankings, sessionId } = req.body as { groupId?: string; rankings: string[]; sessionId?: string };
    const userId = (req as any).user?.userId;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    if (!Array.isArray(rankings) || rankings.length < 1) {
      return res.status(400).json({ error: 'Rankings must include at least the top country' });
    }

    // Validate country ids
    const validIds = new Set(MARKET_COUNTRIES.map(c => c.id));
    for (const id of rankings) {
      if (!validIds.has(id as any)) {
        return res.status(400).json({ error: `Invalid country id: ${id}` });
      }
    }

    // Resolve or create group if not provided
    let resolvedGroupId = groupId;
    if (!resolvedGroupId) {
      // Determine user's current session
      const userSession = await prisma.userSession.findFirst({
        where: { userId }
      });
      const sid = sessionId || userSession?.sessionId;
      if (!sid) return res.status(400).json({ error: 'No active session found for user' });

      // Find existing group for this session and task type
      const existing = await prisma.group.findFirst({
        where: {
          sessionId: sid,
          taskType: 'MARKET_SELECTION',
          members: { some: { userId } }
        }
      });
      if (existing) {
        resolvedGroupId = existing.id;
      } else {
        // Auto-create a personal group
        const group = await prisma.group.create({
          data: {
            sessionId: sid,
            name: `MarketSel-${userId.substring(0,6)}`,
            taskType: 'MARKET_SELECTION',
            status: 'ACTIVE',
            members: { create: [{ userId, role: 'LEADER' }] }
          }
        });
        resolvedGroupId = group.id;
      }
    }

    const decision = await prisma.groupDecision.create({
      data: {
        groupId: resolvedGroupId!,
        userId,
        taskType: 'MARKET_SELECTION',
        decision: { type: 'final-ranking', rankings },
        status: 'APPROVED'
      }
    });

    res.json({ success: true, decision });
  } catch (error) {
    console.error('Submit market decision error:', error);
    res.status(500).json({ error: 'Internal server error while submitting market decision' });
  }
};

// Submit Budget Allocation ordering (A–F) for a chosen region (A..F)
export const submitBudgetOrdering = async (req: Request, res: Response) => {
  try {
    const { groupId, regionId, order, sessionId } = req.body as { groupId?: string; regionId: string; order: string[]; sessionId?: string };
    const userId = (req as any).user?.userId;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    // Validate region
    if (!REGION_GUIDANCE[regionId]) {
      return res.status(400).json({ error: 'Invalid region id' });
    }

    // Validate ordering
    const validFunctions = new Set(BUDGET_FUNCTIONS.map(f => f.id));
    if (!Array.isArray(order) || order.length !== 6) {
      return res.status(400).json({ error: 'Order must contain all six functions exactly once' });
    }
    const uniq = new Set(order);
    if (uniq.size !== 6 || order.some(id => !validFunctions.has(id as any))) {
      return res.status(400).json({ error: 'Order must be a permutation of A,B,C,D,E,F' });
    }

    // Provide guidance-based warnings (non-blocking)
    const guidance = REGION_GUIDANCE[regionId];
    const warnings: string[] = [];
    // If Supply Chain (D) is not in top 3 where it is Critical/High, warn
    const rankOf = (id: string) => order.indexOf(id) + 1;
    if ((guidance.D === 'Critical' || guidance.D === 'High') && rankOf('D') > 3) {
      warnings.push('Supply Chain recommended high priority for this region');
    }
    if (guidance.B === 'Very High' && rankOf('B') > 3) {
      warnings.push('Learning & Compliance is very high priority for this region');
    }
    if (guidance.C === 'High' && rankOf('C') > 4) {
      warnings.push('Market Awareness should be placed higher for this region');
    }

    // Resolve or create group if not provided
    let resolvedGroupId = groupId;
    if (!resolvedGroupId) {
      const userSession = await prisma.userSession.findFirst({
        where: { userId }
      });
      const sid = sessionId || userSession?.sessionId;
      if (!sid) return res.status(400).json({ error: 'No active session found for user' });

      const existing = await prisma.group.findFirst({
        where: {
          sessionId: sid,
          taskType: 'BUDGET_ALLOCATION',
          members: { some: { userId } }
        }
      });
      if (existing) {
        resolvedGroupId = existing.id;
      } else {
        const group = await prisma.group.create({
          data: {
            sessionId: sid,
            name: `Budget-${userId.substring(0,6)}`,
            taskType: 'BUDGET_ALLOCATION',
            status: 'ACTIVE',
            members: { create: [{ userId, role: 'LEADER' }] }
          }
        });
        resolvedGroupId = group.id;
      }
    }

    const decision = await prisma.groupDecision.create({
      data: {
        groupId: resolvedGroupId!,
        userId,
        taskType: 'BUDGET_ALLOCATION',
        decision: { type: 'ordering', regionId, order, warnings },
        status: 'APPROVED'
      }
    });

    res.json({ success: true, decision, warnings });
  } catch (error) {
    console.error('Submit budget ordering error:', error);
    res.status(500).json({ error: 'Internal server error while submitting budget ordering' });
  }
};