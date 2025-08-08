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

export class MonitoringService {
  private io: Server;
  private prisma: PrismaClient;
  private metrics: MonitoringMetrics = {
    activeConnections: 0,
    activeSessions: 0,
    submissionsPerMinute: 0,
    errorsPerMinute: 0,
    averageResponseTime: 0,
    databaseConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0
  };

  private submissionCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private lastResetTime = Date.now();

  constructor(io: Server, prisma: PrismaClient) {
    this.io = io;
    this.prisma = prisma;
    this.startMetricsCollection();
  }

  private startMetricsCollection() {
    // Update metrics every minute
    setInterval(() => {
      this.updateMetrics();
    }, 60000);

    // Reset counters every minute
    setInterval(() => {
      this.resetMinuteCounters();
    }, 60000);

    // Health check every 30 seconds
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  private async updateMetrics() {
    try {
      // Update connection count
      this.metrics.activeConnections = this.io.engine.clientsCount;
      
      // Update session count
      const activeSessions = await this.prisma.session.count({
        where: { status: 'ACTIVE' }
      });
      this.metrics.activeSessions = activeSessions;

      // Update submission rate
      this.metrics.submissionsPerMinute = this.submissionCount;

      // Update error rate
      this.metrics.errorsPerMinute = this.errorCount;

      // Calculate average response time
      if (this.responseTimes.length > 0) {
        this.metrics.averageResponseTime = 
          this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
      }

      // Update system metrics
      this.metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      this.metrics.cpuUsage = process.cpuUsage().user / 1000000; // seconds

      // Log metrics
      console.log('Monitoring Metrics:', {
        ...this.metrics,
        timestamp: new Date().toISOString()
      });

      // Broadcast metrics to admin clients
      this.io.to('admin').emit('metrics-update', this.metrics);

    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  private resetMinuteCounters() {
    this.submissionCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
    this.lastResetTime = Date.now();
  }

  private async performHealthCheck() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Test WebSocket server
      if (this.io.engine.clientsCount > 100) {
        console.warn('High WebSocket connection count:', this.io.engine.clientsCount);
      }

      // Check memory usage
      const memoryUsage = process.memoryUsage();
      if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        console.warn('High memory usage:', memoryUsage.heapUsed / 1024 / 1024, 'MB');
      }

    } catch (error) {
      console.error('Health check failed:', error);
      this.logError(error instanceof Error ? error : new Error(String(error)), 'health-check');
    }
  }

  public logSubmission() {
    this.submissionCount++;
  }

  public logError(error: Error, context: string) {
    console.error(`[${context}] Error:`, error);
    this.errorCount++;
  }

  public logResponseTime(responseTime: number) {
    this.responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
  }

  public getMetrics(): MonitoringMetrics {
    return { ...this.metrics };
  }

  public getHealthStatus() {
    const isHealthy = 
      this.metrics.activeConnections < 100 &&
      this.metrics.errorsPerMinute < 10 &&
      this.metrics.memoryUsage < 500 &&
      this.metrics.averageResponseTime < 1000;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  public async getSessionStats() {
    try {
      const totalSessions = await this.prisma.session.count();
      const activeSessions = await this.prisma.session.count({
        where: { status: 'ACTIVE' }
      });
      const completedSessions = await this.prisma.session.count({
        where: { status: 'COMPLETED' }
      });

      return {
        total: totalSessions,
        active: activeSessions,
        completed: completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return null;
    }
  }

  public async getUserStats() {
    try {
      const totalUsers = await this.prisma.user.count();
      const activeUsers = await this.prisma.userSession.count({
        where: {
          session: { status: 'ACTIVE' }
        }
      });

      return {
        total: totalUsers,
        active: activeUsers,
        activePercentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }
}
