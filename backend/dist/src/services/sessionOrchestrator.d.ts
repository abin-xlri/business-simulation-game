import { Session } from '@prisma/client';
declare class SessionOrchestrator {
    private timeouts;
    private softState;
    startSimulation(sessionId: string): Promise<Session>;
    advanceTask(sessionId: string): Promise<void>;
    private setTask;
}
export declare const sessionOrchestrator: SessionOrchestrator;
export {};
//# sourceMappingURL=sessionOrchestrator.d.ts.map