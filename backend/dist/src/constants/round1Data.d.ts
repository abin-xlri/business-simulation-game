import { Station, RouteSegment } from '../../shared/types/round1';
export declare const STATIONS: Station[];
export declare const ROUTE_SEGMENTS: RouteSegment[];
export declare const REVENUE_BY_RISK: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
};
export declare const OPERATING_COSTS: {
    FUEL_COST_PER_KM: number;
    VAN_OPERATING_COST_PER_HOUR: number;
    COLD_CHAIN_PENALTY: number;
    URBAN_MODIFIER: number;
    RURAL_MODIFIER: number;
};
export declare const REGIONAL_MODIFIERS: {
    URBAN: number;
    RURAL: number;
    SEMI_URBAN: number;
};
export declare const COLD_CHAIN_PENALTY = 100000;
export declare const MAX_SEGMENT_TIME = 2;
export interface Partner {
    id: string;
    name: string;
    description: string;
    criteria: PartnerCriteria;
}
export interface PartnerCriteria {
    networkCoverage: number;
    speedOfOnboardingDays: number;
    coldChainInfraScore: number;
    communityTrustScore: number;
    moHCoordinationScore: number;
    dataReportingScore: number;
    operationalRiskScore: number;
    scalabilityYear2Score: number;
    biologicsExperienceScore: number;
    costPerPatient: number;
    mediaPoliticalRiskScore: number;
}
export declare const PARTNERS: Partner[];
export declare const STRATEGIC_PRIORITIES: {
    speedOfOnboarding: number;
    moHCoordination: number;
    dataReporting: number;
    coldChainInfra: number;
    communityTrust: number;
    scalabilityYear2: number;
    biologicsExperience: number;
    mediaPoliticalRisk: number;
    networkCoverage: number;
    costPerPatient: number;
};
export declare const MAX_PARTNER_SCORE = 10;
//# sourceMappingURL=round1Data.d.ts.map