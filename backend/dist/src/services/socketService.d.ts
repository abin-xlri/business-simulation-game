import { Server } from 'socket.io';
import { GameState, GameEvent, ApiResponse } from '../../shared/types/game';
export declare class SocketService {
    private io;
    private connectedPlayers;
    private gameState;
    constructor(io: Server);
    private setupSocketHandlers;
    private handlePlayerConnection;
    private handlePlayerDisconnection;
    private handleCompanyAction;
    private processHireEmployee;
    private processFireEmployee;
    private processInvestment;
    private processResearch;
    private processMarketing;
    private processExpansion;
    private handleGameRequest;
    private getSessionPlayers;
    broadcastNotification(notification: ApiResponse<any>): void;
    broadcastGameEvent(event: GameEvent): void;
    updateGameState(newState: Partial<GameState>): void;
}
//# sourceMappingURL=socketService.d.ts.map