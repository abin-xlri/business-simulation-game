import { Request, Response } from 'express';
export declare class AdminController {
    static listUsers(_req: Request, res: Response): Promise<void>;
    static createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateUser(req: Request, res: Response): Promise<void>;
    static deleteUser(req: Request, res: Response): Promise<void>;
    static getSessions(req: Request, res: Response): Promise<void>;
    static updateSessionStatus(req: Request, res: Response): Promise<void>;
    static createSingleSession(req: Request, res: Response): Promise<void>;
    static deleteSession(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static forceSubmitTask(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static forceSubmitAllCurrentTask(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSessionStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static calculateScores(req: Request, res: Response): Promise<void>;
    static exportResults(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateGlobalTimer(req: Request, res: Response): Promise<void>;
    static createBulkSessions(req: Request, res: Response): Promise<void>;
    static startAllSessions(req: Request, res: Response): Promise<void>;
    static bulkAddUsersToSession(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeUserFromSession(req: Request, res: Response): Promise<void>;
    static startSimulation(req: Request, res: Response): Promise<void>;
    static broadcastAnnouncement(req: Request, res: Response): Promise<void>;
    static getBehavioralIndicators(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=adminController.d.ts.map