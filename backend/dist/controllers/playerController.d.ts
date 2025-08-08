import { Request, Response } from 'express';
export declare class PlayerController {
    getAllPlayers(req: Request, res: Response): Promise<void>;
    getPlayerById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPlayer(req: Request, res: Response): Promise<void>;
    updatePlayer(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePlayer(req: Request, res: Response): Promise<void>;
    joinGame(req: Request, res: Response): Promise<void>;
    leaveGame(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=playerController.d.ts.map