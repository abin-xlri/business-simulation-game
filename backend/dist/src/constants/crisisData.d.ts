import { CrisisScenario, CrisisAdvisor, CrisisAction, ReactivationNode } from '../../shared/types/crisisManagement';
export declare const CRISIS_SCENARIOS: CrisisScenario[];
export declare const CRISIS_ADVISORS: CrisisAdvisor[];
export declare const CRISIS_ACTIONS: CrisisAction[];
export declare const REACTIVATION_NODES: ReactivationNode[];
export declare const CRISIS_CONSTRAINTS: {
    MAX_ADVISORS: number;
    MAX_ACTIONS: number;
    TOTAL_POINTS: number;
    ADVISOR_COSTS: {
        ritika_sen: number;
        surya_nair: number;
        alisha_tan: number;
        deep_mehta: number;
    };
    ACTION_COSTS: {
        A1: number;
        A2: number;
        A3: number;
        A4: number;
        A5: number;
    };
};
export declare const REACTIVATION_CONSTRAINTS: {
    MAX_PARALLEL_TASKS: number;
    CRITICAL_PATH_TIME: number;
    RESOURCE_LIMITS: {};
};
//# sourceMappingURL=crisisData.d.ts.map