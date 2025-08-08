"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACTIVATION_CONSTRAINTS = exports.CRISIS_CONSTRAINTS = exports.REACTIVATION_NODES = exports.CRISIS_ACTIONS = exports.CRISIS_ADVISORS = exports.CRISIS_SCENARIOS = void 0;
// Updated to match Business-Simulation.txt exactly
exports.CRISIS_SCENARIOS = [
    {
        id: 'malaysia',
        name: 'Malaysia Clinical Trial Crisis',
        description: 'Whistleblower released audio recordings suggesting that clinical trial participants were not given proper informed consent. Hashtags like #TrialGate are trending. Influencers are calling for your resignation. The Ministry of Health (MoH) has mandated a full ethics audit within 5 days.',
        severity: 'CRITICAL',
        impact: 'Long-term brand trust collapses; medical professionals will boycott your clinical trials; potential license risk.',
        timePressure: '5 days for ethics audit',
        complexity: 'Legal, ethical, media crisis'
    },
    {
        id: 'vietnam',
        name: 'Vietnam Efficacy Data Crisis',
        description: 'Your Country Director overstated the trial efficacy data (claimed 85% vs actual 63%) during a live national TV interview. The MoH has frozen your trial licenses. Meanwhile, your internal research team is threatening to resign over "ethical misalignment."',
        severity: 'CRITICAL',
        impact: 'Loss of scientific credibility, regulatory shutdown, and staff exodus.',
        timePressure: 'Immediate response required',
        complexity: 'Regulatory, internal trust crisis'
    },
    {
        id: 'indonesia',
        name: 'Indonesia Software Glitch Crisis',
        description: 'A temperature-monitoring software glitch caused 18,000 doses of ImmLance™ to spoil. Patients have begun reporting fever and rashes. Clinics have stopped administering your product. Your tech partner blames a firmware bug.',
        severity: 'HIGH',
        impact: 'Field-level revolt, lawsuits, MoH audit, major revenue loss, breakdown in partner trust.',
        timePressure: '72 hours to stabilize',
        complexity: 'Technical, operational, legal crisis'
    }
];
// Updated advisor names to match document exactly
exports.CRISIS_ADVISORS = [
    {
        id: 'ritika_sen',
        name: 'Ritika Sen',
        expertise: 'PR and social media strategy',
        strength: 'Crisis communication, stakeholder relations',
        weakness: 'Tends to underplay legal angles',
        cost: 1
    },
    {
        id: 'surya_nair',
        name: 'Surya Nair',
        expertise: 'Legal and MoH regulation expert',
        strength: 'Legal framework analysis, compliance strategies',
        weakness: 'Tends to avoid public statements',
        cost: 2
    },
    {
        id: 'alisha_tan',
        name: 'Alisha Tan',
        expertise: 'Ex-physician and field operations expert',
        strength: 'Strong in empathy, field operations',
        weakness: 'Anti-corporate communication tone',
        cost: 1
    },
    {
        id: 'deep_mehta',
        name: 'Deep Mehta',
        expertise: 'Biostatistician, neutral communicator',
        strength: 'Data analysis, neutral communication',
        weakness: 'Weak in emotional/political backlash',
        cost: 1
    }
];
// Updated actions to match document exactly
exports.CRISIS_ACTIONS = [
    {
        id: 'A1',
        name: 'Launch independent ethics audit (legal-led)',
        description: 'Clears MoH expectations in Malaysia, but could trigger media leaks',
        effectiveness: 8,
        cost: 35,
        timeRequired: '5 days',
        risk: 'Medium'
    },
    {
        id: 'A2',
        name: 'Public apology across ASEAN press',
        description: 'Calms public sentiment, but could lead to deeper regulatory probing',
        effectiveness: 7,
        cost: 25,
        timeRequired: 'Immediate',
        risk: 'Medium'
    },
    {
        id: 'A3',
        name: 'Replace Vietnam Country Director + restructure team',
        description: 'Rebuilds internal trust, but raises flags with regulators',
        effectiveness: 8,
        cost: 30,
        timeRequired: '2-3 days',
        risk: 'High'
    },
    {
        id: 'A4',
        name: 'Send field repair + cold-chain rebuild team (Indonesia)',
        description: 'Restores field operations but depends on clinic cooperation',
        effectiveness: 9,
        cost: 20,
        timeRequired: '3-5 days',
        risk: 'Low'
    },
    {
        id: 'A5',
        name: 'Issue joint statement with tech vendor, blaming "shared failure"',
        description: 'Deflects liability, but may anger MoH',
        effectiveness: 6,
        cost: 10,
        timeRequired: 'Immediate',
        risk: 'Medium'
    }
];
// Reactivation Challenge (Task 2) - System Nodes
// Reactivation nodes (script-aligned A–E with dependencies by phase notion)
exports.REACTIVATION_NODES = [
    { id: 'A', name: 'Digital Patient Records', description: 'Clinical records systems', priority: 4, duration: 4, dependencies: ['E', 'B'], risk: 'High', resources: [] },
    { id: 'B', name: 'Regional Supply Hubs', description: 'Ops, Warehouse, Finance, Vendors', priority: 3, duration: 4, dependencies: ['E'], risk: 'High', resources: [] },
    { id: 'C', name: 'Clinical Trial Data Team', description: 'Trial Staff, Regulators, Analysts, Partners', priority: 3, duration: 4, dependencies: ['B', 'E'], risk: 'High', resources: [] },
    { id: 'D', name: 'Medical Rep Field Force', description: 'Doctors, Public, Sales, Service', priority: 2, duration: 4, dependencies: ['A', 'C'], risk: 'High', resources: [] },
    { id: 'E', name: 'Compliance Verification Unit', description: 'Legal, Health Ministry, Compliance, Audit', priority: 5, duration: 4, dependencies: [], risk: 'Medium', resources: [] },
];
// Crisis Management Constraints
exports.CRISIS_CONSTRAINTS = {
    MAX_ADVISORS: 2,
    MAX_ACTIONS: 3,
    TOTAL_POINTS: 75, // Updated to match document
    ADVISOR_COSTS: {
        ritika_sen: 1,
        surya_nair: 2,
        alisha_tan: 1,
        deep_mehta: 1
    },
    ACTION_COSTS: {
        A1: 35,
        A2: 25,
        A3: 30,
        A4: 20,
        A5: 10
    }
};
// Reactivation Constraints
exports.REACTIVATION_CONSTRAINTS = {
    MAX_PARALLEL_TASKS: 2, // two nodes at a time
    CRITICAL_PATH_TIME: 12 * 24, // not used directly; we will validate 12 days overall in controller
    RESOURCE_LIMITS: {} // not used in script; keep empty for now
};
//# sourceMappingURL=crisisData.js.map