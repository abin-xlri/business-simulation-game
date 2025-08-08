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
            const { scenarioId, selectedAdvisors, selectedActions } = req.body;
            const userId = req.user?.id;
            const sessionId = req.params.sessionId;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            // Validate constraints
            const validation = CrisisController.validateCrisisWebConstraints(selectedAdvisors, selectedActions);
            if (!validation.isValid) {
                return res.status(400).json({
                    error: 'Invalid submission',
                    validation
                });
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
            const userId = req.user?.id;
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
        let totalDuration = 0;
        let criticalPathTime = 0;
        // Check for dependency violations
        for (let i = 0; i < sequence.length; i++) {
            const nodeId = sequence[i];
            const node = crisisData_1.REACTIVATION_NODES.find(n => n.id === nodeId);
            if (!node)
                continue;
            // Check if dependencies are satisfied
            for (const dependencyId of node.dependencies) {
                const dependencyIndex = sequence.indexOf(dependencyId);
                if (dependencyIndex === -1 || dependencyIndex >= i) {
                    violations.push({
                        type: 'dependency_violation',
                        message: `${node.name} requires ${dependencyId} to be completed first`,
                        severity: 'error'
                    });
                }
            }
            // Calculate resource conflicts
            node.resources.forEach(resource => {
                if (!resourceConflicts[resource]) {
                    resourceConflicts[resource] = 0;
                }
                resourceConflicts[resource] += 1;
            });
            totalDuration += node.duration;
        }
        // Check resource limits
        Object.entries(resourceConflicts).forEach(([resource, count]) => {
            const limit = crisisData_1.REACTIVATION_CONSTRAINTS.RESOURCE_LIMITS[resource];
            if (limit && count > limit) {
                violations.push({
                    type: 'resource_conflict',
                    message: `${resource} exceeds limit (${count}/${limit})`,
                    severity: 'error'
                });
            }
        });
        // Calculate critical path time (simplified)
        criticalPathTime = Math.ceil(totalDuration / crisisData_1.REACTIVATION_CONSTRAINTS.MAX_PARALLEL_TASKS);
        return {
            isValid: violations.length === 0,
            violations,
            totalDuration,
            criticalPathTime,
            resourceConflicts
        };
    }
    static calculateEffectiveness(selectedAdvisors, selectedActions) {
        let totalEffectiveness = 0;
        let count = 0;
        selectedActions.forEach(actionId => {
            const action = crisisData_1.CRISIS_ACTIONS.find(a => a.id === actionId);
            if (action) {
                totalEffectiveness += action.effectiveness;
                count++;
            }
        });
        // Advisor bonuses
        selectedAdvisors.forEach(advisorId => {
            const advisor = crisisData_1.CRISIS_ADVISORS.find(a => a.id === advisorId);
            if (advisor) {
                // Add advisor-specific bonuses
                switch (advisorId) {
                    case 'legal':
                        totalEffectiveness += 1; // Legal expertise bonus
                        break;
                    case 'operations':
                        totalEffectiveness += 1.5; // Operations expertise bonus
                        break;
                    case 'communications':
                        totalEffectiveness += 0.5; // Communication bonus
                        break;
                    case 'finance':
                        totalEffectiveness += 0.5; // Financial optimization bonus
                        break;
                }
                count++;
            }
        });
        return count > 0 ? Math.round((totalEffectiveness / count) * 10) / 10 : 0;
    }
    static calculateRiskLevel(selectedAdvisors, selectedActions) {
        let riskScore = 0;
        selectedActions.forEach(actionId => {
            const action = crisisData_1.CRISIS_ACTIONS.find(a => a.id === actionId);
            if (action) {
                switch (action.risk) {
                    case 'Low':
                        riskScore += 1;
                        break;
                    case 'Medium':
                        riskScore += 2;
                        break;
                    case 'High':
                        riskScore += 3;
                        break;
                }
            }
        });
        if (riskScore <= 3)
            return 'Low';
        if (riskScore <= 6)
            return 'Medium';
        return 'High';
    }
    static calculateRiskScore(sequence) {
        let riskScore = 0;
        sequence.forEach(nodeId => {
            const node = crisisData_1.REACTIVATION_NODES.find(n => n.id === nodeId);
            if (node) {
                // Higher priority nodes have lower risk
                riskScore += (9 - node.priority) * 0.5;
                // Longer duration increases risk
                riskScore += node.duration * 0.2;
            }
        });
        return Math.round(riskScore * 10) / 10;
    }
}
exports.CrisisController = CrisisController;
//# sourceMappingURL=crisisController.js.map