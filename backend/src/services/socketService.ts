import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { 
  GameState,
  GameEvent,
  ApiResponse
} from '../../shared/types/game';
import { Player } from '../../shared/types/player';

const prisma = new PrismaClient();

interface ConnectedPlayer {
  playerId: string;
  playerName: string;
  sessionId: string;
}

export class SocketService {
  private io: Server;
  private connectedPlayers: Map<string, ConnectedPlayer> = new Map();
  private gameState: GameState = {
    id: 'game-1',
    status: 'WAITING',
    currentRound: 1,
    maxRounds: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Handle player connection
      socket.on('player:connect', (data: { playerId: string; playerName: string; sessionId: string }) => {
        this.handlePlayerConnection(socket, data);
      });

      // Handle player disconnection
      socket.on('disconnect', () => {
        this.handlePlayerDisconnection(socket);
      });

      // Handle company actions
      socket.on('company:action', (action: any) => {
        this.handleCompanyAction(socket, action);
      });

      // Handle game requests
      socket.on('game:request', (request: any) => {
        this.handleGameRequest(socket, request);
      });
    });
  }

  private handlePlayerConnection(socket: Socket, data: { playerId: string; playerName: string; sessionId: string }) {
    try {
      const connectedPlayer: ConnectedPlayer = {
        playerId: data.playerId,
        playerName: data.playerName,
        sessionId: data.sessionId
      };

      this.connectedPlayers.set(socket.id, connectedPlayer);

      // Join session room
      socket.join(data.sessionId);

      // Broadcast player joined
      socket.to(data.sessionId).emit('player:joined', {
        playerId: data.playerId,
        playerName: data.playerName
      });

      // Send current game state
      socket.emit('game:state', this.gameState);

      console.log(`Player ${data.playerName} joined session ${data.sessionId}`);
    } catch (error) {
      console.error('Error handling player connection:', error);
      socket.emit('error', { message: 'Failed to connect player' });
    }
  }

  private handlePlayerDisconnection(socket: Socket) {
    try {
      const connectedPlayer = this.connectedPlayers.get(socket.id);
      
      if (connectedPlayer) {
        // Broadcast player left
        socket.to(connectedPlayer.sessionId).emit('player:left', {
          playerId: connectedPlayer.playerId,
          playerName: connectedPlayer.playerName
        });

        // Remove from connected players
        this.connectedPlayers.delete(socket.id);

        console.log(`Player ${connectedPlayer.playerName} disconnected`);
      }
    } catch (error) {
      console.error('Error handling player disconnection:', error);
    }
  }

  private handleCompanyAction(socket: Socket, action: any) {
    try {
      const connectedPlayer = this.connectedPlayers.get(socket.id);
      
      if (!connectedPlayer) {
        socket.emit('error', { message: 'Player not connected' });
        return;
      }

      // Process company action based on action type
      switch (action.type) {
        case 'hire_employee':
          this.processHireEmployee(connectedPlayer.playerId, action.data);
          break;
        case 'fire_employee':
          this.processFireEmployee(connectedPlayer.playerId, action.data);
          break;
        case 'invest':
          this.processInvestment(connectedPlayer.playerId, action.data);
          break;
        case 'research':
          this.processResearch(connectedPlayer.playerId, action.data);
          break;
        case 'marketing':
          this.processMarketing(connectedPlayer.playerId, action.data);
          break;
        case 'expand':
          this.processExpansion(connectedPlayer.playerId, action.data);
          break;
        default:
          socket.emit('error', { message: 'Unknown action type' });
          return;
      }

      // Broadcast action to session
      socket.to(connectedPlayer.sessionId).emit('company:action', {
        playerId: connectedPlayer.playerId,
        playerName: connectedPlayer.playerName,
        action
      });

      console.log(`Company action from ${connectedPlayer.playerName}:`, action);
    } catch (error) {
      console.error('Error handling company action:', error);
      socket.emit('error', { message: 'Failed to process company action' });
    }
  }

  private async processHireEmployee(playerId: string, data: any) {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { company: true }
      });

      if (!player?.company) {
        throw new Error('Player has no company');
      }

      await prisma.employee.create({
        data: {
          name: data.name,
          position: data.position,
          salary: data.salary,
          company: {
            connect: { id: player.company.id }
          }
        }
      });

      // Update player balance
      await prisma.player.update({
        where: { id: playerId },
        data: {
          balance: {
            decrement: data.salary
          }
        }
      });
    } catch (error) {
      console.error('Error processing hire employee:', error);
      throw error;
    }
  }

  private async processFireEmployee(playerId: string, data: any) {
    try {
      await prisma.employee.delete({
        where: { id: data.employeeId }
      });
    } catch (error) {
      console.error('Error processing fire employee:', error);
      throw error;
    }
  }

  private async processInvestment(playerId: string, data: any) {
    try {
      await prisma.player.update({
        where: { id: playerId },
        data: {
          balance: {
            decrement: data.amount
          }
        }
      });
    } catch (error) {
      console.error('Error processing investment:', error);
      throw error;
    }
  }

  private async processResearch(playerId: string, data: any) {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { company: true }
      });

      if (!player?.company) {
        throw new Error('Player has no company');
      }

      await prisma.researchProject.create({
        data: {
          name: data.name,
          budget: data.budget,
          expectedCompletion: new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000),
          research: {
            connect: { companyId: player.company.id }
          }
        }
      });
    } catch (error) {
      console.error('Error processing research:', error);
      throw error;
    }
  }

  private async processMarketing(playerId: string, data: any) {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { company: true }
      });

      if (!player?.company) {
        throw new Error('Player has no company');
      }

      await prisma.marketingCampaign.create({
        data: {
          name: data.name,
          budget: data.budget,
          startDate: new Date(),
          endDate: new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000),
          targetAudience: data.targetAudience,
          marketing: {
            connect: { companyId: player.company.id }
          }
        }
      });
    } catch (error) {
      console.error('Error processing marketing:', error);
      throw error;
    }
  }

  private async processExpansion(playerId: string, data: any) {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { company: true }
      });

      if (!player?.company) {
        throw new Error('Player has no company');
      }

      await prisma.facility.create({
        data: {
          name: data.name,
          type: data.type,
          capacity: data.capacity,
          maintenanceCost: data.maintenanceCost,
          location: data.location,
          company: {
            connect: { id: player.company.id }
          }
        }
      });
    } catch (error) {
      console.error('Error processing expansion:', error);
      throw error;
    }
  }

  private async handleGameRequest(socket: Socket, request: any) {
    try {
      const connectedPlayer = this.connectedPlayers.get(socket.id);
      
      if (!connectedPlayer) {
        socket.emit('error', { message: 'Player not connected' });
        return;
      }

      switch (request.type) {
        case 'get_game_state':
          socket.emit('game:state', this.gameState);
          break;
        case 'get_players':
          const players = await this.getSessionPlayers(connectedPlayer.sessionId);
          socket.emit('players:list', players);
          break;
        default:
          socket.emit('error', { message: 'Unknown request type' });
      }
    } catch (error) {
      console.error('Error handling game request:', error);
      socket.emit('error', { message: 'Failed to process game request' });
    }
  }

  private async getSessionPlayers(sessionId: string) {
    try {
      const userSessions = await prisma.userSession.findMany({
        where: { sessionId },
        include: {
          user: true
        }
      });

      return userSessions.map(userSession => ({
        id: userSession.user.id,
        name: userSession.user.name,
        joinedAt: userSession.joinedAt
      }));
    } catch (error) {
      console.error('Error getting session players:', error);
      return [];
    }
  }

  public broadcastNotification(notification: ApiResponse<any>) {
    this.io.emit('notification', notification);
  }

  public broadcastGameEvent(event: GameEvent) {
    this.io.emit('game:event', event);
  }

  public updateGameState(newState: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...newState };
    this.io.emit('game:state', this.gameState);
  }
} 
