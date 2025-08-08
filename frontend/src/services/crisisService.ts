import { apiClient } from './apiClient';
import { 
  CrisisDataResponse, 
  ReactivationDataResponse,
  CrisisWebValidation,
  ReactivationValidation
} from '../../../shared/types/crisisManagement';

export const crisisService = {
  // Crisis Web (Task 1) API calls
  async getCrisisData(): Promise<CrisisDataResponse> {
    const response = await apiClient.get('/crisis/crisis-data');
    return response.data;
  },

  async validateCrisisWeb(selectedAdvisors: string[], selectedActions: string[]): Promise<CrisisWebValidation> {
    const response = await apiClient.post('/crisis/validate-crisis-web', {
      selectedAdvisors,
      selectedActions
    });
    return response.data;
  },

  async submitCrisisWeb(
    sessionId: string,
    scenarioId: string,
    selectedAdvisors: string[],
    selectedActions: string[]
  ) {
    const response = await apiClient.post(`/crisis/sessions/${sessionId}/submit-crisis-web`, {
      scenarioId,
      selectedAdvisors,
      selectedActions
    });
    return response.data;
  },

  // Reactivation Challenge (Task 2) API calls
  async getReactivationData(): Promise<ReactivationDataResponse> {
    const response = await apiClient.get('/crisis/reactivation-data');
    return response.data;
  },

  async validateReactivation(sequence: string[]): Promise<ReactivationValidation> {
    const response = await apiClient.post('/crisis/validate-reactivation', {
      sequence
    });
    return response.data;
  },

  async submitReactivation(sessionId: string, sequence: string[]) {
    const response = await apiClient.post(`/crisis/sessions/${sessionId}/submit-reactivation`, {
      sequence
    });
    return response.data;
  }
}; 