"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scoringController_1 = require("../controllers/scoringController");
const jwt_1 = require("../utils/jwt");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(jwt_1.authenticateToken);
// Initialize competencies (admin only)
router.post('/initialize-competencies', adminAuth_1.requireAdmin, async (req, res) => {
    try {
        await scoringController_1.ScoringController.initializeCompetencies();
        res.json({ success: true, message: 'Competencies initialized successfully' });
    }
    catch (error) {
        console.error('Error initializing competencies:', error);
        res.status(500).json({ error: 'Failed to initialize competencies' });
    }
});
// Calculate comprehensive scores for a session
router.get('/sessions/:sessionId/calculate-scores', adminAuth_1.requireAdmin, scoringController_1.ScoringController.calculateScores);
// Generate final report for a specific user
router.get('/sessions/:sessionId/users/:userId/final-report', adminAuth_1.requireAdmin, scoringController_1.ScoringController.generateFinalReport);
// Export results in various formats
router.get('/sessions/:sessionId/export', adminAuth_1.requireAdmin, scoringController_1.ScoringController.exportResults);
exports.default = router;
//# sourceMappingURL=scoringRoutes.js.map