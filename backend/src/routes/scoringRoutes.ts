import { Router } from 'express';
import { ScoringController } from '../controllers/scoringController';
import { authenticateToken } from '../utils/jwt';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Initialize competencies (admin only)
router.post('/initialize-competencies', requireAdmin, async (req, res) => {
  try {
    await ScoringController.initializeCompetencies();
    res.json({ success: true, message: 'Competencies initialized successfully' });
  } catch (error) {
    console.error('Error initializing competencies:', error);
    res.status(500).json({ error: 'Failed to initialize competencies' });
  }
});

// Calculate comprehensive scores for a session
router.get('/sessions/:sessionId/calculate-scores', requireAdmin, ScoringController.calculateScores);

// Generate final report for a specific user
router.get('/sessions/:sessionId/users/:userId/final-report', requireAdmin, ScoringController.generateFinalReport);

// Export results in various formats
router.get('/sessions/:sessionId/export', requireAdmin, ScoringController.exportResults);

export default router; 