import { Router } from 'express';
import { CrisisController } from '../controllers/crisisController';
import { authenticateToken } from '../utils/jwt';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Crisis Web (Task 1) routes
router.get('/crisis-data', CrisisController.getCrisisData);
router.post('/validate-crisis-web', CrisisController.validateCrisisWeb);
router.post('/sessions/:sessionId/submit-crisis-web', CrisisController.submitCrisisWeb);

// Reactivation Challenge (Task 2) routes
router.get('/reactivation-data', CrisisController.getReactivationData);
router.post('/validate-reactivation', CrisisController.validateReactivation);
router.post('/sessions/:sessionId/submit-reactivation', CrisisController.submitReactivation);

export default router; 