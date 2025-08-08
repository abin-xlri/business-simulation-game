import { Router } from 'express';
import { PlayerController } from '../controllers/playerController';

const router = Router();
const playerController = new PlayerController();

// GET /api/players - Get all players
router.get('/', playerController.getAllPlayers);

// GET /api/players/:id - Get player by ID
router.get('/:id', playerController.getPlayerById);

// POST /api/players - Create new player
router.post('/', playerController.createPlayer);

// PUT /api/players/:id - Update player
router.put('/:id', playerController.updatePlayer);

// DELETE /api/players/:id - Delete player
router.delete('/:id', playerController.deletePlayer);

// POST /api/players/:id/join-game - Join game
router.post('/:id/join-game', playerController.joinGame);

// POST /api/players/:id/leave-game - Leave game
router.post('/:id/leave-game', playerController.leaveGame);

export default router; 