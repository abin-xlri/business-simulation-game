export interface Station {
    code: string;
    name: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    region: 'URBAN' | 'RURAL' | 'SUBURBAN';
}
export interface RouteSegment {
    fromCode: string;
    toCode: string;
    distance: number;
    speed: number;
}
export declare const STATIONS: Station[];
export declare const ROUTE_SEGMENTS: RouteSegment[];
export declare const REVENUE_BY_RISK: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
};
export declare const REGIONAL_MODIFIERS: {
    URBAN: number;
    RURAL: number;
    SUBURBAN: number;
};
export declare const OPERATING_COSTS: {
    FUEL_PER_KM: number;
    VAN_TIME_PER_HOUR: number;
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
    reach: number;
    expertise: number;
    cost: number;
    reliability: number;
    scalability: number;
    innovation: number;
}
export declare const PARTNERS: Partner[];
export declare const STRATEGIC_PRIORITIES: {
    reach: number;
    expertise: number;
    cost: number;
    reliability: number;
    scalability: number;
    innovation: number;
};
export declare const MAX_PARTNER_SCORE = 10;
//# sourceMappingURL=round1Data.d.ts.map