import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { SessionSummary, SessionStatus, ScoringResults, BehavioralIndicator } from '../../../shared/types/admin';
import ScoringDashboard from '../components/ScoringDashboard';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Download
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [scoringResults, setScoringResults] = useState<ScoringResults | null>(null);
  const [behavioralIndicators, setBehavioralIndicators] = useState<BehavioralIndicator[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'monitoring' | 'scoring' | 'behavioral' | 'comprehensive'>('sessions');
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState({ message: '', type: 'info' as const });
  const { socket } = useSocket();

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      window.location.href = '/login';
    }
  }, [user]);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Live admin session updates via socket
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (updated: any) => {
      setSessions(prev => prev.map(s => (s.id === updated.id ? { ...s, ...updated } : s)));
      if (selectedSession && updated.id === selectedSession.id) {
        setSelectedSession({ ...selectedSession, ...updated });
      }
    };
    socket.on('admin:session:updated', handleUpdate);
    return () => {
      socket.off('admin:session:updated', handleUpdate);
    };
  }, [socket, selectedSession]);

  // Load session status when selected session changes
  useEffect(() => {
    if (selectedSession) {
      loadSessionStatus(selectedSession.id);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionStatus = async (sessionId: string) => {
    try {
      const status = await adminService.getSessionStatus(sessionId);
      setSessionStatus(status);
    } catch (error) {
      console.error('Error loading session status:', error);
    }
  };

  const loadScoringResults = async (sessionId: string) => {
    try {
      const results = await adminService.calculateScores(sessionId);
      setScoringResults(results);
    } catch (error) {
      console.error('Error loading scoring results:', error);
    }
  };

  const loadBehavioralIndicators = async (sessionId: string) => {
    try {
      const indicators = await adminService.getBehavioralIndicators(sessionId);
      setBehavioralIndicators(indicators);
    } catch (error) {
      console.error('Error loading behavioral indicators:', error);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string, currentRound?: number) => {
    try {
      await adminService.updateSessionStatus(sessionId, { status: status as any, currentRound });
      await loadSessions();
      if (selectedSession?.id === sessionId) {
        await loadSessionStatus(sessionId);
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };



  const updateGlobalTimer = async (taskType: string, duration: number, action: string) => {
    if (!selectedSession) return;
    
    try {
      await adminService.updateGlobalTimer(selectedSession.id, { taskType, duration, action: action as any });
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  const broadcastAnnouncement = async () => {
    if (!selectedSession || !announcement.message.trim()) return;
    
    try {
      await adminService.broadcastAnnouncement(selectedSession.id, announcement);
      setAnnouncement({ message: '', type: 'info' });
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
    }
  };

  const exportResults = async (sessionId: string) => {
    try {
      const blob = await adminService.exportResults(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}-results.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const startFullSimulation = async (sessionId: string) => {
    try {
      await adminService.startSimulation(sessionId);
      await loadSessions();
      if (selectedSession?.id === sessionId) {
        await loadSessionStatus(sessionId);
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };



  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage simulation sessions and monitor progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'sessions'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Sessions</span>
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'monitoring'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Monitoring</span>
            </button>
            <button
              onClick={() => setActiveTab('scoring')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'scoring'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Scoring</span>
            </button>
            <button
              onClick={() => setActiveTab('behavioral')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'behavioral'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Behavioral</span>
            </button>
            <button
              onClick={() => setActiveTab('comprehensive')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'comprehensive'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Comprehensive Scoring</span>
            </button>
          </nav>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Session Management</h2>
              <button
                onClick={loadSessions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading sessions...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
                        <p className="text-sm text-gray-500">Code: {session.code}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                      <div className="space-y-2 text-sm text-gray-600">
                      <div>Round: {session.currentRound}</div>
                      {session.task && (
                        <div>Task: {session.task.replace(/_/g, ' ')}</div>
                      )}
                      <div>Participants: {session._count.userSessions}/{session.maxParticipants}</div>
                      <div>Created: {new Date(session.createdAt).toLocaleDateString()}</div>
                    </div>

                    <div className="mt-4 flex space-x-2 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSessionStatus(session.id, 'ACTIVE');
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Start
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSessionStatus(session.id, 'PAUSED');
                        }}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                      >
                        Pause
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSessionStatus(session.id, 'COMPLETED');
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Complete
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); startFullSimulation(session.id); }}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Start Full Simulation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comprehensive Scoring Tab */}
        {activeTab === 'comprehensive' && selectedSession && (
          <ScoringDashboard sessionId={selectedSession.id} />
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && selectedSession && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Real-time Monitoring - {selectedSession.name}
              </h2>
              <button
                onClick={() => loadSessionStatus(selectedSession.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>

            {sessionStatus && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Completion Rates */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Rates</h3>
                  <div className="space-y-4">
                    {Object.entries(sessionStatus.completionRates).map(([task, rate]) => (
                      <div key={task} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {task.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">{Math.round(rate)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Participant Status */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Participant Status</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sessionStatus.participantStatus.map((participant) => (
                      <div key={participant.user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-gray-900">{participant.user.name}</div>
                          <div className="text-sm text-gray-500">{participant.user.email}</div>
                        </div>
                        <div className="flex space-x-1">
                          {Object.entries(participant.tasks).map(([task, completed]) => (
                            <div
                              key={task}
                              className={`w-3 h-3 rounded-full ${
                                completed ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              title={`${task}: ${completed ? 'Completed' : 'Pending'}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timer Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timer Controls</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {['route-calculation', 'partner-selection', 'crisis-web', 'reactivation'].map((taskType) => (
                  <div key={taskType} className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      {taskType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateGlobalTimer(taskType, 1200, 'start')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Start (20m)
                      </button>
                      <button
                        onClick={() => updateGlobalTimer(taskType, 0, 'pause')}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => updateGlobalTimer(taskType, 0, 'reset')}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Broadcast Announcement</h3>
              <div className="space-y-4">
                <div>
                  <textarea
                    value={announcement.message}
                    onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                    placeholder="Enter announcement message..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={announcement.type}
                    onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                  <button
                    onClick={broadcastAnnouncement}
                    disabled={!announcement.message.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Broadcast
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scoring Tab */}
        {activeTab === 'scoring' && selectedSession && (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Scoring Dashboard - {selectedSession.name}
              </h2>
                <div className="flex space-x-2">
                <button
                    onClick={() => loadScoringResults(selectedSession.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Calculate Scores
                </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await adminService.forceSubmitAll(selectedSession.id);
                        alert(`Force submitted ${res.createdCount} submissions for ${res.task}`);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Force Submit All (Current Task)
                  </button>
                <button
                  onClick={() => exportResults(selectedSession.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                  <button
                    onClick={async () => {
                      try {
                        await (await import('../services/scoringService')).scoringService.initializeCompetencies();
                        await loadScoringResults(selectedSession.id);
                      } catch (e) { console.error(e); }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Init Competencies
                  </button>
              </div>
            </div>

            {scoringResults && (
              <div className="space-y-6">
                {/* Overall Rankings */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rankings</h3>
                  <div className="space-y-3">
                    {scoringResults.scores.map((user, index) => (
                      <div key={user.userId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                          <div>
                            <div className="font-medium text-gray-900">{user.userName}</div>
                            <div className="text-sm text-gray-500">Total Score: {user.totalScore}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{user.totalScore}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Breakdown */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {Object.entries(scoringResults.taskBreakdown).map(([task, scores]) => (
                    <div key={task} className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {task.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h3>
                      <div className="space-y-2">
                        {scores.map((score) => (
                          <div key={score.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-700">{score.userName}</span>
                            <span className="text-sm text-gray-600">{score.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Behavioral Tab */}
        {activeTab === 'behavioral' && selectedSession && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Behavioral Indicators - {selectedSession.name}
              </h2>
              <button
                onClick={() => loadBehavioralIndicators(selectedSession.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Load Indicators
              </button>
            </div>

            {behavioralIndicators.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leadership
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Collaboration Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Group Engagement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Communication Frequency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {behavioralIndicators.map((indicator) => (
                        <tr key={indicator.userId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{indicator.userName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              indicator.indicators.participation === 'High'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {indicator.indicators.participation}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              indicator.indicators.leadership === 'Yes'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {indicator.indicators.leadership}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${indicator.indicators.collaboration}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{indicator.indicators.collaboration}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {indicator.indicators.groupEngagement}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {indicator.indicators.communicationFrequency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session Selection Prompt */}
        {activeTab !== 'sessions' && !selectedSession && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Session</h3>
              <p className="text-gray-500">Please select a session from the Sessions tab to view monitoring, scoring, and behavioral data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 


