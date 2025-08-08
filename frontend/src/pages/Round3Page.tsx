import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { CrisisWeb } from '../components/CrisisWeb';
import { ReactivationChallenge } from '../components/ReactivationChallenge';
import Timer from '../components/Timer';

interface Round3PageProps {}

export const Round3Page: React.FC<Round3PageProps> = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentTask, setCurrentTask] = useState<'crisis-web' | 'reactivation'>(() => {
    const t = (searchParams.get('task') || '').toLowerCase();
    return t === 'reactivation' ? 'reactivation' : 'crisis-web';
  });
  const [crisisWebCompleted, setCrisisWebCompleted] = useState(false);
  const [reactivationCompleted, setReactivationCompleted] = useState(false);

  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (isTimeUp) {
      // Auto-submit or redirect when time is up
      handleTimeUp();
    }
  }, [isTimeUp]);

  const handleTimeUp = () => {
    alert('Time is up! Your current progress will be saved.');
    navigate(`/dashboard/${sessionId}`);
  };

  const handleCrisisWebComplete = () => {
    setCrisisWebCompleted(true);
    setCurrentTask('reactivation');
  };

  const handleReactivationComplete = () => {
    setReactivationCompleted(true);
    // Both tasks completed -> leaderboard
    navigate(`/leaderboard/${sessionId}`);
  };

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${sessionId}`);
  };

  const getTaskStatus = (task: 'crisis-web' | 'reactivation') => {
    if (task === 'crisis-web') {
      return crisisWebCompleted ? 'completed' : currentTask === 'crisis-web' ? 'active' : 'pending';
    } else {
      return reactivationCompleted ? 'completed' : currentTask === 'reactivation' ? 'active' : 'pending';
    }
  };

  const getStatusIcon = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Round 3: Crisis Management</h1>
                <p className="text-sm text-gray-600">Strategic crisis response and infrastructure restoration</p>
              </div>
            </div>
            <Timer
              duration={30 * 60}
              onTimeUp={() => setIsTimeUp(true)}
            />
          </div>
        </div>
      </div>

      {/* Task Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentTask('crisis-web')}
              disabled={!crisisWebCompleted && currentTask !== 'crisis-web'}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentTask === 'crisis-web'
                  ? 'border-blue-500 text-blue-600'
                  : crisisWebCompleted
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
            >
              {getStatusIcon(getTaskStatus('crisis-web'))}
              <span>Task 1: Crisis Web</span>
            </button>
            <button
              onClick={() => setCurrentTask('reactivation')}
              disabled={!crisisWebCompleted}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentTask === 'reactivation'
                  ? 'border-blue-500 text-blue-600'
                  : reactivationCompleted
                  ? 'border-green-500 text-green-600'
                  : crisisWebCompleted
                  ? 'border-transparent text-gray-600 hover:text-gray-900'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
            >
              {getStatusIcon(getTaskStatus('reactivation'))}
              <span>Task 2: Reactivation Challenge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Progress:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  crisisWebCompleted ? 'bg-green-500' : currentTask === 'crisis-web' ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <span className="text-sm font-medium">Crisis Web</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`w-3 h-3 rounded-full ${
                reactivationCompleted ? 'bg-green-500' : currentTask === 'reactivation' ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium">Reactivation</span>
            </div>
            <div className="text-sm text-gray-600">
              {crisisWebCompleted && reactivationCompleted ? 'All tasks completed!' : 'Complete tasks to proceed'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        {currentTask === 'crisis-web' && (
          <CrisisWeb
            sessionId={sessionId!}
            onComplete={handleCrisisWebComplete}
          />
        )}
        
        {currentTask === 'reactivation' && (
          <ReactivationChallenge
            sessionId={sessionId!}
            onComplete={handleReactivationComplete}
          />
        )}
      </div>

      {/* Task Instructions */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crisis Web Instructions */}
            <div className={`p-4 rounded-lg border ${
              currentTask === 'crisis-web' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Crisis Web Challenge
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Select one crisis scenario from Malaysia, Vietnam, or Indonesia</p>
                <p>• Choose up to 2 advisors (6 points total budget)</p>
                <p>• Select up to 3 actions (consider effectiveness vs. risk)</p>
                <p>• Ensure your selection stays within the point budget</p>
                <p>• Submit your crisis response strategy</p>
              </div>
              {crisisWebCompleted && (
                <div className="mt-3 flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>

            {/* Reactivation Challenge Instructions */}
            <div className={`p-4 rounded-lg border ${
              currentTask === 'reactivation' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-green-500" />
                Reactivation Challenge
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Build a sequence to restore critical infrastructure</p>
                <p>• Respect system dependencies (check arrows)</p>
                <p>• Consider resource limitations and parallel tasks</p>
                <p>• Optimize for minimum restoration time</p>
                <p>• Submit your restoration sequence</p>
              </div>
              {reactivationCompleted && (
                <div className="mt-3 flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 

