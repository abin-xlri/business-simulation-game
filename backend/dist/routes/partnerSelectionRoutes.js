"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const partnerSelectionController_1 = require("../controllers/partnerSelectionController");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// Public routes
router.get('/partners', partnerSelectionController_1.getPartners);
router.get('/scores', partnerSelectionController_1.calculatePartnerScores);
// Protected routes
router.get('/selection', jwt_1.authenticateToken, partnerSelectionController_1.getPartnerSelection);
router.post('/submit', jwt_1.authenticateToken, partnerSelectionController_1.submitPartnerSelection);
exports.default = router;
//# sourceMappingURL=partnerSelectionRoutes.js.map