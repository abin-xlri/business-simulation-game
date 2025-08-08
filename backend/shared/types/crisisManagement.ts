// Crisis Web (Task 1) Types
export interface CrisisScenario {
  id: string;
  name: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: string;
  timePressure: string;
  complexity: string;
}

export interface CrisisAdvisor {
  id: string;
  name: string;
  expertise: string;
  strength: string;
  weakness: string;
  cost: number;
}

export interface CrisisAction {
  id: string;
  name: string;
  description: string;
  effectiveness: number; // 1-10 scale
  cost: number;
  timeRequired: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface CrisisWebSubmission {
  userId: string;
  sessionId: string;
  scenarioId: string;
  selectedAdvisors: string[];
  selectedActions: string[];
  totalCost: number;
  effectiveness: number;
  riskLevel: string;
  submittedAt: Date;
}

// Reactivation Challenge (Task 2) Types
export interface ReactivationNode {
  id: string;
  name: string;
  description: string;
  priority: number;
  duration: number; // hours
  dependencies: string[]; // array of node IDs
  risk: string;
  resources: string[];
}

export interface ReactivationSequence {
  userId: string;
  sessionId: string;
  sequence: string[];
  totalDuration: number;
  criticalPathTime: number;
  riskScore: number;
  resourceUtilization: Record<string, number>;
  submittedAt: Date;
}

// Constraint Validation Types
export interface ConstraintViolation {
  type: 'advisor_limit' | 'action_limit' | 'point_budget' | 'dependency_violation' | 'resource_conflict';
  message: string;
  severity: 'error' | 'warning';
}

export interface CrisisWebValidation {
  isValid: boolean;
  violations: ConstraintViolation[];
  totalCost: number;
  remainingPoints: number;
}

export interface ReactivationValidation {
  isValid: boolean;
  violations: ConstraintViolation[];
  totalDuration: number;
  criticalPathTime: number;
  resourceConflicts: Record<string, number>;
}

// API Response Types
export interface CrisisDataResponse {
  scenarios: CrisisScenario[];
  advisors: CrisisAdvisor[];
  actions: CrisisAction[];
  constraints: {
    maxAdvisors: number;
    maxActions: number;
    totalPoints: number;
  };
}

export interface ReactivationDataResponse {
  nodes: ReactivationNode[];
  constraints: {
    maxParallelTasks: number;
    criticalPathTime: number;
    resourceLimits: Record<string, number>;
  };
}

// Real-time Collaboration Types
export interface CrisisWebUpdate {
  userId: string;
  userName: string;
  scenarioId: string;
  selectedAdvisors: string[];
  selectedActions: string[];
  timestamp: Date;
}

export interface ReactivationUpdate {
  userId: string;
  userName: string;
  sequence: string[];
  timestamp: Date;
} 