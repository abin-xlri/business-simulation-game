import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface UseGroupSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  sendMessage: (groupId: string, message: string, messageType?: string) => void;
  sendDecision: (groupId: string, taskType: string, decision: any) => void;
  startPitch: (groupId: string, countryCode: string) => void;
  endPitch: (groupId: string, countryCode: string) => void;
  submitVote: (groupId: string, rankings: { first: string; second: string; third: string }) => void;
  updateFunction: (groupId: string, functionId: string, priority: number) => void;
  requestConsensus: (groupId: string) => void;
  respondConsensus: (groupId: string, agreed: boolean) => void;
}

export const useGroupSocket = (): UseGroupSocketReturn => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Group socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Group socket disconnected');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Group socket error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const joinGroup = useCallback((groupId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-group', { groupId });
    }
  }, []);

  const leaveGroup = useCallback((groupId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-group', { groupId });
    }
  }, []);

  const sendMessage = useCallback((groupId: string, message: string, messageType = 'CHAT') => {
    if (socketRef.current) {
      socketRef.current.emit('group-message', { groupId, message, messageType });
    }
  }, []);

  const sendDecision = useCallback((groupId: string, taskType: string, decision: any) => {
    if (socketRef.current) {
      socketRef.current.emit('group-decision', { groupId, taskType, decision });
    }
  }, []);

  const startPitch = useCallback((groupId: string, countryCode: string) => {
    if (socketRef.current) {
      socketRef.current.emit('market-pitch-start', { groupId, countryCode });
    }
  }, []);

  const endPitch = useCallback((groupId: string, countryCode: string) => {
    if (socketRef.current) {
      socketRef.current.emit('market-pitch-end', { groupId, countryCode });
    }
  }, []);

  const submitVote = useCallback((groupId: string, rankings: { first: string; second: string; third: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('market-vote', { groupId, rankings });
    }
  }, []);

  const updateFunction = useCallback((groupId: string, functionId: string, priority: number) => {
    if (socketRef.current) {
      socketRef.current.emit('budget-function-update', { groupId, functionId, priority });
    }
  }, []);

  const requestConsensus = useCallback((groupId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('budget-consensus-request', { groupId });
    }
  }, []);

  const respondConsensus = useCallback((groupId: string, agreed: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('budget-consensus-response', { groupId, agreed });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendDecision,
    startPitch,
    endPitch,
    submitVote,
    updateFunction,
    requestConsensus,
    respondConsensus
  };
}; 