import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSessionManager } from '../hooks/useSessionManager';
import apiClient from '../services/apiClient';
import { useSocket } from '../hooks/useSocket';

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

const SimulationLayout: React.FC = () => {
  useSessionManager();
  const { socket } = useSocket();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await apiClient.get('/auth/session/current');
        const session = data.session as { id: string; task?: SessionTask };
        // cache for other parts (e.g., joinGame)
        try { sessionStorage.setItem('currentSession', JSON.stringify({ session })) } catch {}
        if (!session?.id || !session?.task) {
          setChecking(false);
          return;
        }
        const target = TASK_TO_PATH_MAP[session.task]?.(session.id);
        if (target && location.pathname + location.search !== target) {
          navigate(target, { replace: true });
        }
        // Also attempt to join the session room immediately so we receive future task changes
        try { if (socket) socket.emit('user:join-session-room', { sessionId: session.id }); } catch {}
      } catch {
        // ignore
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [location.pathname, location.search, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking session task...
      </div>
    );
  }

  return <Outlet />;
};

export default SimulationLayout;


