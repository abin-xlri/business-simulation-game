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
  // Session Management
  async getSessions(): Promise<SessionSummary[]> {
    const response = await apiClient.get('/admin/sessions');
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