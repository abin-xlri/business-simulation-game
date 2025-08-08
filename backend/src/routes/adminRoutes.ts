import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../utils/jwt';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Session Management routes
router.get('/sessions', AdminController.getSessions);
router.patch('/sessions/:sessionId/status', AdminController.updateSessionStatus);
router.post('/sessions/:sessionId/force-submit', AdminController.forceSubmitTask);
router.post('/sessions/:sessionId/force-submit-all', AdminController.forceSubmitAllCurrentTask);

// Real-time Monitoring routes
router.get('/sessions/:sessionId/status', AdminController.getSessionStatus);

// Scoring Dashboard routes
router.get('/sessions/:sessionId/scores', AdminController.calculateScores);
router.get('/sessions/:sessionId/export', AdminController.exportResults);

// Timer Controls routes
router.post('/sessions/:sessionId/timer', AdminController.updateGlobalTimer);

// Start full simulation orchestration for a session
router.post('/sessions/:sessionId/start-simulation', AdminController.startSimulation);

// Bulk Session Management routes
router.post('/sessions/bulk-create', AdminController.createBulkSessions);
router.post('/sessions/bulk-start', AdminController.startAllSessions);

// Broadcast Announcements routes
router.post('/sessions/:sessionId/announcement', AdminController.broadcastAnnouncement);

// Behavioral Indicators routes
router.get('/sessions/:sessionId/behavioral-indicators', AdminController.getBehavioralIndicators);

export default router; 