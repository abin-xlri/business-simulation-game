import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './useSocket';

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

export function useGlobalTaskRedirect() {
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: { sessionId: string; task: SessionTask }) => {
      const pathFactory = TASK_TO_PATH_MAP[payload.task];
      if (pathFactory) {
        navigate(pathFactory(payload.sessionId));
      }
    };
    socket.on('session:task:changed', handler);
    return () => {
      socket.off('session:task:changed', handler);
    };
  }, [socket, navigate]);
}


