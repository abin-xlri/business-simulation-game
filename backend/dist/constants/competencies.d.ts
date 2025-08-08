import { CompetencyCategory, TaskType } from '../shared/types/scoring';
export declare const COMPETENCIES: {
    id: string;
    name: string;
    description: string;
    category: any;
    weight: number;
}[];
export declare const TASK_COMPETENCY_MAPPINGS: {
    [TaskType.ROUND1_TASK1_ROUTE_OPTIMIZATION]: {
        competencyId: string;
        weight: number;
    }[];
    [TaskType.ROUND1_TASK2_PARTNER_SELECTION]: {
        competencyId: string;
        weight: number;
    }[];
    [TaskType.ROUND2_GROUP_MARKET_SELECTION]: {
        competencyId: string;
        weight: number;
    }[];
    [TaskType.ROUND2_GROUP_BUDGET_ALLOCATION]: {
        competencyId: string;
        weight: number;
    }[];
    [TaskType.ROUND3_TASK1_CRISIS_WEB]: {
        competencyId: string;
        weight: number;
    }[];
    [TaskType.ROUND3_TASK2_REACTIVATION_CHALLENGE]: {
        competencyId: string;
        weight: number;
    }[];
};
export declare const TASK_NAMES: {
    [TaskType.ROUND1_TASK1_ROUTE_OPTIMIZATION]: string;
    [TaskType.ROUND1_TASK2_PARTNER_SELECTION]: string;
    [TaskType.ROUND2_GROUP_MARKET_SELECTION]: string;
    [TaskType.ROUND2_GROUP_BUDGET_ALLOCATION]: string;
    [TaskType.ROUND3_TASK1_CRISIS_WEB]: string;
    [TaskType.ROUND3_TASK2_REACTIVATION_CHALLENGE]: string;
};
export declare const SCORING_THRESHOLDS: {
    EXCELLENT: number;
    GOOD: number;
    SATISFACTORY: number;
    NEEDS_IMPROVEMENT: number;
    POOR: number;
};
export declare const FEEDBACK_TEMPLATES: {
    [CompetencyCategory.ANALYTICAL_THINKING]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.STRATEGIC_PLANNING]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.COLLABORATION]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.LEADERSHIP]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.PROBLEM_SOLVING]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.DECISION_MAKING]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.COMMUNICATION]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.ADAPTABILITY]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.INNOVATION]: {
        strengths: string[];
        areasForImprovement: string[];
    };
    [CompetencyCategory.EXECUTION]: {
        strengths: string[];
        areasForImprovement: string[];
    };
};
//# sourceMappingURL=competencies.d.ts.map