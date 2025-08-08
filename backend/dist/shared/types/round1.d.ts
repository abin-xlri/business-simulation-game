export interface Station {
    code: string;
    name: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    region: 'URBAN' | 'RURAL' | 'SEMI_URBAN';
}
export interface RouteSegment {
    fromCode: string;
    toCode: string;
    distance: number;
    speed: number;
}
export interface RouteCalculationResult {
    totalDistance: number;
    totalTime: number;
    coldChainBreaches: number;
    baseRevenue: number;
    regionalModifier: number;
    operatingCosts: number;
    penalties: number;
    netProfit: number;
    segments: RouteSegmentDetail[];
}
export interface RouteSegmentDetail {
    from: string;
    to: string;
    distance: number;
    time: number;
    isBreach: boolean;
}
export interface RouteCalculationRequest {
    route: string[];
}
export interface RouteCalculationResponse {
    success: boolean;
    calculation: RouteCalculationResult;
}
export interface StationsResponse {
    success: boolean;
    stations: Station[];
}
export interface SegmentsResponse {
    success: boolean;
    segments: RouteSegment[];
}
//# sourceMappingURL=round1.d.ts.map