import {
  Group,
  CreateGroupRequest,
  CreateGroupResponse,
  JoinGroupRequest,
  JoinGroupResponse,
  GetGroupResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesResponse
} from '../../../shared/types/groupCollaboration';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class GroupApiService {
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

    const response = await fetch(`${API_BASE_URL}/groups${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Group Management
  static async createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
    return this.request<CreateGroupResponse>('/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async joinGroup(data: JoinGroupRequest): Promise<JoinGroupResponse> {
    return this.request<JoinGroupResponse>('/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getGroup(groupId: string): Promise<GetGroupResponse> {
    return this.request<GetGroupResponse>(`/${groupId}`);
  }

  static async getGroups(): Promise<{ success: boolean; groups: Group[] }> {
    return this.request<{ success: boolean; groups: Group[] }>('/list');
  }

  // Messaging
  static async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getMessages(groupId: string): Promise<GetMessagesResponse> {
    return this.request<GetMessagesResponse>(`/${groupId}/messages`);
  }

  // Task Data
  static async getMarketData(): Promise<{ success: boolean; countries: any[] }> {
    return this.request<{ success: boolean; countries: any[] }>('/market/data');
  }

  static async getBudgetData(): Promise<{ success: boolean; functions: any[]; regionGuidance: Record<string, Record<string, string>> }> {
    return this.request<{ success: boolean; functions: any[]; regionGuidance: Record<string, Record<string, string>> }>('/budget/data');
  }
} 
