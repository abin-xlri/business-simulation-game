import { apiClient } from './apiClient';
import {
  ScoringResults,
  FinalReport
} from '../../../shared/types/scoring';

export const scoringService = {
  // Initialize competencies in database
  async initializeCompetencies(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post('/scoring/initialize-competencies');
      return response.data;
    } catch (error) {
      console.error('Error initializing competencies:', error);
      throw error;
    }
  },

  // Calculate comprehensive scores for a session
  async calculateScores(sessionId: string, recalculate?: boolean): Promise<ScoringResults> {
    try {
      const params = recalculate ? { recalculate: 'true' } : {};
      const response = await apiClient.get(`/scoring/sessions/${sessionId}/calculate-scores`, { params });
      return response.data.results;
    } catch (error) {
      console.error('Error calculating scores:', error);
      throw error;
    }
  },

  // Generate final report for a specific user
  async generateFinalReport(sessionId: string, userId: string, includeFeedback?: boolean): Promise<FinalReport> {
    try {
      const params = includeFeedback ? { includeFeedback: 'true' } : {};
      const response = await apiClient.get(`/scoring/sessions/${sessionId}/users/${userId}/final-report`, { params });
      return response.data.report;
    } catch (error) {
      console.error('Error generating final report:', error);
      throw error;
    }
  },

  // Export results in various formats
  async exportResults(sessionId: string, format: 'csv' | 'json' = 'csv', includeDetails?: boolean): Promise<Blob> {
    try {
      const params: any = { format };
      if (includeDetails) {
        params.includeDetails = 'true';
      }
      
      const response = await apiClient.get(`/scoring/sessions/${sessionId}/export`, {
        params,
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting results:', error);
      throw error;
    }
  },

  // Download exported file
  async downloadResults(sessionId: string, format: 'csv' | 'json' = 'csv', includeDetails?: boolean): Promise<void> {
    try {
      const blob = await this.exportResults(sessionId, format, includeDetails);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scoring_results_${sessionId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading results:', error);
      throw error;
    }
  }
}; 
