import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
export interface MonitoringMetrics {
    activeConnections: number;
    activeSessions: number;
    submissionsPerMinute: number;
    errorsPerMinute: number;
    averageResponseTime: number;
    databaseConnections: number;
    memoryUsage: number;
    cpuUsage: number;
}
export declare class MonitoringService {
    private io;
    private prisma;
    private metrics;
    private submissionCount;
    private errorCount;
    private responseTimes;
    private lastResetTime;
    constructor(io: Server, prisma: PrismaClient);
    private startMetricsCollection;
    private updateMetrics;
    private resetMinuteCounters;
    private performHealthCheck;
    logSubmission(): void;
    logError(error: Error, context: string): void;
    logResponseTime(responseTime: number): void;
    getMetrics(): MonitoringMetrics;
    getHealthStatus(): {
        status: string;
        metrics: MonitoringMetrics;
        timestamp: string;
    };
    getSessionStats(): Promise<{
        total: number;
        active: number;
        completed: number;
        completionRate: number;
    } | null>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        activePercentage: number;
    } | null>;
}
//# sourceMappingURL=monitoringService.d.ts.map