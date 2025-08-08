"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupController_1 = require("../controllers/groupController");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// Protected routes - all require authentication
router.use(jwt_1.authenticateToken);
// Group management
router.post('/create', groupController_1.createGroup);
router.post('/join', groupController_1.joinGroup);
router.get('/list', groupController_1.getGroups);
router.get('/:groupId', groupController_1.getGroup);
// Messaging
router.post('/message', groupController_1.sendMessage);
router.get('/:groupId/messages', groupController_1.getMessages);
// Task data
router.get('/market/data', groupController_1.getMarketData);
router.get('/budget/data', groupController_1.getBudgetData);
// Decisions
router.post('/market/decision', groupController_1.submitMarketDecision);
router.post('/budget/ordering', groupController_1.submitBudgetOrdering);
exports.default = router;
//# sourceMappingURL=groupRoutes.js.map