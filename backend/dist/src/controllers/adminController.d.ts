import { Request, Response } from 'express';
import { Server } from 'socket.io';
export declare const setIO: (socketIO: Server) => void;
export declare class AdminController {
    static getSessions(req: Request, res: Response): Promise<void>;
    static updateSessionStatus(req: Request, res: Response): Promise<void>;
    static forceSubmitTask(req: Request, res: Response): Promise<void>;
    static getSessionStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static calculateScores(req: Request, res: Response): Promise<void>;
    static exportResults(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateGlobalTimer(req: Request, res: Response): Promise<void>;
    static createBulkSessions(req: Request, res: Response): Promise<void>;
    static startAllSessions(req: Request, res: Response): Promise<void>;
    static broadcastAnnouncement(req: Request, res: Response): Promise<void>;
    static getBehavioralIndicators(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=adminController.d.ts.map