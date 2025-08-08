import { CrisisScenario, CrisisAdvisor, CrisisAction, ReactivationNode } from '../shared/types/crisisManagement';
export declare const CRISIS_SCENARIOS: CrisisScenario[];
export declare const CRISIS_ADVISORS: CrisisAdvisor[];
export declare const CRISIS_ACTIONS: CrisisAction[];
export declare const REACTIVATION_NODES: ReactivationNode[];
export declare const CRISIS_CONSTRAINTS: {
    MAX_ADVISORS: number;
    MAX_ACTIONS: number;
    TOTAL_POINTS: number;
    ADVISOR_COSTS: {
        legal: number;
        operations: number;
        communications: number;
        finance: number;
    };
    ACTION_COSTS: {
        immediate_response: number;
        stakeholder_communication: number;
        regulatory_liaison: number;
        resource_allocation: number;
        contingency_planning: number;
    };
};
export declare const REACTIVATION_CONSTRAINTS: {
    MAX_PARALLEL_TASKS: number;
    CRITICAL_PATH_TIME: number;
    RESOURCE_LIMITS: {
        'Electrical engineers': number;
        'Network engineers': number;
        'Water engineers': number;
        'Civil engineers': number;
        'Medical staff': number;
        'Emergency personnel': number;
        'IT specialists': number;
        'Educational staff': number;
    };
};
//# sourceMappingURL=crisisData.d.ts.map