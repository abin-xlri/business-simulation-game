export interface Partner {
    id: string;
    name: string;
    description: string;
    criteria: PartnerCriteria;
}
export interface PartnerCriteria {
    reach: number;
    expertise: number;
    cost: number;
    reliability: number;
    scalability: number;
    innovation: number;
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
//# sourceMappingURL=partnerSelection.d.ts.map