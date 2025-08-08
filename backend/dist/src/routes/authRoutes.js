"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', authController_1.validateRegister, authController_1.register);
router.post('/login', authController_1.validateLogin, authController_1.login);
// Protected routes
router.post('/session/create', jwt_1.authenticateToken, (0, jwt_1.requireRole)(['ADMIN']), authController_1.validateCreateSession, authController_1.createSession);
router.post('/session/join', jwt_1.authenticateToken, authController_1.validateJoinSession, authController_1.joinSession);
router.get('/session/current', jwt_1.authenticateToken, authController_1.getCurrentSession);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map