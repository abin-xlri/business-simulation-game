import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { getIO } from '../services/io';
import { sessionOrchestrator } from '../services/sessionOrchestrator';

// Legacy io reference removed in favor of getIO()

const prisma = new PrismaClient();

export class AdminController {
  // Session Management
  static async getSessions(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  static async updateSessionStatus(req: Request, res: Response) {
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
      try { getIO().to(sessionId).emit('session-updated', session); } catch {}

      res.json(session);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  }

  static async forceSubmitTask(req: Request, res: Response) {
    try {
      const { sessionId, userId, taskType } = req.body;

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
        getIO().to(sessionId).emit('task-force-submitted', { userId, taskType, submission });
      } catch {}

      res.json({ success: true, submission });
    } catch (error) {
      console.error('Error force submitting task:', error);
      res.status(500).json({ error: 'Failed to force submit task' });
    }
  }

  static async forceSubmitAllCurrentTask(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      const session = await prisma.session.findUnique({ where: { id: sessionId } });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get all participants
      const userSessions = await prisma.userSession.findMany({ where: { sessionId }, select: { userId: true } });
      const participantIds = new Set(userSessions.map((us: { userId: string }) => us.userId));

      let createdCount = 0;

      switch (session.task) {
        case 'ROUND1_TASK1': {
          const existing = await prisma.routeCalculation.findMany({ where: { sessionId }, select: { userId: true } });
          const haveSubmitted = new Set(existing.map((e: { userId: string }) => e.userId));
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
          const haveSubmitted = new Set(existing.map((e: { userId: string }) => e.userId));
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
          const haveSubmitted = new Set(existing.map((e: { userId: string }) => e.userId));
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
          const haveSubmitted = new Set(existing.map((e: { userId: string }) => e.userId));
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

      try { getIO().to(sessionId).emit('admin:force-submit-all', { sessionId, task: session.task, createdCount }); } catch {}

      res.json({ success: true, createdCount, task: session.task });
    } catch (error) {
      console.error('Error force submitting all:', error);
      res.status(500).json({ error: 'Failed to force submit all' });
    }
  }

  // Real-time Monitoring
  static async getSessionStatus(req: Request, res: Response) {
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
        participantStatus: session.userSessions.map((us: any) => ({
          user: us.user,
          tasks: {
            routeCalculation: session.routeCalculations.some((rc: any) => rc.userId === us.user.id),
            partnerSelection: session.partnerSelections.some((ps: any) => ps.userId === us.user.id),
            crisisWeb: session.crisisWebSubmissions.some((cws: any) => cws.userId === us.user.id),
            reactivation: session.reactivationSequences.some((rs: any) => rs.userId === us.user.id)
          }
        }))
      };

      res.json(status);
    } catch (error) {
      console.error('Error fetching session status:', error);
      res.status(500).json({ error: 'Failed to fetch session status' });
    }
  }

  // Scoring Dashboard
  static async calculateScores(req: Request, res: Response) {
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
      const routeScores = routeCalculations.map((rc: any) => ({
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

      const partnerScores = partnerSelections.map((ps: any) => ({
        userId: ps.userId,
        userName: ps.user.name,
        task: 'Partner Selection',
        score: ps.score,
        details: {
          selectedPartner: ps.partnerId,
          score: ps.score
        }
      }));

      const crisisScores = crisisWebSubmissions.map((cws: any) => ({
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

      const reactivationScores = reactivationSequences.map((rs: any) => ({
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
      }, {} as Record<string, any>);

      const finalScores = Object.values(userTotals).sort((a: any, b: any) => b.totalScore - a.totalScore);

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
    } catch (error) {
      console.error('Error calculating scores:', error);
      res.status(500).json({ error: 'Failed to calculate scores' });
    }
  }

  static async exportResults(req: Request, res: Response) {
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

      const csvRows = session.userSessions.map((userSession: any) => [
        userSession.user.id,
        userSession.user.name,
        userSession.user.email,
        userSession.joinedAt
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map((cell: any) => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}-results.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting results:', error);
      res.status(500).json({ error: 'Failed to export results' });
    }
  }

  // Timer Controls
  static async updateGlobalTimer(req: Request, res: Response) {
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
        getIO().to(sessionId).emit('timer-update', { taskType, duration, action, startTime: action === 'start' ? new Date() : null, timestamp: Date.now() });
      } catch {}

      res.json({ 
        success: true,
        message: `Timer ${action}ed for ${taskType}`
      });
    } catch (error) {
      console.error('Error updating global timer:', error);
      res.status(500).json({ error: 'Failed to update timer' });
    }
  }

  // Bulk session management
  static async createBulkSessions(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Error creating bulk sessions:', error);
      res.status(500).json({ error: 'Failed to create bulk sessions' });
    }
  }

  static async startAllSessions(req: Request, res: Response) {
    try {
      const { sessionIds } = req.body;
      
      await prisma.session.updateMany({
        where: { id: { in: sessionIds } },
        data: { status: 'ACTIVE' }
      });

      // Broadcast to all sessions
      try { sessionIds.forEach((id: string) => getIO().to(id).emit('session:started')); } catch {}

      res.json({
        success: true,
        message: `Started ${sessionIds.length} sessions`
      });
    } catch (error) {
      console.error('Error starting sessions:', error);
      res.status(500).json({ error: 'Failed to start sessions' });
    }
  }

  // Start full automated simulation flow for a session
  static async startSimulation(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await sessionOrchestrator.startSimulation(sessionId);
      res.json({ success: true, message: 'Simulation started', session });
    } catch (error) {
      console.error('Error starting simulation:', error);
      res.status(500).json({ error: 'Failed to start simulation' });
    }
  }

  // Broadcast Announcements
  static async broadcastAnnouncement(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { message, type = 'info' } = req.body; // type: 'info', 'warning', 'success', 'error'

      // Broadcast announcement to all clients in the session
      try { getIO().to(sessionId).emit('announcement', { message, type, timestamp: Date.now() }); } catch {}

      res.json({ success: true });
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
      res.status(500).json({ error: 'Failed to broadcast announcement' });
    }
  }

  // Behavioral Indicators
  static async getBehavioralIndicators(req: Request, res: Response) {
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
      const behavioralIndicators = session.userSessions.map((us: any) => {
        const userGroups = session.groups.filter((g: any) => 
          g.members.some((m: any) => m.userId === us.user.id)
        );

        const totalMessages = userGroups.reduce((sum: number, group: any) => 
          sum + group.messages.filter((m: any) => m.userId === us.user.id).length, 0
        );

        const leadershipRoles = userGroups.filter((g: any) => 
          g.members.find((m: any) => m.userId === us.user.id)?.role === 'LEADER'
        ).length;

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
    } catch (error) {
      console.error('Error calculating behavioral indicators:', error);
      res.status(500).json({ error: 'Failed to calculate behavioral indicators' });
    }
  }
} 




