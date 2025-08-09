"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = require("../controllers/gameController");
const router = (0, express_1.Router)();
const gameController = new gameController_1.GameController();
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
exports.default = router;
//# sourceMappingURL=gameRoutes.js.map