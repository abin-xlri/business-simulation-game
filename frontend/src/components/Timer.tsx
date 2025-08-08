import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface TimerProps {
  duration?: number; // in minutes
  timeLeft?: number; // in seconds
  onTimeUp: () => void;
  isRunning?: boolean;
  onToggle?: (isRunning: boolean) => void;
}

const Timer: React.FC<TimerProps> = ({ 
  duration, 
  timeLeft: externalTimeLeft,
  onTimeUp, 
  isRunning = true, 
  onToggle 
}) => {
  const { socket } = useSocket();
  const [internalTimeLeft, setInternalTimeLeft] = useState(duration ? duration * 60 : 0); // Convert to seconds
  const timeLeft = externalTimeLeft !== undefined ? externalTimeLeft : internalTimeLeft;
  const [isActive, setIsActive] = useState(isRunning);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleTimer = useCallback(() => {
    if (onToggle) {
      const newState = !isActive;
      setIsActive(newState);
      onToggle(newState);
    }
  }, [isActive, onToggle]);

  useEffect(() => {
    setIsActive(isRunning);
  }, [isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setInternalTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false);
            onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, onTimeUp]);

  // Sync with admin timer broadcasts
  useEffect(() => {
    if (!socket) return;
    const handler = (data: { taskType: string; duration: number; action: 'start' | 'pause' | 'reset'; startTime?: string | null }) => {
      if (data.action === 'reset') {
        setIsActive(false);
        if (duration) setInternalTimeLeft(duration * 60);
      }
      if (data.action === 'pause') {
        setIsActive(false);
      }
      if (data.action === 'start') {
        setIsActive(true);
        setInternalTimeLeft(data.duration);
      }
    };
    socket.on('timer-update', handler);
    return () => { socket.off('timer-update', handler); };
  }, [socket, duration]);

  const isWarning = timeLeft <= 300; // 5 minutes warning
  const isCritical = timeLeft <= 60; // 1 minute critical

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock className={`w-5 h-5 ${isWarning ? 'text-orange-500' : 'text-gray-600'}`} />
          <h3 className="text-lg font-semibold text-gray-800">Time Remaining</h3>
        </div>
        {onToggle && (
          <button
            onClick={toggleTimer}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
        )}
      </div>
      
      <div className="text-center">
        <div className={`text-4xl font-mono font-bold ${
          isCritical ? 'text-red-600' : 
          isWarning ? 'text-orange-500' : 
          'text-gray-800'
        }`}>
          {formatTime(timeLeft)}
        </div>
        
        {isWarning && (
          <div className="flex items-center justify-center mt-2 space-x-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">
              {isCritical ? 'Time is running out!' : 'Less than 5 minutes remaining'}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isCritical ? 'bg-red-500' : 
              isWarning ? 'bg-orange-500' : 
              'bg-blue-500'
            }`}
            style={{ 
              width: `${Math.max(0, (timeLeft / (duration ? duration * 60 : timeLeft)) * 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timer; 