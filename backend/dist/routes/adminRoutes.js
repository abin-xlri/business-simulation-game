"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const jwt_1 = require("../utils/jwt");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Apply authentication and admin middleware to all routes
router.use(jwt_1.authenticateToken);
router.use(adminAuth_1.requireAdmin);
// Session Management routes
router.get('/sessions', adminController_1.AdminController.getSessions);
router.patch('/sessions/:sessionId/status', adminController_1.AdminController.updateSessionStatus);
router.post('/sessions/:sessionId/force-submit', adminController_1.AdminController.forceSubmitTask);
// Real-time Monitoring routes
router.get('/sessions/:sessionId/status', adminController_1.AdminController.getSessionStatus);
// Scoring Dashboard routes
router.get('/sessions/:sessionId/scores', adminController_1.AdminController.calculateScores);
router.get('/sessions/:sessionId/export', adminController_1.AdminController.exportResults);
// Timer Controls routes
router.post('/sessions/:sessionId/timer', adminController_1.AdminController.updateGlobalTimer);
// Broadcast Announcements routes
router.post('/sessions/:sessionId/announcement', adminController_1.AdminController.broadcastAnnouncement);
// Behavioral Indicators routes
router.get('/sessions/:sessionId/behavioral-indicators', adminController_1.AdminController.getBehavioralIndicators);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map