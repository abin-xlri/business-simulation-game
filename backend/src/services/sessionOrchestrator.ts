import { PrismaClient, Session, SessionTask, GroupTaskType } from '@prisma/client';
import { getIO } from './io';

const prisma = new PrismaClient();

const TASK_DURATIONS_MINUTES: Record<SessionTask, number> = {
  LOBBY: 0,
  ROUND1_TASK1: 20,
  ROUND1_TASK2: 10,
  ROUND2_MARKET_SELECTION: 20,
  ROUND2_BUDGET_ALLOCATION: 10,
  ROUND3_CRISIS_WEB: 20,
  ROUND3_REACTIVATION_CHALLENGE: 10,
  COMPLETED: 0,
};

const TASK_SEQUENCE: SessionTask[] = [
  'ROUND1_TASK1',
  'ROUND1_TASK2',
  'ROUND2_MARKET_SELECTION',
  'ROUND2_BUDGET_ALLOCATION',
  'ROUND3_CRISIS_WEB',
  'ROUND3_REACTIVATION_CHALLENGE',
  'COMPLETED',
] as SessionTask[];

class SessionOrchestrator {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private softState: Map<string, { task: SessionTask; taskStartedAt: Date; endsAt: Date | null }> = new Map();

  public async startSimulation(sessionId: string): Promise<Session> {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.task !== 'LOBBY') {
      throw new Error('Simulation cannot be started or is already running.');
    }

    const now = new Date();
    try {
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          startedAt: now,
          endsAt: new Date(now.getTime() + 90 * 60 * 1000),
        },
      });
    } catch {
      // ignore
    }

    await this.setTask(sessionId, 'ROUND1_TASK1');
    const s = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!s) {
      throw new Error('Session not found after starting simulation');
    }
    return s;
  }

  public async advanceTask(sessionId: string) {
    const currentSession = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!currentSession || currentSession.task === 'COMPLETED') {
      if (this.timeouts.has(sessionId)) {
        clearTimeout(this.timeouts.get(sessionId)!);
        this.timeouts.delete(sessionId);
      }
      return;
    }

    const currentIndex = TASK_SEQUENCE.indexOf(currentSession.task);
    const nextTask = TASK_SEQUENCE[currentIndex + 1];

    if (nextTask) {
      await this.setTask(sessionId, nextTask);
    }
  }

  private async setTask(sessionId: string, task: SessionTask): Promise<Session> {
    const now = new Date();
    let updatedSession: Session | null = null;
    try {
      updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: {
          task,
          taskStartedAt: now,
        },
      });
    } catch {
      // Keep soft state only
      this.softState.set(sessionId, {
        task,
        taskStartedAt: now,
        endsAt: TASK_DURATIONS_MINUTES[task] ? new Date(now.getTime() + TASK_DURATIONS_MINUTES[task] * 60 * 1000) : null,
      });
    }

    // Broadcast change to session room and admins
    try {
      const io = getIO();
      const payload = {
        sessionId,
        task,
        taskStartedAt: now,
        endsAt: TASK_DURATIONS_MINUTES[task] ? new Date(now.getTime() + TASK_DURATIONS_MINUTES[task] * 60 * 1000) : null,
      } as const;
      io.to(sessionId).emit('session:task:changed', payload);
      if (updatedSession) {
        io.to('admins').emit('admin:session:updated', updatedSession);
      }
    } catch (err) {
      console.warn('Socket broadcast skipped:', (err as Error).message);
    }

    // Side-effects on certain tasks (e.g., auto group formation for Round 2)
    try {
      if (task === 'ROUND2_MARKET_SELECTION') {
        // Create groups if none exist for this session
        const existing = await prisma.group.count({ where: { sessionId } });
        if (existing === 0) {
          const userSessions = await prisma.userSession.findMany({
            where: { sessionId },
            orderBy: { joinedAt: 'asc' },
            select: { userId: true },
          });
          const chunkSize = 5; // configurable group size
          let groupIndex = 1;
          for (let i = 0; i < userSessions.length; i += chunkSize) {
            const members = userSessions.slice(i, i + chunkSize);
            await prisma.group.create({
              data: {
                sessionId,
                name: `Group ${groupIndex++}`,
                taskType: GroupTaskType.MARKET_SELECTION,
                members: {
                  create: members.map((m, idx) => ({ userId: m.userId, role: idx === 0 ? 'LEADER' : 'MEMBER' })),
                },
              },
            });
          }
        } else {
          // Ensure taskType is set to MARKET_SELECTION for all groups
          await prisma.group.updateMany({ where: { sessionId }, data: { taskType: GroupTaskType.MARKET_SELECTION } });
        }
      } else if (task === 'ROUND2_BUDGET_ALLOCATION') {
        await prisma.group.updateMany({ where: { sessionId }, data: { taskType: GroupTaskType.BUDGET_ALLOCATION } });
      }
    } catch (err) {
      console.warn('Group orchestration step failed:', (err as Error).message);
    }

    // Manage timer for next transition
    if (this.timeouts.has(sessionId)) {
      clearTimeout(this.timeouts.get(sessionId)!);
      this.timeouts.delete(sessionId);
    }

    if (task !== 'COMPLETED') {
      const durationMs = TASK_DURATIONS_MINUTES[task] * 60 * 1000;
      const timeout = setTimeout(() => {
        this.advanceTask(sessionId).catch(() => undefined);
      }, durationMs);
      this.timeouts.set(sessionId, timeout);
    }

    if (updatedSession) {
      return updatedSession;
    }
    const finalSession = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!finalSession) {
      throw new Error('Session not found after setting task');
    }
    return finalSession;
  }
}

export const sessionOrchestrator = new SessionOrchestrator();


