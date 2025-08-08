export interface AseanCountry {
    id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    name: string;
    targetGroup: string;
    regulatoryClimate: string;
    infraWorkforce: string;
    govtLeverage: string;
    commercialRisk: string;
    projectedRevenue: string;
    strategicNotes: string[];
}
export declare const MARKET_COUNTRIES: AseanCountry[];
export interface BudgetFunction {
    id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    name: string;
    description: string;
}
export declare const BUDGET_FUNCTIONS: BudgetFunction[];
export declare const REGION_GUIDANCE: Record<string, Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F', string>>;
export declare const GROUP_CONFIG: {
    MAX_GROUP_SIZE: number;
    MIN_GROUP_SIZE: number;
    PITCH_DURATION: number;
    VOTING_DURATION: number;
    CONSENSUS_TIMEOUT: number;
};
//# sourceMappingURL=groupData.d.ts.map