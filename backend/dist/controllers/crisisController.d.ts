import { Request, Response } from 'express';
export declare class CrisisController {
    static getCrisisData(req: Request, res: Response): Promise<void>;
    static getReactivationData(req: Request, res: Response): Promise<void>;
    static validateCrisisWeb(req: Request, res: Response): Promise<void>;
    static submitCrisisWeb(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static validateReactivation(req: Request, res: Response): Promise<void>;
    static submitReactivation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private static validateCrisisWebConstraints;
    private static validateReactivationConstraints;
    private static calculateEffectiveness;
    private static calculateRiskLevel;
    private static calculateRiskScore;
}
//# sourceMappingURL=crisisController.d.ts.map