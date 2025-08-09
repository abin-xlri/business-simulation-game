import { Request, Response } from 'express';
export declare class ScoringController {
    static initializeCompetencies(): Promise<void>;
    static calculateScores(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private static calculateUserScore;
    private static calculateTaskScore;
    private static calculateGroupTaskScore;
    private static calculateTaskCompetencyScores;
    private static calculateCompetencyScore;
    private static calculateAnalyticalThinkingScore;
    private static calculateStrategicPlanningScore;
    private static calculateCollaborationScore;
    private static calculateLeadershipScore;
    private static calculateProblemSolvingScore;
    private static calculateDecisionMakingScore;
    private static calculateCommunicationScore;
    private static calculateAdaptabilityScore;
    private static calculateInnovationScore;
    private static calculateExecutionScore;
    private static calculateCompetencyScores;
    private static calculateTaskBreakdown;
    private static calculateCompetencyBreakdown;
    static generateFinalReport(req: Request, res: Response): Promise<void>;
    private static generateFeedback;
    static exportResults(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private static generateCSV;
}
//# sourceMappingURL=scoringController.d.ts.map