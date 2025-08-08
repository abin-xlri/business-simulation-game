"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = require("../controllers/gameController");
const router = (0, express_1.Router)();
const gameController = new gameController_1.GameController();
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
exports.default = router;
//# sourceMappingURL=gameRoutes.js.map