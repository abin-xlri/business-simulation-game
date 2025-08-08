export interface Partner {
  id: string;
  name: string;
  description: string;
  criteria: PartnerCriteria;
}

export interface PartnerCriteria {
  reach: number;           // 1-10 scale
  expertise: number;       // 1-10 scale
  cost: number;           // 1-10 scale (1 = expensive, 10 = cheap)
  reliability: number;     // 1-10 scale
  scalability: number;     // 1-10 scale
  innovation: number;      // 1-10 scale
}

export interface PartnerScore {
  partner: Partner;
  score: number;
  breakdown: {
    reach: number;
    expertise: number;
    cost: number;
    reliability: number;
    scalability: number;
    innovation: number;
  };
}

export interface StrategicPriorities {
  reach: number;
  expertise: number;
  cost: number;
  reliability: number;
  scalability: number;
  innovation: number;
}

export interface PartnerSelection {
  partnerId: string;
  partnerName: string;
  score: number;
  selectedAt: string;
}

// API Response Types
export interface PartnersResponse {
  success: boolean;
  partners: Partner[];
}

export interface PartnerScoresResponse {
  success: boolean;
  scores: PartnerScore[];
  maxScore: number;
  priorities: StrategicPriorities;
}

export interface PartnerSelectionResponse {
  success: boolean;
  selection: PartnerSelection | null;
}

export interface SubmitPartnerSelectionRequest {
  partnerId: string;
}

export interface SubmitPartnerSelectionResponse {
  success: boolean;
  selection: PartnerSelection;
} 