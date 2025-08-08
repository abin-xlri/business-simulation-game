import { Server } from 'socket.io';
export declare class GroupSocketHandler {
    private io;
    private userSockets;
    private groupSockets;
    constructor(io: Server);
    private setupMiddleware;
    private setupEventHandlers;
    private handleCreateGroup;
    private handleJoinGroup;
    private handleLeaveGroup;
    private handleGroupMessage;
    private handleGroupDecision;
    private handleMarketPitchStart;
    private handleMarketPitchEnd;
    private handleMarketVote;
    private handleBudgetFunctionUpdate;
    private handleBudgetConsensusRequest;
    private handleBudgetConsensusResponse;
    private sendSystemMessage;
    private addSocketToGroup;
    private removeSocketFromGroup;
    private removeSocketFromAllGroups;
}
//# sourceMappingURL=groupSocketHandler.d.ts.map