import { Server } from 'socket.io';
import { GameState, GameEvent, Notification } from '../shared/types/game';
declare class SocketService {
    private io;
    private connectedPlayers;
    private gameState;
    constructor(io: Server);
    private setupEventHandlers;
    private handlePlayerJoin;
    private handlePlayerUpdate;
    private handleCompanyAction;
    private handleGameRequest;
    private handlePlayerDisconnect;
    private handleHireAction;
    private handleFireAction;
    private handleInvestAction;
    private handleResearchAction;
    private handleMarketingAction;
    private handleExpandAction;
    broadcastGameEvent(event: GameEvent): void;
    broadcastNotification(notification: Notification): void;
    updateGameState(newState: Partial<GameState>): void;
}
export declare const setupSocketHandlers: (io: Server) => SocketService;
export {};
//# sourceMappingURL=socketService.d.ts.map