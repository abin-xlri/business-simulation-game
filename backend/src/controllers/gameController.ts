import { Request, Response } from 'express';
import { GameState, MarketData, GameEvent, ApiResponse } from '../../shared/types/game';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GameController {
  async getGameState(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          userSessions: {
            include: {
              user: true
            }
          }
        }
      });
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
      
      const gameState: GameState = {
        id: session.id,
        status: session.status === 'COMPLETED' ? 'FINISHED' : session.status,
        currentRound: session.currentRound,
        maxRounds: 3,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      };
      
      const response: ApiResponse<GameState> = {
        success: true,
        data: gameState
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch game state'
      });
    }
  }

  async getMarketData(req: Request, res: Response) {
    try {
      // Get market data from products across all companies
      const products = await prisma.product.findMany({
        include: {
          company: true
        }
      });
      
      const totalDemand = products.reduce((sum, product) => sum + product.demand, 0);
      const totalSupply = products.reduce((sum, product) => sum + product.supply, 0);
      const avgPrice = products.length > 0 ? products.reduce((sum, product) => sum + product.price, 0) / products.length : 0;
      
      const marketData: MarketData = {
        id: 'global-market',
        name: 'Global Market',
        demand: totalDemand,
        supply: totalSupply,
        price: avgPrice,
        volatility: 0.15 // Could be calculated based on price variations
      };
      
      const response: ApiResponse<MarketData> = {
        success: true,
        data: marketData
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch market data'
      });
    }
  }

  async getGameEvents(req: Request, res: Response) {
    try {
      const events = await prisma.gameEvent.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      const transformedEvents: GameEvent[] = events.map(event => ({
        id: event.id,
        type: event.type as any,
        title: event.title,
        description: event.description,
        impact: event.impactType as any,
        duration: event.duration,
        createdAt: event.createdAt
      }));
      
      const response: ApiResponse<GameEvent[]> = {
        success: true,
        data: transformedEvents
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch game events'
      });
    }
  }

  async startGame(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const gameConfig = req.body;
      
      const session = await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'ACTIVE',
          currentRound: 1,
          maxParticipants: gameConfig.maxParticipants || 10
        }
      });
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Game started successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to start game'
      });
    }
  }

  async pauseGame(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'PAUSED'
        }
      });
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Game paused successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to pause game'
      });
    }
  }

  async resumeGame(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'ACTIVE'
        }
      });
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Game resumed successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to resume game'
      });
    }
  }

  async endGame(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED'
        }
      });
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Game ended successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to end game'
      });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      // Get all players in the session
      const userSessions = await prisma.userSession.findMany({
        where: { sessionId },
        include: {
          user: true
        }
      });
      
      const leaderboard = userSessions.map(userSession => {
        const user = userSession.user;
        
        // For now, use a simple score based on user ID (placeholder)
        const score = parseInt(user.id.slice(-4), 16) || 0;
        
        return {
          userId: user.id,
          name: user.name,
          companyName: 'No Company', // Placeholder
          score,
          rank: 0 // Will be calculated below
        };
      });
      
      // Sort by score and assign ranks
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: leaderboard
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard'
      });
    }
  }
} 

