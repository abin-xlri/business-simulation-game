export interface Group {
  id: string;
  sessionId: string;
  name: string;
  taskType: GroupTaskType;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  messages: GroupMessage[];
  decisions: GroupDecision[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  message: string;
  messageType: MessageType;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface GroupDecision {
  id: string;
  groupId: string;
  taskType: GroupTaskType;
  decision: any; // JSON data
  status: DecisionStatus;
  createdAt: string;
  updatedAt: string;
}

export enum GroupTaskType {
  MARKET_SELECTION = 'MARKET_SELECTION',
  BUDGET_ALLOCATION = 'BUDGET_ALLOCATION'
}

export enum GroupStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISBANDED = 'DISBANDED'
}

export enum GroupRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER'
}

export enum MessageType {
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
  DECISION = 'DECISION'
}

export enum DecisionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Market Selection specific types
export interface MarketSelectionData {
  countries: MarketCountry[];
  assignments: CountryAssignment[];
  votes: CountryVote[];
  finalRanking?: string[];
}

export interface MarketCountry {
  code: string;
  name: string;
  description: string;
  marketSize: number;
  competition: number;
  regulatoryEase: number;
  growthPotential: number;
}

export interface CountryAssignment {
  userId: string;
  userName: string;
  countryCode: string;
  pitchCompleted: boolean;
  pitchStartTime?: string;
}

export interface CountryVote {
  userId: string;
  userName: string;
  rankings: {
    first: string;
    second: string;
    third: string;
  };
}

// Budget Allocation specific types
export interface BudgetAllocationData {
  functions: BudgetFunction[];
  allocations: FunctionAllocation[];
  consensus: ConsensusStatus;
}

export interface BudgetFunction {
  id: string;
  name: string;
  description: string;
  currentPriority: number;
  urbanROI: number;
  ruralROI: number;
  suburbanROI: number;
}

export interface FunctionAllocation {
  functionId: string;
  priority: number;
  allocatedBy: string;
  timestamp: string;
}

export interface ConsensusStatus {
  allAgreed: boolean;
  agreedUsers: string[];
  pendingUsers: string[];
}

// WebSocket Event Types
export interface SocketEvents {
  // Group Management
  'create-group': {
    sessionId: string;
    name: string;
    taskType: GroupTaskType;
    memberIds: string[];
  };
  'join-group': {
    groupId: string;
    userId: string;
  };
  'leave-group': {
    groupId: string;
    userId: string;
  };

  // Messaging
  'group-message': {
    groupId: string;
    userId: string;
    message: string;
    messageType: MessageType;
  };

  // Decision Making
  'group-decision': {
    groupId: string;
    taskType: GroupTaskType;
    decision: any;
    userId: string;
  };

  // Market Selection Events
  'market-pitch-start': {
    groupId: string;
    userId: string;
    countryCode: string;
  };
  'market-pitch-end': {
    groupId: string;
    userId: string;
    countryCode: string;
  };
  'market-vote': {
    groupId: string;
    userId: string;
    rankings: {
      first: string;
      second: string;
      third: string;
    };
  };

  // Budget Allocation Events
  'budget-function-update': {
    groupId: string;
    functionId: string;
    priority: number;
    userId: string;
  };
  'budget-consensus-request': {
    groupId: string;
    userId: string;
  };
  'budget-consensus-response': {
    groupId: string;
    userId: string;
    agreed: boolean;
  };
}

// API Response Types
export interface CreateGroupRequest {
  sessionId: string;
  name: string;
  taskType: GroupTaskType;
  memberIds: string[];
}

export interface CreateGroupResponse {
  success: boolean;
  group: Group;
}

export interface JoinGroupRequest {
  groupId: string;
}

export interface JoinGroupResponse {
  success: boolean;
  group: Group;
}

export interface GetGroupResponse {
  success: boolean;
  group: Group;
}

export interface SendMessageRequest {
  groupId: string;
  message: string;
  messageType?: MessageType;
}

export interface SendMessageResponse {
  success: boolean;
  message: GroupMessage;
}

export interface GetMessagesResponse {
  success: boolean;
  messages: GroupMessage[];
}

export interface SubmitDecisionRequest {
  groupId: string;
  taskType: GroupTaskType;
  decision: any;
}

export interface SubmitDecisionResponse {
  success: boolean;
  decision: GroupDecision;
} 