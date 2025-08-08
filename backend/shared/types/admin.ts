// Admin Dashboard Types

export interface SessionSummary {
  id: string;
  name: string;
  code: string;
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  currentRound: number;
  task?: 'LOBBY' | 'ROUND1_TASK1' | 'ROUND1_TASK2' | 'ROUND2_MARKET_SELECTION' | 'ROUND2_BUDGET_ALLOCATION' | 'ROUND3_CRISIS_WEB' | 'ROUND3_REACTIVATION_CHALLENGE' | 'COMPLETED';
  startedAt?: string | null;
  endsAt?: string | null;
  taskStartedAt?: string | null;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  userSessions: UserSessionSummary[];
  _count: {
    userSessions: number;
    routeCalculations: number;
    partnerSelections: number;
    crisisWebSubmissions: number;
    reactivationSequences: number;
  };
}

export interface UserSessionSummary {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
  };
}

export interface SessionStatus {
  session: SessionSummary;
  completionRates: {
    routeCalculation: number;
    partnerSelection: number;
    crisisWeb: number;
    reactivation: number;
  };
  participantStatus: ParticipantStatus[];
}

export interface ParticipantStatus {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
  };
  tasks: {
    routeCalculation: boolean;
    partnerSelection: boolean;
    crisisWeb: boolean;
    reactivation: boolean;
  };
}

export interface TaskScore {
  userId: string;
  userName: string;
  task: string;
  score: number;
  details: Record<string, any>;
}

export interface UserTotalScore {
  userId: string;
  userName: string;
  totalScore: number;
  taskScores: Record<string, TaskScore>;
}

export interface ScoringResults {
  sessionId: string;
  scores: UserTotalScore[];
  taskBreakdown: {
    routeCalculation: TaskScore[];
    partnerSelection: TaskScore[];
    crisisWeb: TaskScore[];
    reactivation: TaskScore[];
  };
}

export interface TimerUpdate {
  taskType: string;
  duration: number;
  action: 'start' | 'pause' | 'reset';
  timestamp: number;
}

export interface Announcement {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: number;
}

export interface BehavioralIndicator {
  userId: string;
  userName: string;
  indicators: {
    participation: 'High' | 'Low';
    leadership: 'Yes' | 'No';
    collaboration: number;
    groupEngagement: number;
    communicationFrequency: number;
  };
}

export interface SessionUpdateRequest {
  status?: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  currentRound?: number;
}

export interface ForceSubmitRequest {
  userId: string;
  taskType: 'route-calculation' | 'partner-selection' | 'crisis-web' | 'reactivation';
}

export interface TimerControlRequest {
  taskType: string;
  duration: number;
  action: 'start' | 'pause' | 'reset';
}

export interface AnnouncementRequest {
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

// Admin Dashboard API Responses
export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SessionsResponse extends AdminApiResponse<SessionSummary[]> {}
export interface SessionStatusResponse extends AdminApiResponse<SessionStatus> {}
export interface ScoringResponse extends AdminApiResponse<ScoringResults> {}
export interface BehavioralResponse extends AdminApiResponse<BehavioralIndicator[]> {}
export interface TimerResponse extends AdminApiResponse<{ success: boolean }> {}
export interface AnnouncementResponse extends AdminApiResponse<{ success: boolean }> {}
export interface ForceSubmitResponse extends AdminApiResponse<{ success: boolean; submission: any }> {} 