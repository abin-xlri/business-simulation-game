import { Router } from 'express';
import { calculateRoute, getStations, getRouteSegments } from '../controllers/round1Controller';
import { authenticateToken } from '../utils/jwt';

const router = Router();

// Public routes for getting station and segment data
router.get('/stations', getStations);
router.get('/segments', getRouteSegments);

// Protected route for route calculation
router.post('/calculate-route', authenticateToken, calculateRoute);

export default router; 