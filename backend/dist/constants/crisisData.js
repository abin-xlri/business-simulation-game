"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACTIVATION_CONSTRAINTS = exports.CRISIS_CONSTRAINTS = exports.REACTIVATION_NODES = exports.CRISIS_ACTIONS = exports.CRISIS_ADVISORS = exports.CRISIS_SCENARIOS = void 0;
// Crisis Web (Task 1) - Crisis Scenarios
exports.CRISIS_SCENARIOS = [
    {
        id: 'malaysia',
        name: 'Malaysia Supply Chain Crisis',
        description: 'Critical pharmaceutical supply chain disruption in Malaysia affecting 3 major distribution centers',
        severity: 'HIGH',
        impact: 'Supply chain disruption affecting 40% of regional operations',
        timePressure: '48 hours to resolve',
        complexity: 'Multiple stakeholders, regulatory constraints'
    },
    {
        id: 'vietnam',
        name: 'Vietnam Regulatory Crisis',
        description: 'Sudden regulatory changes in Vietnam requiring immediate compliance updates across all operations',
        severity: 'CRITICAL',
        impact: 'Potential shutdown of all Vietnam operations',
        timePressure: '24 hours to respond',
        complexity: 'Legal implications, government relations'
    },
    {
        id: 'indonesia',
        name: 'Indonesia Natural Disaster Crisis',
        description: 'Natural disaster affecting Indonesia operations with infrastructure damage and humanitarian needs',
        severity: 'HIGH',
        impact: 'Infrastructure damage, humanitarian crisis, operational shutdown',
        timePressure: '72 hours to stabilize',
        complexity: 'Logistics challenges, humanitarian coordination'
    }
];
// Crisis Advisors
exports.CRISIS_ADVISORS = [
    {
        id: 'legal',
        name: 'Legal Counsel',
        expertise: 'Regulatory compliance, legal risk assessment',
        strength: 'Legal framework analysis, compliance strategies',
        weakness: 'Limited operational experience',
        cost: 2
    },
    {
        id: 'operations',
        name: 'Operations Director',
        expertise: 'Supply chain management, operational continuity',
        strength: 'Practical implementation, resource allocation',
        weakness: 'May overlook regulatory implications',
        cost: 2
    },
    {
        id: 'communications',
        name: 'Communications Specialist',
        expertise: 'Stakeholder communication, reputation management',
        strength: 'Crisis communication, stakeholder relations',
        weakness: 'Limited technical expertise',
        cost: 1
    },
    {
        id: 'finance',
        name: 'Financial Controller',
        expertise: 'Financial impact assessment, cost management',
        strength: 'Financial analysis, budget optimization',
        weakness: 'May prioritize cost over effectiveness',
        cost: 1
    }
];
// Crisis Actions
exports.CRISIS_ACTIONS = [
    {
        id: 'immediate_response',
        name: 'Immediate Response Team',
        description: 'Deploy emergency response team to affected area',
        effectiveness: 8,
        cost: 3,
        timeRequired: 'Immediate',
        risk: 'Medium'
    },
    {
        id: 'stakeholder_communication',
        name: 'Stakeholder Communication',
        description: 'Establish communication channels with all stakeholders',
        effectiveness: 7,
        cost: 2,
        timeRequired: '2-4 hours',
        risk: 'Low'
    },
    {
        id: 'regulatory_liaison',
        name: 'Regulatory Liaison',
        description: 'Engage with regulatory authorities for guidance',
        effectiveness: 6,
        cost: 2,
        timeRequired: '4-6 hours',
        risk: 'Medium'
    },
    {
        id: 'resource_allocation',
        name: 'Resource Reallocation',
        description: 'Redirect resources from other operations to crisis area',
        effectiveness: 9,
        cost: 4,
        timeRequired: '6-8 hours',
        risk: 'High'
    },
    {
        id: 'contingency_planning',
        name: 'Contingency Planning',
        description: 'Develop and implement backup operational plans',
        effectiveness: 7,
        cost: 3,
        timeRequired: '8-12 hours',
        risk: 'Medium'
    }
];
// Reactivation Challenge (Task 2) - System Nodes
exports.REACTIVATION_NODES = [
    {
        id: 'power_grid',
        name: 'Power Grid',
        description: 'Main electrical infrastructure',
        priority: 1,
        duration: 4,
        dependencies: [],
        risk: 'Critical infrastructure failure',
        resources: ['Electrical engineers', 'Heavy equipment']
    },
    {
        id: 'communication_network',
        name: 'Communication Network',
        description: 'Telecommunications and data systems',
        priority: 2,
        duration: 3,
        dependencies: ['power_grid'],
        risk: 'Communication blackout',
        resources: ['Network engineers', 'Satellite equipment']
    },
    {
        id: 'water_supply',
        name: 'Water Supply',
        description: 'Water treatment and distribution systems',
        priority: 3,
        duration: 2,
        dependencies: ['power_grid'],
        risk: 'Water contamination',
        resources: ['Water engineers', 'Filtration systems']
    },
    {
        id: 'transportation',
        name: 'Transportation',
        description: 'Roads, bridges, and public transport',
        priority: 4,
        duration: 5,
        dependencies: ['power_grid', 'communication_network'],
        risk: 'Transportation gridlock',
        resources: ['Civil engineers', 'Construction equipment']
    },
    {
        id: 'healthcare_facilities',
        name: 'Healthcare Facilities',
        description: 'Hospitals and medical centers',
        priority: 5,
        duration: 6,
        dependencies: ['power_grid', 'water_supply', 'communication_network'],
        risk: 'Healthcare crisis',
        resources: ['Medical staff', 'Medical supplies']
    },
    {
        id: 'emergency_services',
        name: 'Emergency Services',
        description: 'Police, fire, and emergency response',
        priority: 6,
        duration: 3,
        dependencies: ['communication_network', 'transportation'],
        risk: 'Public safety crisis',
        resources: ['Emergency personnel', 'Emergency vehicles']
    },
    {
        id: 'financial_systems',
        name: 'Financial Systems',
        description: 'Banks, ATMs, and financial services',
        priority: 7,
        duration: 4,
        dependencies: ['power_grid', 'communication_network'],
        risk: 'Financial crisis',
        resources: ['IT specialists', 'Financial experts']
    },
    {
        id: 'education_facilities',
        name: 'Education Facilities',
        description: 'Schools and educational institutions',
        priority: 8,
        duration: 2,
        dependencies: ['power_grid', 'transportation'],
        risk: 'Educational disruption',
        resources: ['Educational staff', 'Educational materials']
    }
];
// Crisis Management Constraints
exports.CRISIS_CONSTRAINTS = {
    MAX_ADVISORS: 2,
    MAX_ACTIONS: 3,
    TOTAL_POINTS: 6,
    ADVISOR_COSTS: {
        legal: 2,
        operations: 2,
        communications: 1,
        finance: 1
    },
    ACTION_COSTS: {
        immediate_response: 3,
        stakeholder_communication: 2,
        regulatory_liaison: 2,
        resource_allocation: 4,
        contingency_planning: 3
    }
};
// Reactivation Constraints
exports.REACTIVATION_CONSTRAINTS = {
    MAX_PARALLEL_TASKS: 3,
    CRITICAL_PATH_TIME: 24, // hours
    RESOURCE_LIMITS: {
        'Electrical engineers': 4,
        'Network engineers': 3,
        'Water engineers': 2,
        'Civil engineers': 5,
        'Medical staff': 8,
        'Emergency personnel': 6,
        'IT specialists': 3,
        'Educational staff': 4
    }
};
//# sourceMappingURL=crisisData.js.map