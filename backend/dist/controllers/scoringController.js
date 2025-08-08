"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringController = void 0;
const client_1 = require("@prisma/client");
const scoring_1 = require("../shared/types/scoring");
const competencies_1 = require("../constants/competencies");
const prisma = new client_1.PrismaClient();
class ScoringController {
    // Initialize competencies in database
    static async initializeCompetencies() {
        try {
            for (const competency of competencies_1.COMPETENCIES) {
                await prisma.competency.upsert({
                    where: { name: competency.name },
                    update: competency,
                    create: {
                        id: competency.id,
                        name: competency.name,
                        description: competency.description,
                        category: competency.category,
                        weight: competency.weight
                    }
                });
            }
            // Initialize task-competency mappings
            for (const [taskType, mappings] of Object.entries(competencies_1.TASK_COMPETENCY_MAPPINGS)) {
                for (const mapping of mappings) {
                    const competency = await prisma.competency.findUnique({
                        where: { id: mapping.competencyId }
                    });
                    if (competency) {
                        await prisma.taskCompetency.upsert({
                            where: {
                                taskType_competencyId: {
                                    taskType: taskType,
                                    competencyId: competency.id
                                }
                            },
                            update: { weight: mapping.weight },
                            create: {
                                taskType: taskType,
                                competencyId: competency.id,
                                weight: mapping.weight
                            }
                        });
                    }
                }
            }
            console.log('Competencies initialized successfully');
        }
        catch (error) {
            console.error('Error initializing competencies:', error);
            throw error;
        }
    }
    // Calculate comprehensive scores for a session
    static async calculateScores(req, res) {
        try {
            const { sessionId } = req.params;
            const { recalculate = false } = req.query;
            // Get session with all participants
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                include: {
                    userSessions: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            const userScores = [];
            for (const userSession of session.userSessions) {
                const userScore = await this.calculateUserScore(userSession.user.id, sessionId);
                userScores.push(userScore);
            }
            // Sort by total score and assign ranks
            userScores.sort((a, b) => b.totalScore - a.totalScore);
            userScores.forEach((score, index) => {
                score.rank = index + 1;
            });
            // Calculate task and competency breakdowns
            const taskBreakdown = await this.calculateTaskBreakdown(sessionId, userScores);
            const competencyBreakdown = await this.calculateCompetencyBreakdown(userScores);
            const results = {
                sessionId,
                totalParticipants: userScores.length,
                userScores,
                taskBreakdown,
                competencyBreakdown
            };
            res.json({
                success: true,
                results
            });
        }
        catch (error) {
            console.error('Error calculating scores:', error);
            res.status(500).json({ error: 'Failed to calculate scores' });
        }
    }
    // Calculate individual user score
    static async calculateUserScore(userId, sessionId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const taskScores = [];
        let totalScore = 0;
        let maxTotalScore = 0;
        // Calculate scores for each task type
        for (const taskType of Object.values(scoring_1.TaskType)) {
            const taskScore = await this.calculateTaskScore(userId, sessionId, taskType);
            if (taskScore) {
                taskScores.push(taskScore);
                totalScore += taskScore.score;
                maxTotalScore += taskScore.maxScore;
            }
        }
        // Calculate competency scores
        const competencyScores = await this.calculateCompetencyScores(userId, sessionId);
        return {
            userId,
            userName: user.name,
            totalScore,
            maxTotalScore,
            overallPercentage: maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0,
            rank: 0, // Will be set later
            taskScores,
            competencyScores
        };
    }
    // Calculate score for a specific task
    static async calculateTaskScore(userId, sessionId, taskType) {
        let submission = null;
        let score = 0;
        let maxScore = 100;
        let details = {};
        switch (taskType) {
            case scoring_1.TaskType.ROUND1_TASK1_ROUTE_OPTIMIZATION:
                submission = await prisma.routeCalculation.findFirst({
                    where: { userId, sessionId }
                });
                if (submission) {
                    score = Math.max(0, submission.netProfit);
                    maxScore = 1000000; // Maximum possible profit
                    details = {
                        netProfit: submission.netProfit,
                        coldChainBreaches: submission.coldChainBreaches,
                        totalDistance: submission.totalDistance,
                        totalTime: submission.totalTime
                    };
                }
                break;
            case scoring_1.TaskType.ROUND1_TASK2_PARTNER_SELECTION:
                submission = await prisma.partnerSelection.findFirst({
                    where: { userId, sessionId }
                });
                if (submission) {
                    score = submission.score;
                    maxScore = 10; // Maximum partner score
                    details = {
                        selectedPartner: submission.partnerId,
                        score: submission.score
                    };
                }
                break;
            case scoring_1.TaskType.ROUND3_TASK1_CRISIS_WEB:
                submission = await prisma.crisisWebSubmission.findFirst({
                    where: { userId, sessionId }
                });
                if (submission) {
                    score = Math.round(submission.effectiveness * 100);
                    maxScore = 100;
                    details = {
                        effectiveness: submission.effectiveness,
                        totalCost: submission.totalCost,
                        riskLevel: submission.riskLevel
                    };
                }
                break;
            case scoring_1.TaskType.ROUND3_TASK2_REACTIVATION_CHALLENGE:
                submission = await prisma.reactivationSequence.findFirst({
                    where: { userId, sessionId }
                });
                if (submission) {
                    score = Math.round((1 - submission.riskScore) * 100);
                    maxScore = 100;
                    details = {
                        totalDuration: submission.totalDuration,
                        criticalPathTime: submission.criticalPathTime,
                        riskScore: submission.riskScore
                    };
                }
                break;
            case scoring_1.TaskType.ROUND2_GROUP_MARKET_SELECTION:
            case scoring_1.TaskType.ROUND2_GROUP_BUDGET_ALLOCATION:
                // Group tasks are scored based on behavioral indicators
                const groupScore = await this.calculateGroupTaskScore(userId, sessionId, taskType);
                if (groupScore) {
                    score = groupScore.score;
                    maxScore = groupScore.maxScore;
                    details = groupScore.details;
                }
                break;
        }
        if (!submission && taskType !== scoring_1.TaskType.ROUND2_GROUP_MARKET_SELECTION && taskType !== scoring_1.TaskType.ROUND2_GROUP_BUDGET_ALLOCATION) {
            return null;
        }
        // Calculate competency scores for this task
        const competencyScores = await this.calculateTaskCompetencyScores(userId, sessionId, taskType);
        return {
            taskType,
            taskName: competencies_1.TASK_NAMES[taskType],
            score,
            maxScore,
            percentage: maxScore > 0 ? (score / maxScore) * 100 : 0,
            competencyScores,
            details
        };
    }
    // Calculate group task scores based on behavioral indicators
    static async calculateGroupTaskScore(userId, sessionId, taskType) {
        const userGroups = await prisma.group.findMany({
            where: {
                sessionId,
                members: {
                    some: { userId }
                }
            },
            include: {
                members: true,
                messages: {
                    where: { userId }
                },
                decisions: {
                    where: { userId }
                }
            }
        });
        if (userGroups.length === 0) {
            return null;
        }
        const totalMessages = userGroups.reduce((sum, group) => sum + group.messages.length, 0);
        const leadershipRoles = userGroups.filter(group => group.members.find(m => m.userId === userId)?.role === 'LEADER').length;
        const participationScore = Math.min(100, (totalMessages * 10) + (leadershipRoles * 20));
        const collaborationScore = Math.min(100, (userGroups.length * 25) + (totalMessages * 5));
        return {
            score: (participationScore + collaborationScore) / 2,
            maxScore: 100,
            details: {
                totalMessages,
                leadershipRoles,
                participationScore,
                collaborationScore,
                groupsParticipated: userGroups.length
            }
        };
    }
    // Calculate competency scores for a specific task
    static async calculateTaskCompetencyScores(userId, sessionId, taskType) {
        const taskMappings = competencies_1.TASK_COMPETENCY_MAPPINGS[taskType] || [];
        const competencyScores = [];
        for (const mapping of taskMappings) {
            const competency = competencies_1.COMPETENCIES.find(c => c.id === mapping.competencyId);
            if (!competency)
                continue;
            const score = await this.calculateCompetencyScore(userId, sessionId, taskType, competency.id);
            competencyScores.push({
                competencyId: competency.id,
                competencyName: competency.name,
                category: competency.category,
                score: score.score,
                maxScore: score.maxScore,
                percentage: score.percentage,
                evidence: score.evidence
            });
        }
        return competencyScores;
    }
    // Calculate individual competency score
    static async calculateCompetencyScore(userId, sessionId, taskType, competencyId) {
        let score = 0;
        let maxScore = 100;
        let evidence = [];
        switch (competencyId) {
            case 'analytical_thinking':
                score = await this.calculateAnalyticalThinkingScore(userId, sessionId, taskType);
                evidence = ['Data analysis performance', 'Pattern recognition', 'Logical reasoning'];
                break;
            case 'strategic_planning':
                score = await this.calculateStrategicPlanningScore(userId, sessionId, taskType);
                evidence = ['Long-term thinking', 'Goal alignment', 'Strategic vision'];
                break;
            case 'collaboration':
                score = await this.calculateCollaborationScore(userId, sessionId, taskType);
                evidence = ['Team participation', 'Information sharing', 'Group contribution'];
                break;
            case 'leadership':
                score = await this.calculateLeadershipScore(userId, sessionId, taskType);
                evidence = ['Leadership roles', 'Team guidance', 'Decision responsibility'];
                break;
            case 'problem_solving':
                score = await this.calculateProblemSolvingScore(userId, sessionId, taskType);
                evidence = ['Problem identification', 'Solution generation', 'Implementation'];
                break;
            case 'decision_making':
                score = await this.calculateDecisionMakingScore(userId, sessionId, taskType);
                evidence = ['Decision quality', 'Factor consideration', 'Consequence evaluation'];
                break;
            case 'communication':
                score = await this.calculateCommunicationScore(userId, sessionId, taskType);
                evidence = ['Message clarity', 'Active listening', 'Dialogue engagement'];
                break;
            case 'adaptability':
                score = await this.calculateAdaptabilityScore(userId, sessionId, taskType);
                evidence = ['Change adaptation', 'Learning speed', 'Flexibility'];
                break;
            case 'innovation':
                score = await this.calculateInnovationScore(userId, sessionId, taskType);
                evidence = ['Creative thinking', 'Novel solutions', 'Innovation implementation'];
                break;
            case 'execution':
                score = await this.calculateExecutionScore(userId, sessionId, taskType);
                evidence = ['Plan implementation', 'Resource management', 'Result achievement'];
                break;
        }
        return {
            score,
            maxScore,
            percentage: (score / maxScore) * 100,
            evidence
        };
    }
    // Individual competency calculation methods
    static async calculateAnalyticalThinkingScore(userId, sessionId, taskType) {
        // Route optimization: Based on profit optimization
        if (taskType === scoring_1.TaskType.ROUND1_TASK1_ROUTE_OPTIMIZATION) {
            const submission = await prisma.routeCalculation.findFirst({
                where: { userId, sessionId }
            });
            if (submission) {
                return Math.min(100, Math.max(0, (submission.netProfit / 100000) * 100));
            }
        }
        return 50; // Default score
    }
    static async calculateStrategicPlanningScore(userId, sessionId, taskType) {
        // Partner selection: Based on strategic alignment
        if (taskType === scoring_1.TaskType.ROUND1_TASK2_PARTNER_SELECTION) {
            const submission = await prisma.partnerSelection.findFirst({
                where: { userId, sessionId }
            });
            if (submission) {
                return Math.min(100, submission.score * 10);
            }
        }
        return 50;
    }
    static async calculateCollaborationScore(userId, sessionId, taskType) {
        // Group tasks: Based on participation and contribution
        if (taskType === scoring_1.TaskType.ROUND2_GROUP_MARKET_SELECTION || taskType === scoring_1.TaskType.ROUND2_GROUP_BUDGET_ALLOCATION) {
            const userGroups = await prisma.group.findMany({
                where: {
                    sessionId,
                    members: { some: { userId } }
                },
                include: {
                    messages: { where: { userId } },
                    decisions: { where: { userId } }
                }
            });
            const totalMessages = userGroups.reduce((sum, group) => sum + group.messages.length, 0);
            const totalDecisions = userGroups.reduce((sum, group) => sum + group.decisions.length, 0);
            return Math.min(100, (totalMessages * 5) + (totalDecisions * 10) + (userGroups.length * 20));
        }
        return 50;
    }
    static async calculateLeadershipScore(userId, sessionId, taskType) {
        // Group tasks: Based on leadership roles
        if (taskType === scoring_1.TaskType.ROUND2_GROUP_MARKET_SELECTION || taskType === scoring_1.TaskType.ROUND2_GROUP_BUDGET_ALLOCATION) {
            const leadershipRoles = await prisma.groupMember.count({
                where: {
                    userId,
                    role: 'LEADER',
                    group: { sessionId }
                }
            });
            return Math.min(100, leadershipRoles * 50);
        }
        return 50;
    }
    static async calculateProblemSolvingScore(userId, sessionId, taskType) {
        // Crisis management: Based on effectiveness
        if (taskType === scoring_1.TaskType.ROUND3_TASK1_CRISIS_WEB) {
            const submission = await prisma.crisisWebSubmission.findFirst({
                where: { userId, sessionId }
            });
            if (submission) {
                return Math.round(submission.effectiveness * 100);
            }
        }
        return 50;
    }
    static async calculateDecisionMakingScore(userId, sessionId, taskType) {
        // Partner selection and crisis management: Based on decision quality
        if (taskType === scoring_1.TaskType.ROUND1_TASK2_PARTNER_SELECTION) {
            const submission = await prisma.partnerSelection.findFirst({
                where: { userId, sessionId }
            });
            if (submission) {
                return Math.min(100, submission.score * 10);
            }
        }
        return 50;
    }
    static async calculateCommunicationScore(userId, sessionId, taskType) {
        // Group tasks: Based on message frequency and quality
        if (taskType === scoring_1.TaskType.ROUND2_GROUP_MARKET_SELECTION || taskType === scoring_1.TaskType.ROUND2_GROUP_BUDGET_ALLOCATION) {
            const totalMessages = await prisma.groupMessage.count({
                where: {
                    userId,
                    group: { sessionId }
                }
            });
            return Math.min(100, totalMessages * 10);
        }
        return 50;
    }
    static async calculateAdaptabilityScore(userId, sessionId, taskType) {
        // Crisis management: Based on risk management
        if (taskType === scoring_1.TaskType.ROUND3_TASK1_CRISIS_WEB) {
            const submission = await prisma.crisisWebSubmission.findFirst({
                where: { userId, sessionId }
            });
            if (submission) {
                return Math.round((1 - parseFloat(submission.riskLevel) / 100) * 100);
            }
        }
        return 50;
    }
    static async calculateInnovationScore(userId, sessionId, taskType) {
        // Crisis management: Based on creative solutions
        if (taskType === scoring_1.TaskType.ROUND3_TASK1_CRISIS_WEB) {
            const submission = await prisma.crisisWebSubmission.findFirst({
                where: { userId, sessionId }
            });
            if (submission) {
                return Math.round(submission.effectiveness * 100);
            }
        }
        return 50;
    }
    static async calculateExecutionScore(userId, sessionId, taskType) {
        // Reactivation challenge: Based on implementation effectiveness
        if (taskType === scoring_1.TaskType.ROUND3_TASK2_REACTIVATION_CHALLENGE) {
            const submission = await prisma.reactivationSequence.findFirst({
                where: { userId, sessionId }
            });
            if (submission) {
                return Math.round((1 - submission.riskScore) * 100);
            }
        }
        return 50;
    }
    // Calculate overall competency scores across all tasks
    static async calculateCompetencyScores(userId, sessionId) {
        const competencyScores = [];
        for (const competency of competencies_1.COMPETENCIES) {
            let totalScore = 0;
            let totalWeight = 0;
            let evidence = [];
            for (const taskType of Object.values(scoring_1.TaskType)) {
                const taskMappings = competencies_1.TASK_COMPETENCY_MAPPINGS[taskType] || [];
                const mapping = taskMappings.find(m => m.competencyId === competency.id);
                if (mapping) {
                    const score = await this.calculateCompetencyScore(userId, sessionId, taskType, competency.id);
                    totalScore += score.score * mapping.weight;
                    totalWeight += mapping.weight;
                    evidence.push(...score.evidence);
                }
            }
            const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
            competencyScores.push({
                competencyId: competency.id,
                competencyName: competency.name,
                category: competency.category,
                score: averageScore,
                maxScore: 100,
                percentage: averageScore,
                evidence: [...new Set(evidence)] // Remove duplicates
            });
        }
        return competencyScores;
    }
    // Calculate task breakdown statistics
    static async calculateTaskBreakdown(sessionId, userScores) {
        const breakdown = {};
        for (const taskType of Object.values(scoring_1.TaskType)) {
            const taskScores = userScores
                .map(user => user.taskScores.find(ts => ts.taskType === taskType))
                .filter(score => score !== undefined);
            if (taskScores.length > 0) {
                const scores = taskScores.map(ts => ts.score);
                const maxScores = taskScores.map(ts => ts.maxScore);
                breakdown[taskType] = {
                    averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
                    maxScore: Math.max(...maxScores),
                    completionRate: (taskScores.length / userScores.length) * 100
                };
            }
            else {
                breakdown[taskType] = {
                    averageScore: 0,
                    maxScore: 100,
                    completionRate: 0
                };
            }
        }
        return breakdown;
    }
    // Calculate competency breakdown statistics
    static async calculateCompetencyBreakdown(userScores) {
        const breakdown = {};
        for (const category of Object.values(scoring_1.CompetencyCategory)) {
            const categoryScores = userScores
                .flatMap(user => user.competencyScores)
                .filter(cs => cs.category === category);
            if (categoryScores.length > 0) {
                const scores = categoryScores.map(cs => cs.score);
                const topPerformers = userScores
                    .filter(user => user.competencyScores.some(cs => cs.category === category && cs.score >= 80))
                    .map(user => user.userName);
                breakdown[category] = {
                    averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
                    maxScore: 100,
                    topPerformers
                };
            }
            else {
                breakdown[category] = {
                    averageScore: 0,
                    maxScore: 100,
                    topPerformers: []
                };
            }
        }
        return breakdown;
    }
    // Generate final report for a user
    static async generateFinalReport(req, res) {
        try {
            const { sessionId, userId } = req.params;
            const { includeFeedback = true } = req.query;
            // Calculate user score
            const userScore = await this.calculateUserScore(userId, sessionId);
            // Get or create final report
            let finalReport = await prisma.finalReport.findUnique({
                where: {
                    sessionId_userId: {
                        sessionId,
                        userId
                    }
                }
            });
            if (!finalReport) {
                finalReport = await prisma.finalReport.create({
                    data: {
                        sessionId,
                        userId,
                        totalScore: userScore.totalScore,
                        rank: userScore.rank,
                        competencyScores: userScore.competencyScores,
                        feedback: includeFeedback ? await this.generateFeedback(userScore) : [],
                        generatedAt: new Date()
                    }
                });
            }
            res.json({
                success: true,
                report: {
                    id: finalReport.id,
                    sessionId: finalReport.sessionId,
                    userId: finalReport.userId,
                    totalScore: finalReport.totalScore,
                    rank: finalReport.rank,
                    competencyScores: finalReport.competencyScores,
                    feedback: finalReport.feedback,
                    generatedAt: finalReport.generatedAt.toISOString()
                }
            });
        }
        catch (error) {
            console.error('Error generating final report:', error);
            res.status(500).json({ error: 'Failed to generate final report' });
        }
    }
    // Generate detailed feedback for a user
    static async generateFeedback(userScore) {
        const feedback = [];
        for (const competencyScore of userScore.competencyScores) {
            const competency = competencies_1.COMPETENCIES.find(c => c.id === competencyScore.competencyId);
            if (!competency)
                continue;
            const template = competencies_1.FEEDBACK_TEMPLATES[competency.category];
            const percentage = competencyScore.percentage;
            let strengths = [];
            let areasForImprovement = [];
            if (percentage >= competencies_1.SCORING_THRESHOLDS.EXCELLENT) {
                strengths = template.strengths;
                areasForImprovement = ['Continue to develop and refine these skills'];
            }
            else if (percentage >= competencies_1.SCORING_THRESHOLDS.GOOD) {
                strengths = template.strengths.slice(0, 2);
                areasForImprovement = template.areasForImprovement.slice(0, 1);
            }
            else if (percentage >= competencies_1.SCORING_THRESHOLDS.SATISFACTORY) {
                strengths = template.strengths.slice(0, 1);
                areasForImprovement = template.areasForImprovement.slice(0, 2);
            }
            else {
                areasForImprovement = template.areasForImprovement;
            }
            feedback.push({
                competencyId: competencyScore.competencyId,
                competencyName: competencyScore.competencyName,
                category: competencyScore.category,
                score: competencyScore.score,
                maxScore: competencyScore.maxScore,
                percentage: competencyScore.percentage,
                strengths,
                areasForImprovement,
                specificExamples: competencyScore.evidence
            });
        }
        return feedback;
    }
    // Export results in various formats
    static async exportResults(req, res) {
        try {
            const { sessionId } = req.params;
            const { format = 'csv', includeDetails = false } = req.query;
            const results = await this.calculateScores(req, res);
            if (format === 'csv') {
                const csvData = this.generateCSV(results);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="scoring_results_${sessionId}.csv"`);
                res.send(csvData);
            }
            else if (format === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="scoring_results_${sessionId}.json"`);
                res.json(results);
            }
            else {
                res.status(400).json({ error: 'Unsupported format' });
            }
        }
        catch (error) {
            console.error('Error exporting results:', error);
            res.status(500).json({ error: 'Failed to export results' });
        }
    }
    // Generate CSV data
    static generateCSV(results) {
        const headers = [
            'Rank',
            'User Name',
            'Total Score',
            'Overall Percentage',
            'Analytical Thinking',
            'Strategic Planning',
            'Collaboration',
            'Leadership',
            'Problem Solving',
            'Decision Making',
            'Communication',
            'Adaptability',
            'Innovation',
            'Execution'
        ];
        const rows = results.userScores.map((user) => [
            user.rank,
            user.userName,
            user.totalScore,
            user.overallPercentage.toFixed(2),
            ...user.competencyScores.map((cs) => cs.percentage.toFixed(2))
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}
exports.ScoringController = ScoringController;
//# sourceMappingURL=scoringController.js.map