"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEEDBACK_TEMPLATES = exports.SCORING_THRESHOLDS = exports.TASK_NAMES = exports.TASK_COMPETENCY_MAPPINGS = exports.COMPETENCIES = void 0;
const scoring_1 = require("../shared/types/scoring");
// Core Competencies Definition
exports.COMPETENCIES = [
    {
        id: 'analytical_thinking',
        name: 'Analytical Thinking',
        description: 'Ability to analyze complex data, identify patterns, and draw logical conclusions',
        category: scoring_1.CompetencyCategory.ANALYTICAL_THINKING,
        weight: 1.0
    },
    {
        id: 'strategic_planning',
        name: 'Strategic Planning',
        description: 'Capacity to develop long-term strategies and align actions with organizational goals',
        category: scoring_1.CompetencyCategory.STRATEGIC_PLANNING,
        weight: 1.0
    },
    {
        id: 'collaboration',
        name: 'Collaboration',
        description: 'Ability to work effectively with others, share information, and achieve common goals',
        category: scoring_1.CompetencyCategory.COLLABORATION,
        weight: 1.0
    },
    {
        id: 'leadership',
        name: 'Leadership',
        description: 'Capacity to guide and motivate others, make decisions, and take responsibility',
        category: scoring_1.CompetencyCategory.LEADERSHIP,
        weight: 1.0
    },
    {
        id: 'problem_solving',
        name: 'Problem Solving',
        description: 'Ability to identify problems, generate solutions, and implement effective strategies',
        category: scoring_1.CompetencyCategory.PROBLEM_SOLVING,
        weight: 1.0
    },
    {
        id: 'decision_making',
        name: 'Decision Making',
        description: 'Capacity to evaluate options, consider consequences, and make sound decisions',
        category: scoring_1.CompetencyCategory.DECISION_MAKING,
        weight: 1.0
    },
    {
        id: 'communication',
        name: 'Communication',
        description: 'Ability to convey information clearly, listen actively, and engage in effective dialogue',
        category: scoring_1.CompetencyCategory.COMMUNICATION,
        weight: 1.0
    },
    {
        id: 'adaptability',
        name: 'Adaptability',
        description: 'Capacity to adjust to changing circumstances and learn from new situations',
        category: scoring_1.CompetencyCategory.ADAPTABILITY,
        weight: 1.0
    },
    {
        id: 'innovation',
        name: 'Innovation',
        description: 'Ability to think creatively, generate new ideas, and implement novel solutions',
        category: scoring_1.CompetencyCategory.INNOVATION,
        weight: 1.0
    },
    {
        id: 'execution',
        name: 'Execution',
        description: 'Capacity to implement plans effectively, manage resources, and achieve results',
        category: scoring_1.CompetencyCategory.EXECUTION,
        weight: 1.0
    }
];
// Task-Competency Mappings with Weights
exports.TASK_COMPETENCY_MAPPINGS = {
    [scoring_1.TaskType.ROUND1_TASK1_ROUTE_OPTIMIZATION]: [
        { competencyId: 'analytical_thinking', weight: 0.35 },
        { competencyId: 'problem_solving', weight: 0.25 },
        { competencyId: 'decision_making', weight: 0.20 },
        { competencyId: 'execution', weight: 0.20 }
    ],
    [scoring_1.TaskType.ROUND1_TASK2_PARTNER_SELECTION]: [
        { competencyId: 'strategic_planning', weight: 0.30 },
        { competencyId: 'decision_making', weight: 0.25 },
        { competencyId: 'analytical_thinking', weight: 0.25 },
        { competencyId: 'communication', weight: 0.20 }
    ],
    [scoring_1.TaskType.ROUND2_GROUP_MARKET_SELECTION]: [
        { competencyId: 'collaboration', weight: 0.30 },
        { competencyId: 'communication', weight: 0.25 },
        { competencyId: 'leadership', weight: 0.20 },
        { competencyId: 'strategic_planning', weight: 0.15 },
        { competencyId: 'decision_making', weight: 0.10 }
    ],
    [scoring_1.TaskType.ROUND2_GROUP_BUDGET_ALLOCATION]: [
        { competencyId: 'collaboration', weight: 0.25 },
        { competencyId: 'strategic_planning', weight: 0.25 },
        { competencyId: 'analytical_thinking', weight: 0.20 },
        { competencyId: 'execution', weight: 0.15 },
        { competencyId: 'communication', weight: 0.15 }
    ],
    [scoring_1.TaskType.ROUND3_TASK1_CRISIS_WEB]: [
        { competencyId: 'problem_solving', weight: 0.30 },
        { competencyId: 'adaptability', weight: 0.25 },
        { competencyId: 'decision_making', weight: 0.20 },
        { competencyId: 'analytical_thinking', weight: 0.15 },
        { competencyId: 'innovation', weight: 0.10 }
    ],
    [scoring_1.TaskType.ROUND3_TASK2_REACTIVATION_CHALLENGE]: [
        { competencyId: 'strategic_planning', weight: 0.30 },
        { competencyId: 'execution', weight: 0.25 },
        { competencyId: 'problem_solving', weight: 0.20 },
        { competencyId: 'analytical_thinking', weight: 0.15 },
        { competencyId: 'adaptability', weight: 0.10 }
    ]
};
// Task Names for Display
exports.TASK_NAMES = {
    [scoring_1.TaskType.ROUND1_TASK1_ROUTE_OPTIMIZATION]: 'Route Optimization',
    [scoring_1.TaskType.ROUND1_TASK2_PARTNER_SELECTION]: 'Partner Selection',
    [scoring_1.TaskType.ROUND2_GROUP_MARKET_SELECTION]: 'Group Market Selection',
    [scoring_1.TaskType.ROUND2_GROUP_BUDGET_ALLOCATION]: 'Group Budget Allocation',
    [scoring_1.TaskType.ROUND3_TASK1_CRISIS_WEB]: 'Crisis Web Management',
    [scoring_1.TaskType.ROUND3_TASK2_REACTIVATION_CHALLENGE]: 'Reactivation Challenge'
};
// Scoring Thresholds
exports.SCORING_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 75,
    SATISFACTORY: 60,
    NEEDS_IMPROVEMENT: 45,
    POOR: 30
};
// Feedback Templates
exports.FEEDBACK_TEMPLATES = {
    [scoring_1.CompetencyCategory.ANALYTICAL_THINKING]: {
        strengths: [
            'Demonstrated strong ability to analyze complex data',
            'Effectively identified key patterns and relationships',
            'Applied logical reasoning to solve problems'
        ],
        areasForImprovement: [
            'Could benefit from more systematic data analysis',
            'Consider exploring alternative analytical approaches',
            'Focus on validating assumptions with data'
        ]
    },
    [scoring_1.CompetencyCategory.STRATEGIC_PLANNING]: {
        strengths: [
            'Showed excellent long-term thinking',
            'Effectively aligned actions with goals',
            'Demonstrated strategic vision'
        ],
        areasForImprovement: [
            'Consider more comprehensive scenario planning',
            'Focus on contingency planning',
            'Evaluate strategic trade-offs more thoroughly'
        ]
    },
    [scoring_1.CompetencyCategory.COLLABORATION]: {
        strengths: [
            'Worked effectively with team members',
            'Contributed positively to group dynamics',
            'Shared information and resources appropriately'
        ],
        areasForImprovement: [
            'Could take more initiative in group activities',
            'Consider more active listening to others',
            'Focus on building consensus more effectively'
        ]
    },
    [scoring_1.CompetencyCategory.LEADERSHIP]: {
        strengths: [
            'Demonstrated clear leadership qualities',
            'Effectively guided team direction',
            'Took responsibility for outcomes'
        ],
        areasForImprovement: [
            'Could provide more structured guidance',
            'Consider delegating more effectively',
            'Focus on motivating team members'
        ]
    },
    [scoring_1.CompetencyCategory.PROBLEM_SOLVING]: {
        strengths: [
            'Identified problems accurately',
            'Generated creative solutions',
            'Implemented effective strategies'
        ],
        areasForImprovement: [
            'Consider more systematic problem analysis',
            'Explore a wider range of solution options',
            'Focus on evaluating solution effectiveness'
        ]
    },
    [scoring_1.CompetencyCategory.DECISION_MAKING]: {
        strengths: [
            'Made well-reasoned decisions',
            'Considered multiple factors',
            'Evaluated consequences effectively'
        ],
        areasForImprovement: [
            'Could gather more information before deciding',
            'Consider more stakeholders in decisions',
            'Focus on decision implementation planning'
        ]
    },
    [scoring_1.CompetencyCategory.COMMUNICATION]: {
        strengths: [
            'Communicated clearly and effectively',
            'Listened actively to others',
            'Engaged in productive dialogue'
        ],
        areasForImprovement: [
            'Could adapt communication style more',
            'Consider more structured presentations',
            'Focus on non-verbal communication'
        ]
    },
    [scoring_1.CompetencyCategory.ADAPTABILITY]: {
        strengths: [
            'Adapted well to changing circumstances',
            'Learned quickly from new situations',
            'Remained flexible in approach'
        ],
        areasForImprovement: [
            'Could anticipate changes more proactively',
            'Consider developing contingency plans',
            'Focus on building resilience'
        ]
    },
    [scoring_1.CompetencyCategory.INNOVATION]: {
        strengths: [
            'Generated creative and novel ideas',
            'Thought outside conventional boundaries',
            'Implemented innovative solutions'
        ],
        areasForImprovement: [
            'Could explore more radical innovations',
            'Consider building on others\' ideas',
            'Focus on innovation feasibility'
        ]
    },
    [scoring_1.CompetencyCategory.EXECUTION]: {
        strengths: [
            'Implemented plans effectively',
            'Managed resources efficiently',
            'Achieved desired results'
        ],
        areasForImprovement: [
            'Could improve project management skills',
            'Consider more detailed planning',
            'Focus on quality control processes'
        ]
    }
};
//# sourceMappingURL=competencies.js.map