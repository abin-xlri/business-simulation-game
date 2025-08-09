import { apiClient } from './apiClient';
import {
  SessionSummary,
  SessionStatus,
  ScoringResults,
  BehavioralIndicator,
  SessionUpdateRequest,
  ForceSubmitRequest,
  TimerControlRequest,
  AnnouncementRequest
} from '../../../shared/types/admin';

export const adminService = {
  // Users Management
  async listUsers(): Promise<Array<{ id: string; email: string; name: string; role: 'ADMIN' | 'STUDENT' }>> {
    const response = await apiClient.get('/admin/users');
    return response.data.users;
  },

  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/admin/sessions/${sessionId}`);
    return response.data;
  },

  async createUser(user: { email: string; name: string; role?: 'ADMIN' | 'STUDENT'; password?: string }) {
    const response = await apiClient.post('/admin/users', user);
    return response.data.user;
  },

  async updateUser(userId: string, user: Partial<{ email: string; name: string; role: 'ADMIN' | 'STUDENT'; password: string }>) {
    const response = await apiClient.patch(`/admin/users/${userId}`, user);
    return response.data.user;
  },

  async resetPassword(userId: string, newPassword: string): Promise<{ success: boolean }> {
    await apiClient.patch(`/admin/users/${userId}`, { password: newPassword });
    return { success: true };
  },

  async deleteUser(userId: string) {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data.success as boolean;
  },
  // Session Management
  async getSessions(): Promise<SessionSummary[]> {
    try {
      const response = await apiClient.get('/admin/sessions');
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Backend does not expose admin sessions endpoint in this environment
        return [] as SessionSummary[];
      }
      throw err;
    }
  },

  async createSession(data: { name: string; maxParticipants: number }): Promise<SessionSummary> {
    try {
      const response = await apiClient.post('/admin/sessions', data);
      return response.data.session;
    } catch (err: any) {
      // Fallback for environments without /admin/sessions route
      if (err?.response?.status === 404) {
        const alt = await apiClient.post('/auth/session/create', data);
        return alt.data.session as SessionSummary;
      }
      throw err;
    }
  },

  async addParticipants(sessionId: string, emails: string[]): Promise<{ success: boolean; added: number }> {
    const response = await apiClient.post(`/admin/sessions/${sessionId}/participants`, { emails });
    return response.data;
  },

  async removeParticipant(sessionId: string, userId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/admin/sessions/${sessionId}/participants/${userId}`);
    return response.data;
  },

  async updateSessionStatus(sessionId: string, data: SessionUpdateRequest): Promise<SessionSummary> {
    const response = await apiClient.patch(`/admin/sessions/${sessionId}/status`, data);
    return response.data;
  },

  async forceSubmitTask(sessionId: string, data: ForceSubmitRequest): Promise<{ success: boolean; submission: any }> {
    const response = await apiClient.post(`/admin/sessions/${sessionId}/force-submit`, data);
    return response.data;
  },

  async forceSubmitAll(sessionId: string): Promise<{ success: boolean; createdCount: number; task: string }> {
    const response = await apiClient.post(`/admin/sessions/${sessionId}/force-submit-all`);
    return response.data;
  },

  // Real-time Monitoring
  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    const response = await apiClient.get(`/admin/sessions/${sessionId}/status`);
    return response.data;
  },

  // Scoring Dashboard
  async calculateScores(sessionId: string): Promise<ScoringResults> {
    const response = await apiClient.get(`/admin/sessions/${sessionId}/scores`);
    return response.data;
  },

  async exportResults(sessionId: string): Promise<Blob> {
    const response = await apiClient.get(`/admin/sessions/${sessionId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async startSimulation(sessionId: string): Promise<void> {
    await apiClient.post(`/admin/sessions/${sessionId}/start-simulation`);
  },

  // Timer Controls
  async updateGlobalTimer(sessionId: string, data: TimerControlRequest): Promise<{ success: boolean }> {
    const response = await apiClient.post(`/admin/sessions/${sessionId}/timer`, data);
    return response.data;
  },

  // Broadcast Announcements
  async broadcastAnnouncement(sessionId: string, data: AnnouncementRequest): Promise<{ success: boolean }> {
    const response = await apiClient.post(`/admin/sessions/${sessionId}/announcement`, data);
    return response.data;
  },

  // Behavioral Indicators
  async getBehavioralIndicators(sessionId: string): Promise<BehavioralIndicator[]> {
    const response = await apiClient.get(`/admin/sessions/${sessionId}/behavioral-indicators`);
    return response.data;
  }
}; 