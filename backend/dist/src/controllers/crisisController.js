"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrisisController = void 0;
const client_1 = require("@prisma/client");
const crisisData_1 = require("../constants/crisisData");
const prisma = new client_1.PrismaClient();
class CrisisController {
    // Get crisis data for Task 1
    static async getCrisisData(req, res) {
        try {
            res.json({
                scenarios: crisisData_1.CRISIS_SCENARIOS,
                advisors: crisisData_1.CRISIS_ADVISORS,
                actions: crisisData_1.CRISIS_ACTIONS,
                constraints: {
                    maxAdvisors: crisisData_1.CRISIS_CONSTRAINTS.MAX_ADVISORS,
                    maxActions: crisisData_1.CRISIS_CONSTRAINTS.MAX_ACTIONS,
                    totalPoints: crisisData_1.CRISIS_CONSTRAINTS.TOTAL_POINTS
                }
            });
        }
        catch (error) {
            console.error('Error fetching crisis data:', error);
            res.status(500).json({ error: 'Failed to fetch crisis data' });
        }
    }
    // Get reactivation data for Task 2
    static async getReactivationData(req, res) {
        try {
            res.json({
                nodes: crisisData_1.REACTIVATION_NODES,
                constraints: {
                    maxParallelTasks: crisisData_1.REACTIVATION_CONSTRAINTS.MAX_PARALLEL_TASKS,
                    criticalPathTime: crisisData_1.REACTIVATION_CONSTRAINTS.CRITICAL_PATH_TIME,
                    resourceLimits: crisisData_1.REACTIVATION_CONSTRAINTS.RESOURCE_LIMITS
                }
            });
        }
        catch (error) {
            console.error('Error fetching reactivation data:', error);
            res.status(500).json({ error: 'Failed to fetch reactivation data' });
        }
    }
    // Validate crisis web submission
    static async validateCrisisWeb(req, res) {
        try {
            const { selectedAdvisors, selectedActions } = req.body;
            const validation = CrisisController.validateCrisisWebConstraints(selectedAdvisors || [], selectedActions || []);
            res.json(validation);
        }
        catch (error) {
            console.error('Error validating crisis web submission:', error);
            res.status(500).json({ error: 'Failed to validate submission' });
        }
    }
    // Submit crisis web solution
    static async submitCrisisWeb(req, res) {
        try {
            const { scenarioId, selectedAdvisors, selectedActions, assignment } = req.body;
            const userId = req.user?.userId;
            const sessionId = req.params.sessionId;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            // Validate constraints (basic)
            const validation = CrisisController.validateCrisisWebConstraints(selectedAdvisors, selectedActions);
            if (!validation.isValid) {
                return res.status(400).json({
                    error: 'Invalid submission',
                    validation
                });
            }
            // Additional per-country checks if assignment given (optional shape: { malaysia: {advisor?: string, actions: string[]}, vietnam: {...}, indonesia: {...} })
            const violations = [];
            const a = assignment || {};
            // one crisis must be advisor-free
            const advisorFree = ['malaysia', 'vietnam', 'indonesia'].some(country => !a[country]?.advisor);
            if (!advisorFree) {
                violations.push({ type: 'advisor_limit', message: 'One crisis must be handled without an advisor', severity: 'error' });
            }
            // Vietnam cannot be advisor-free
            if (a.vietnam && !a.vietnam.advisor) {
                violations.push({ type: 'dependency_violation', message: 'Vietnam cannot be left without an advisor', severity: 'error' });
            }
            // Spend >30 on Malaysia → board audit flag (A1=35 would trigger if applied to Malaysia)
            if (a.malaysia && Array.isArray(a.malaysia.actions)) {
                const cost = a.malaysia.actions.reduce((sum, id) => {
                    const act = crisisData_1.CRISIS_ACTIONS.find(x => x.id === id);
                    return sum + (act?.cost || 0);
                }, 0);
                if (cost > 30) {
                    violations.push({ type: 'dependency_violation', message: 'Board initiates internal risk audit for Malaysia spend > 30', severity: 'warning' });
                }
            }
            if (violations.length > 0) {
                return res.status(400).json({ error: 'Invalid submission', validation: { ...validation, violations: [...validation.violations, ...violations] } });
            }
            // Calculate effectiveness and risk
            const effectiveness = CrisisController.calculateEffectiveness(selectedAdvisors, selectedActions);
            const riskLevel = CrisisController.calculateRiskLevel(selectedAdvisors, selectedActions);
            // Save submission
            const submission = await prisma.crisisWebSubmission.create({
                data: {
                    userId,
                    sessionId,
                    scenarioId,
                    selectedAdvisors,
                    selectedActions,
                    totalCost: validation.totalCost,
                    effectiveness,
                    riskLevel,
                    submittedAt: new Date()
                }
            });
            res.json({
                success: true,
                submission,
                effectiveness,
                riskLevel
            });
        }
        catch (error) {
            console.error('Error submitting crisis web solution:', error);
            res.status(500).json({ error: 'Failed to submit solution' });
        }
    }
    // Validate reactivation sequence
    static async validateReactivation(req, res) {
        try {
            const { sequence } = req.body;
            const validation = CrisisController.validateReactivationConstraints(sequence || []);
            res.json(validation);
        }
        catch (error) {
            console.error('Error validating reactivation sequence:', error);
            res.status(500).json({ error: 'Failed to validate sequence' });
        }
    }
    // Submit reactivation sequence
    static async submitReactivation(req, res) {
        try {
            const { sequence } = req.body;
            const userId = req.user?.userId;
            const sessionId = req.params.sessionId;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            // Validate constraints
            const validation = CrisisController.validateReactivationConstraints(sequence);
            if (!validation.isValid) {
                return res.status(400).json({
                    error: 'Invalid sequence',
                    validation
                });
            }
            // Calculate risk score
            const riskScore = CrisisController.calculateRiskScore(sequence);
            // Save submission
            const submission = await prisma.reactivationSequence.create({
                data: {
                    userId,
                    sessionId,
                    sequence,
                    totalDuration: validation.totalDuration,
                    criticalPathTime: validation.criticalPathTime,
                    riskScore,
                    resourceUtilization: validation.resourceConflicts,
                    submittedAt: new Date()
                }
            });
            res.json({
                success: true,
                submission,
                riskScore
            });
        }
        catch (error) {
            console.error('Error submitting reactivation sequence:', error);
            res.status(500).json({ error: 'Failed to submit sequence' });
        }
    }
    // Helper methods for validation and calculations
    static validateCrisisWebConstraints(selectedAdvisors, selectedActions) {
        const violations = [];
        let totalCost = 0;
        // Check advisor limit
        if (selectedAdvisors.length > crisisData_1.CRISIS_CONSTRAINTS.MAX_ADVISORS) {
            violations.push({
                type: 'advisor_limit',
                message: `Maximum ${crisisData_1.CRISIS_CONSTRAINTS.MAX_ADVISORS} advisors allowed`,
                severity: 'error'
            });
        }
        // Check action limit
        if (selectedActions.length > crisisData_1.CRISIS_CONSTRAINTS.MAX_ACTIONS) {
            violations.push({
                type: 'action_limit',
                message: `Maximum ${crisisData_1.CRISIS_CONSTRAINTS.MAX_ACTIONS} actions allowed`,
                severity: 'error'
            });
        }
        // Calculate total cost
        selectedAdvisors.forEach(advisorId => {
            const advisor = crisisData_1.CRISIS_ADVISORS.find(a => a.id === advisorId);
            if (advisor) {
                totalCost += advisor.cost;
            }
        });
        selectedActions.forEach(actionId => {
            const action = crisisData_1.CRISIS_ACTIONS.find(a => a.id === actionId);
            if (action) {
                totalCost += action.cost;
            }
        });
        // Matrix rules per script
        const has = (id) => selectedActions.includes(id);
        const advisor = (id) => selectedAdvisors.includes(id);
        // 1) Surya Nair used -> A1 must be used
        if (advisor('surya_nair') && !has('A1')) {
            violations.push({ type: 'dependency_violation', message: 'Using Surya Nair requires action A1 (ethics audit)', severity: 'error' });
        }
        // 2) A2 + A5 both selected -> backlash
        if (has('A2') && has('A5')) {
            violations.push({ type: 'dependency_violation', message: 'Selecting both A2 and A5 triggers backlash for being “performative”', severity: 'warning' });
            totalCost += 0; // cost unaffected; risk handled in calculateRiskLevel
        }
        // 3) Indonesia crisis cannot be resolved without A4 or A5
        if (!has('A4') && !has('A5')) {
            violations.push({ type: 'dependency_violation', message: 'Indonesia requires A4 or A5 to resolve', severity: 'error' });
        }
        // 4) Ritika Sen cannot be paired with A1
        if (advisor('ritika_sen') && has('A1')) {
            violations.push({ type: 'dependency_violation', message: 'Ritika Sen cannot be paired with A1', severity: 'error' });
        }
        // 5) Vietnam cannot be advisor-free (we enforce at submission time via UI/context; add warning here)
        // Cannot evaluate country assignment here; leave as informational (handled by frontend or per-session rules)
        // 6) Spend >30 on Malaysia -> board audit (not cost, but risk implication). We mark as warning; detailed per-country spend requires mapping; skipped here.
        // 7) Alisha Tan effective in Indonesia, worsens Vietnam -> accounted in effectiveness/risk via synergies.
        // 8) If A3 used -> must be paired with Deep Mehta or no advisor
        if (has('A3') && selectedAdvisors.length > 0 && !advisor('deep_mehta')) {
            violations.push({ type: 'dependency_violation', message: 'A3 must be paired with Deep Mehta or no advisor', severity: 'error' });
        }
        // 9) If A1 and A3 both used -> not enough points left for A4 (enforce budget effect)
        if (has('A1') && has('A3') && has('A4')) {
            violations.push({ type: 'point_budget', message: 'Using A1 and A3 leaves insufficient points for A4 within 75 budget', severity: 'error' });
        }
        // 10) If no advisor assigned to Malaysia -> escalate (cannot validate country mapping here). Informational.
        // Check point budget
        if (totalCost > crisisData_1.CRISIS_CONSTRAINTS.TOTAL_POINTS) {
            violations.push({
                type: 'point_budget',
                message: `Total cost (${totalCost}) exceeds budget (${crisisData_1.CRISIS_CONSTRAINTS.TOTAL_POINTS})`,
                severity: 'error'
            });
        }
        const remainingPoints = crisisData_1.CRISIS_CONSTRAINTS.TOTAL_POINTS - totalCost;
        return {
            isValid: violations.length === 0,
            violations,
            totalCost,
            remainingPoints
        };
    }
    static validateReactivationConstraints(sequence) {
        const violations = [];
        const resourceConflicts = {};
        // Each node has 2 phases of 2 days each => duration 4 days. We simply sum chosen nodes phases:
        // The input "sequence" is a list of node IDs in final order (A..E). We assume full restore (2 phases) unless UI sends partial later.
        // Validate dependencies by order (phase-level simplified):
        const indexOf = (id) => sequence.indexOf(id);
        const mustPrecede = (before, after) => indexOf(before) !== -1 && indexOf(after) !== -1 && indexOf(before) < indexOf(after);
        // E must precede B; E and B must precede A; E and B must precede C; A and C must precede D
        if (!(mustPrecede('E', 'B')))
            violations.push({ type: 'dependency_violation', message: 'B requires E1 first', severity: 'error' });
        if (!(mustPrecede('E', 'A') && mustPrecede('B', 'A')))
            violations.push({ type: 'dependency_violation', message: 'A requires E1 and B1 first', severity: 'error' });
        if (!(mustPrecede('E', 'C') && mustPrecede('B', 'C')))
            violations.push({ type: 'dependency_violation', message: 'C requires B1 and E1 first', severity: 'error' });
        if (!(mustPrecede('A', 'D') && mustPrecede('C', 'D')))
            violations.push({ type: 'dependency_violation', message: 'D requires A1 and C1 first', severity: 'error' });
        // Compute total duration with max 2 concurrent nodes. Each node = 4 days when fully restored.
        const totalNodes = sequence.length;
        const totalDays = Math.ceil((totalNodes * 4) / crisisData_1.REACTIVATION_CONSTRAINTS.MAX_PARALLEL_TASKS);
        const totalDuration = totalDays * 24; // hours
        const criticalPathTime = totalDuration / crisisData_1.REACTIVATION_CONSTRAINTS.MAX_PARALLEL_TASKS;
        // Validate max 12 days
        if (totalDays > 12) {
            violations.push({ type: 'dependency_violation', message: `Total plan exceeds 12 days (${totalDays}d)`, severity: 'error' });
        }
        return {
            isValid: violations.length === 0,
            violations,
            totalDuration,
            criticalPathTime,
            resourceConflicts
        };
    }
    static calculateEffectiveness(selectedAdvisors, selectedActions) {
        // Base from actions
        let total = 0;
        selectedActions.forEach(aid => {
            const a = crisisData_1.CRISIS_ACTIONS.find(x => x.id === aid);
            if (a)
                total += a.effectiveness;
        });
        // Advisor synergies: apply small bonuses
        if (selectedAdvisors.includes('surya_nair') && selectedActions.includes('A1'))
            total += 1.5;
        if (selectedAdvisors.includes('alisha_tan') && selectedActions.includes('A4'))
            total += 1.5;
        if (selectedAdvisors.includes('ritika_sen') && selectedActions.includes('A2'))
            total += 0.5;
        if (selectedAdvisors.includes('deep_mehta') && selectedActions.includes('A3'))
            total += 1.0;
        // Penalties from matrix handled in validate; here we just clamp
        const avg = selectedActions.length > 0 ? total / selectedActions.length : 0;
        return Math.max(0, Math.min(10, Math.round(avg * 10) / 10));
    }
    static calculateRiskLevel(selectedAdvisors, selectedActions) {
        let riskScore = 0;
        selectedActions.forEach(id => {
            const a = crisisData_1.CRISIS_ACTIONS.find(x => x.id === id);
            if (!a)
                return;
            riskScore += a.risk === 'Low' ? 1 : a.risk === 'Medium' ? 2 : 3;
        });
        // Synergy-based mitigation
        if (selectedAdvisors.includes('surya_nair') && selectedActions.includes('A1'))
            riskScore -= 1;
        if (selectedAdvisors.includes('alisha_tan') && selectedActions.includes('A4'))
            riskScore -= 1;
        if (selectedAdvisors.includes('ritika_sen') && selectedActions.includes('A2'))
            riskScore -= 0.5;
        return riskScore <= 3 ? 'Low' : riskScore <= 6 ? 'Medium' : 'High';
    }
    static calculateRiskScore(sequence) {
        // Compute remaining risk per script if fully restored: 50% of base risk remains.
        // We approximate by mapping base risk weights (A:3.2,B:5.4,C:4.8,D:6.0,E:2.6) normalized.
        const base = { A: 3.2, B: 5.4, C: 4.8, D: 6.0, E: 2.6 };
        let remaining = 0;
        for (const id of Object.keys(base)) {
            const touched = sequence.includes(id);
            const remain = touched ? 0.5 * base[id] : 1.0 * base[id];
            remaining += remain;
        }
        // Normalize to 0..1 risk score (higher remaining => higher risk)
        const maxTotal = Object.values(base).reduce((a, b) => a + b, 0);
        const score = remaining / maxTotal; // 0..1
        return Math.round(score * 100) / 100;
    }
}
exports.CrisisController = CrisisController;
//# sourceMappingURL=crisisController.js.map