import {
  PartnersResponse,
  PartnerScoresResponse,
  PartnerSelectionResponse,
  SubmitPartnerSelectionResponse
} from '../../../shared/types/partnerSelection';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class PartnerSelectionApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}/partner-selection${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getPartners(): Promise<PartnersResponse> {
    return this.request<PartnersResponse>('/partners');
  }

  static async getPartnerScores(): Promise<PartnerScoresResponse> {
    return this.request<PartnerScoresResponse>('/scores');
  }

  static async getPartnerSelection(): Promise<PartnerSelectionResponse> {
    return this.request<PartnerSelectionResponse>('/selection');
  }

  static async submitPartnerSelection(partnerId: string): Promise<SubmitPartnerSelectionResponse> {
    return this.request<SubmitPartnerSelectionResponse>('/submit', {
      method: 'POST',
      body: JSON.stringify({ partnerId }),
    });
  }
} 
