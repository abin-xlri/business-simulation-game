import { 
  RouteCalculationResponse,
  StationsResponse,
  SegmentsResponse 
} from '../../../shared/types/round1';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class Round1ApiService {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getStations(): Promise<StationsResponse> {
    return this.request<StationsResponse>('/round1/stations');
  }

  static async getRouteSegments(): Promise<SegmentsResponse> {
    return this.request<SegmentsResponse>('/round1/segments');
  }

  static async calculateRoute(route: string[]): Promise<RouteCalculationResponse> {
    return this.request<RouteCalculationResponse>('/round1/calculate-route', {
      method: 'POST',
      body: JSON.stringify({ route }),
    });
  }
} 
