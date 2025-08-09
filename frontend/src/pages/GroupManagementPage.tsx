import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Users,
  ArrowLeft,
  UserPlus,
  MessageCircle,
  Calendar,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GroupApiService } from '../services/groupApi';
import { Group, GroupTaskType } from '../../../shared/types/groupCollaboration';

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

const GroupManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinGroupId, setJoinGroupId] = useState('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  // Create group form state
  const [createForm, setCreateForm] = useState({
    name: '',
    memberIds: [] as string[]
  });

  useEffect(() => {
    fetchCurrentSession();
    loadGroups();
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
        setCurrentSession(null);
      } else {
        throw new Error('Failed to fetch session');
      }
    } catch (error) {
      setError('Failed to load session information');
      console.error('Error fetching session:', error);
    }
  };

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await GroupApiService.getGroups();
      setGroups(response.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) {
      setError('No active session found. Please join a session first.');
      return;
    }
    
    try {
      setError(null);
      const createGroupData = {
        ...createForm,
        sessionId: currentSession.id
      };
      const response = await GroupApiService.createGroup(createGroupData);
      setGroups(prev => [response.group, ...prev]);
      setShowCreateForm(false);
      setCreateForm({ name: '', memberIds: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await GroupApiService.joinGroup({ groupId: joinGroupId });
      setGroups(prev => prev.map(g => g.id === response.group.id ? response.group : g));
      setShowJoinForm(false);
      setJoinGroupId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    }
  };

  const getTaskTypeLabel = (taskType: GroupTaskType) => {
    switch (taskType) {
      case 'MARKET_SELECTION':
        return 'Market Selection';
      case 'BUDGET_ALLOCATION':
        return 'Budget Allocation';
      default:
        return taskType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-50';
      case 'DISBANDED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-800">Group Management</h1>
              <p className="text-sm text-gray-600">Manage your collaborative groups</p>
            </div>

            <div className="flex items-center space-x-2">
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              )}
              <button
                onClick={() => setShowJoinForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Groups List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Your Groups</h2>
              <p className="text-sm text-gray-600 mt-1">
                {groups.length} group{groups.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {groups.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
                <p className="text-gray-600 mb-4">
                  {user?.role === 'ADMIN' 
                    ? 'Create a new group to get started with collaboration.'
                    : 'Join an existing group to start collaborating.'
                  }
                </p>
                {user?.role === 'ADMIN' ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Group
                  </button>
                ) : (
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Join a Group
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {groups.map((group) => (
                  <div key={group.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                            {group.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Task: {getTaskTypeLabel(group.taskType)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{group.members.length} members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{group.messages.length} messages</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/group/${group.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Open Group
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Task type is determined automatically from the session stage */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Join Group</h3>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group ID
                </label>
                <input
                  type="text"
                  value={joinGroupId}
                  onChange={(e) => setJoinGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group ID"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagementPage; 


