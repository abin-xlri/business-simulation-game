"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const round1Controller_1 = require("../controllers/round1Controller");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// Public routes for getting station and segment data
router.get('/stations', round1Controller_1.getStations);
router.get('/segments', round1Controller_1.getRouteSegments);
// Protected route for route calculation
router.post('/calculate-route', jwt_1.authenticateToken, round1Controller_1.calculateRoute);
exports.default = router;
//# sourceMappingURL=round1Routes.js.map