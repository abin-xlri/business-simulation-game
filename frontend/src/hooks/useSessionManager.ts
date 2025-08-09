import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from './useSocket';

// We mirror the backend SessionTask states as string literals to avoid coupling to prisma types
type SessionTask =
  | 'LOBBY'
  | 'ROUND1_TASK1'
  | 'ROUND1_TASK2'
  | 'ROUND2_MARKET_SELECTION'
  | 'ROUND2_BUDGET_ALLOCATION'
  | 'ROUND3_CRISIS_WEB'
  | 'ROUND3_REACTIVATION_CHALLENGE'
  | 'COMPLETED';

const TASK_TO_PATH_MAP: Record<SessionTask, (sessionId: string) => string> = {
  LOBBY: () => `/dashboard`,
  ROUND1_TASK1: (sessionId) => `/round1/task1/${sessionId}`,
  ROUND1_TASK2: (sessionId) => `/round1/task2/${sessionId}`,
  ROUND2_MARKET_SELECTION: (sessionId) => `/round2/market-selection/${sessionId}`,
  ROUND2_BUDGET_ALLOCATION: (sessionId) => `/round2/budget-allocation/${sessionId}`,
  ROUND3_CRISIS_WEB: (sessionId) => `/round3/${sessionId}?task=crisis-web`,
  ROUND3_REACTIVATION_CHALLENGE: (sessionId) => `/round3/${sessionId}?task=reactivation`,
  COMPLETED: (sessionId) => `/leaderboard/${sessionId}`,
};

export const useSessionManager = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  useEffect(() => {
    if (!socket) return;

    const handleTaskChange = (data: { task: SessionTask; taskStartedAt?: string; endsAt?: string }) => {
      if (!sessionId) return;
      const pathFactory = TASK_TO_PATH_MAP[data.task];
      if (pathFactory) {
        navigate(pathFactory(sessionId));
      }
    };

    // Ensure we are in the correct session room for receiving scoped events
    try {
      if (sessionId) {
        socket.emit('user:join-session-room', { sessionId });
      }
    } catch {}

    socket.on('session:task:changed', handleTaskChange);

    return () => {
      socket.off('session:task:changed', handleTaskChange);
    };
  }, [socket, sessionId, navigate]);
};


