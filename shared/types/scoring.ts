// Comprehensive Scoring System Types

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: CompetencyCategory;
  weight: number;
}

export interface TaskCompetency {
  id: string;
  taskType: TaskType;
  competencyId: string;
  weight: number;
  competency: Competency;
}

export interface BehavioralIndicator {
  id: string;
  userId: string;
  sessionId: string;
  competencyId: string;
  taskType: TaskType;
  score: number;
  evidence: any;
  competency: Competency;
}

export interface CompetencyScore {
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  score: number;
  maxScore: number;
  percentage: number;
  evidence: string[];
}

export interface TaskScore {
  taskType: TaskType;
  taskName: string;
  score: number;
  maxScore: number;
  percentage: number;
  competencyScores: CompetencyScore[];
  details: any;
}

export interface UserTotalScore {
  userId: string;
  userName: string;
  totalScore: number;
  maxTotalScore: number;
  overallPercentage: number;
  rank: number;
  taskScores: TaskScore[];
  competencyScores: CompetencyScore[];
}

export interface FinalReport {
  id: string;
  sessionId: string;
  userId: string;
  totalScore: number;
  rank: number;
  competencyScores: CompetencyScore[];
  feedback: FeedbackItem[];
  generatedAt: string;
}

export interface FeedbackItem {
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  score: number;
  maxScore: number;
  percentage: number;
  strengths: string[];
  areasForImprovement: string[];
  specificExamples: string[];
}

export interface ScoringResults {
  sessionId: string;
  totalParticipants: number;
  userScores: UserTotalScore[];
  taskBreakdown: {
    [key in TaskType]: {
      averageScore: number;
      maxScore: number;
      completionRate: number;
    };
  };
  competencyBreakdown: {
    [key in CompetencyCategory]: {
      averageScore: number;
      maxScore: number;
      topPerformers: string[];
    };
  };
}

// Enums
export enum CompetencyCategory {
  ANALYTICAL_THINKING = 'ANALYTICAL_THINKING',
  STRATEGIC_PLANNING = 'STRATEGIC_PLANNING',
  COLLABORATION = 'COLLABORATION',
  LEADERSHIP = 'LEADERSHIP',
  PROBLEM_SOLVING = 'PROBLEM_SOLVING',
  DECISION_MAKING = 'DECISION_MAKING',
  COMMUNICATION = 'COMMUNICATION',
  ADAPTABILITY = 'ADAPTABILITY',
  INNOVATION = 'INNOVATION',
  EXECUTION = 'EXECUTION'
}

export enum TaskType {
  ROUND1_TASK1_ROUTE_OPTIMIZATION = 'ROUND1_TASK1_ROUTE_OPTIMIZATION',
  ROUND1_TASK2_PARTNER_SELECTION = 'ROUND1_TASK2_PARTNER_SELECTION',
  ROUND2_GROUP_MARKET_SELECTION = 'ROUND2_GROUP_MARKET_SELECTION',
  ROUND2_GROUP_BUDGET_ALLOCATION = 'ROUND2_GROUP_BUDGET_ALLOCATION',
  ROUND3_TASK1_CRISIS_WEB = 'ROUND3_TASK1_CRISIS_WEB',
  ROUND3_TASK2_REACTIVATION_CHALLENGE = 'ROUND3_TASK2_REACTIVATION_CHALLENGE'
}

// API Request/Response Types
export interface GenerateReportRequest {
  sessionId: string;
  includeFeedback?: boolean;
}

export interface GenerateReportResponse {
  success: boolean;
  report: FinalReport;
  message?: string;
}

export interface CalculateScoresRequest {
  sessionId: string;
  recalculate?: boolean;
}

export interface CalculateScoresResponse {
  success: boolean;
  results: ScoringResults;
  message?: string;
}

export interface ExportReportRequest {
  sessionId: string;
  format: 'csv' | 'pdf' | 'json';
  includeDetails?: boolean;
}

export interface ExportReportResponse {
  success: boolean;
  data: string | Blob;
  filename: string;
  message?: string;
} 