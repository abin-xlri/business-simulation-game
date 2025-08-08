import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Play, 
  Plus, 
  LogOut, 
  User, 
  Calendar,
  Clock,
  Hash,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Session {
  id: string;
  name: string;
  code: string;
  status: string;
  currentRound: number;
  maxParticipants: number;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  }>;
}

const DashboardPage: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || '';

  const fetchCurrentSession = async () => {
    try {
      const response = await fetch(`${apiBase}/auth/session/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
      } else if (response.status === 404) {
        // No active session found
        setCurrentSession(null);
      } else {
        throw new Error('Failed to fetch session');
      }
    } catch (error) {
      setError('Failed to load session information');
      console.error('Error fetching session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <Clock className="h-4 w-4" />;
      case 'ACTIVE':
        return <Play className="h-4 w-4" />;
      case 'PAUSED':
        return <AlertCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
                <p className="text-gray-600">{user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/join-session')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-indigo-300"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Hash className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-gray-900">Join Session</h3>
                <p className="text-gray-600">Enter a session code to join a game</p>
              </div>
            </div>
          </button>

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => navigate('/create-session')}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-green-300"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-gray-900">Create Session</h3>
                  <p className="text-gray-600">Start a new game session</p>
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => navigate('/game')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-purple-300"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Play className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-gray-900">Game</h3>
                <p className="text-gray-600">Access the game interface</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/groups')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-indigo-300"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-gray-900">Group Management</h3>
                <p className="text-gray-600">Manage collaborative groups</p>
              </div>
            </div>
          </button>
        </div>

        {/* Current Session Status */}
        {currentSession ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Current Session</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSession.status)}`}>
                {getStatusIcon(currentSession.status)}
                <span className="ml-2">{currentSession.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Session Code</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-mono">{currentSession.code}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Current Round</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{currentSession.currentRound}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Participants</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currentSession.participants.length}/{currentSession.maxParticipants}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Session Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 truncate">{currentSession.name}</p>
              </div>
            </div>

            {/* Participants List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participants</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {currentSession.participants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentSession.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3 bg-white rounded-lg p-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                          <p className="text-xs text-gray-500">{participant.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No participants yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
            <p className="text-gray-600 mb-6">
              You are not currently part of any game session. Join a session to start playing!
            </p>
            <button
              onClick={() => navigate('/join-session')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Hash className="h-4 w-4 mr-2" />
              Join Session
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 