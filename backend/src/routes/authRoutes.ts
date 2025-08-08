import { Router } from 'express';
import {
  register,
  login,
  createSession,
  joinSession,
  getCurrentSession,
  validateRegister,
  validateLogin,
  validateCreateSession,
  validateJoinSession
} from '../controllers/authController';
import { authenticateToken, requireRole } from '../utils/jwt';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.post('/session/create', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  validateCreateSession, 
  createSession
);

router.post('/session/join', 
  authenticateToken, 
  validateJoinSession, 
  joinSession
);

router.get('/session/current', 
  authenticateToken, 
  getCurrentSession
);

export default router; 