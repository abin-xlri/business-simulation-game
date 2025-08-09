import { Router } from 'express';
import { GameController } from '../controllers/gameController';

const router = Router();
const gameController = new GameController();

// GET /api/game/:sessionId/state - Get current game state
router.get('/:sessionId/state', gameController.getGameState);

// GET /api/game/market-data - Get market data
router.get('/market-data', gameController.getMarketData);

// GET /api/game/events - Get game events
router.get('/events', gameController.getGameEvents);

// POST /api/game/:sessionId/start - Start new game
router.post('/:sessionId/start', gameController.startGame);

// POST /api/game/:sessionId/pause - Pause game
router.post('/:sessionId/pause', gameController.pauseGame);

// POST /api/game/:sessionId/resume - Resume game
router.post('/:sessionId/resume', gameController.resumeGame);

// POST /api/game/:sessionId/end - End game
router.post('/:sessionId/end', gameController.endGame);

// GET /api/game/:sessionId/leaderboard - Get leaderboard
router.get('/:sessionId/leaderboard', gameController.getLeaderboard);

export default router; 