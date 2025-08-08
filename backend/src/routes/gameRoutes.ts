import { Router } from 'express';
import { GameController } from '../controllers/gameController';

const router = Router();
const gameController = new GameController();

// GET /api/game/state - Get current game state
router.get('/state', gameController.getGameState);

// GET /api/game/market-data - Get market data
router.get('/market-data', gameController.getMarketData);

// GET /api/game/events - Get game events
router.get('/events', gameController.getGameEvents);

// POST /api/game/start - Start new game
router.post('/start', gameController.startGame);

// POST /api/game/pause - Pause game
router.post('/pause', gameController.pauseGame);

// POST /api/game/resume - Resume game
router.post('/resume', gameController.resumeGame);

// POST /api/game/end - End game
router.post('/end', gameController.endGame);

// GET /api/game/leaderboard - Get leaderboard
router.get('/leaderboard', gameController.getLeaderboard);

export default router; 