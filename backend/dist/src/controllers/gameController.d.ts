import { Request, Response } from 'express';
export declare class GameController {
    getGameState(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMarketData(req: Request, res: Response): Promise<void>;
    getGameEvents(req: Request, res: Response): Promise<void>;
    startGame(req: Request, res: Response): Promise<void>;
    pauseGame(req: Request, res: Response): Promise<void>;
    resumeGame(req: Request, res: Response): Promise<void>;
    endGame(req: Request, res: Response): Promise<void>;
    getLeaderboard(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=gameController.d.ts.map