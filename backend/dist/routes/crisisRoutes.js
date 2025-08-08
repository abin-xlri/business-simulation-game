"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crisisController_1 = require("../controllers/crisisController");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(jwt_1.authenticateToken);
// Crisis Web (Task 1) routes
router.get('/crisis-data', crisisController_1.CrisisController.getCrisisData);
router.post('/validate-crisis-web', crisisController_1.CrisisController.validateCrisisWeb);
router.post('/sessions/:sessionId/submit-crisis-web', crisisController_1.CrisisController.submitCrisisWeb);
// Reactivation Challenge (Task 2) routes
router.get('/reactivation-data', crisisController_1.CrisisController.getReactivationData);
router.post('/validate-reactivation', crisisController_1.CrisisController.validateReactivation);
router.post('/sessions/:sessionId/submit-reactivation', crisisController_1.CrisisController.submitReactivation);
exports.default = router;
//# sourceMappingURL=crisisRoutes.js.map