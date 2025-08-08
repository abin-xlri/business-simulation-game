import { CompetencyCategory } from '../../shared/types/scoring';
export declare const COMPETENCIES: {
    id: string;
    name: string;
    description: string;
    category: CompetencyCategory;
    weight: number;
}[];
export declare const TASK_COMPETENCY_MAPPINGS: {
    ROUND1_TASK1_ROUTE_OPTIMIZATION: {
        competencyId: string;
        weight: number;
    }[];
    ROUND1_TASK2_PARTNER_SELECTION: {
        competencyId: string;
        weight: number;
    }[];
    ROUND2_GROUP_MARKET_SELECTION: {
        competencyId: string;
        weight: number;
    }[];
    ROUND2_GROUP_BUDGET_ALLOCATION: {
        competencyId: string;
        weight: number;
    }[];
    ROUND3_TASK1_CRISIS_WEB: {
        competencyId: string;
        weight: number;
    }[];
    ROUND3_TASK2_REACTIVATION_CHALLENGE: {
        competencyId: string;
        weight: number;
    }[];
};
export declare const TASK_NAMES: {
    ROUND1_TASK1_ROUTE_OPTIMIZATION: string;
    ROUND1_TASK2_PARTNER_SELECTION: string;
    ROUND2_GROUP_MARKET_SELECTION: string;
    ROUND2_GROUP_BUDGET_ALLOCATION: string;
    ROUND3_TASK1_CRISIS_WEB: string;
    ROUND3_TASK2_REACTIVATION_CHALLENGE: string;
};
export declare const SCORING_THRESHOLDS: {
    EXCELLENT: number;
    GOOD: number;
    SATISFACTORY: number;
    NEEDS_IMPROVEMENT: number;
    POOR: number;
};
export declare const FEEDBACK_TEMPLATES: {
    ANALYTICAL_THINKING: {
        strengths: string[];
        areasForImprovement: string[];
    };
    STRATEGIC_PLANNING: {
        strengths: string[];
        areasForImprovement: string[];
    };
    COLLABORATION: {
        strengths: string[];
        areasForImprovement: string[];
    };
    LEADERSHIP: {
        strengths: string[];
        areasForImprovement: string[];
    };
    PROBLEM_SOLVING: {
        strengths: string[];
        areasForImprovement: string[];
    };
    DECISION_MAKING: {
        strengths: string[];
        areasForImprovement: string[];
    };
    COMMUNICATION: {
        strengths: string[];
        areasForImprovement: string[];
    };
    ADAPTABILITY: {
        strengths: string[];
        areasForImprovement: string[];
    };
    INNOVATION: {
        strengths: string[];
        areasForImprovement: string[];
    };
    EXECUTION: {
        strengths: string[];
        areasForImprovement: string[];
    };
};
//# sourceMappingURL=competencies.d.ts.map