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
// User Management routes
router.get('/users', adminController_1.AdminController.listUsers);
router.post('/users', adminController_1.AdminController.createUser);
router.patch('/users/:userId', adminController_1.AdminController.updateUser);
router.delete('/users/:userId', adminController_1.AdminController.deleteUser);
// Session Management routes
router.get('/sessions', adminController_1.AdminController.getSessions);
router.patch('/sessions/:sessionId/status', adminController_1.AdminController.updateSessionStatus);
router.post('/sessions/:sessionId/force-submit', adminController_1.AdminController.forceSubmitTask);
router.post('/sessions', adminController_1.AdminController.createSingleSession);
router.delete('/sessions/:sessionId', adminController_1.AdminController.deleteSession);
router.post('/sessions/:sessionId/participants', adminController_1.AdminController.bulkAddUsersToSession);
router.delete('/sessions/:sessionId/participants/:userId', adminController_1.AdminController.removeUserFromSession);
router.post('/sessions/:sessionId/force-submit-all', adminController_1.AdminController.forceSubmitAllCurrentTask);
// Real-time Monitoring routes
router.get('/sessions/:sessionId/status', adminController_1.AdminController.getSessionStatus);
// Scoring Dashboard routes
router.get('/sessions/:sessionId/scores', adminController_1.AdminController.calculateScores);
router.get('/sessions/:sessionId/export', adminController_1.AdminController.exportResults);
// Timer Controls routes
router.post('/sessions/:sessionId/timer', adminController_1.AdminController.updateGlobalTimer);
// Start full simulation orchestration for a session
router.post('/sessions/:sessionId/start-simulation', adminController_1.AdminController.startSimulation);
// Bulk Session Management routes
router.post('/sessions/bulk-create', adminController_1.AdminController.createBulkSessions);
router.post('/sessions/bulk-start', adminController_1.AdminController.startAllSessions);
// Broadcast Announcements routes
router.post('/sessions/:sessionId/announcement', adminController_1.AdminController.broadcastAnnouncement);
// Behavioral Indicators routes
router.get('/sessions/:sessionId/behavioral-indicators', adminController_1.AdminController.getBehavioralIndicators);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map