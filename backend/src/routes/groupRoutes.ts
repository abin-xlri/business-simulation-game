import { Router } from 'express';
import {
  createGroup,
  joinGroup,
  getGroup,
  getGroups,
  sendMessage,
  getMessages,
  getMarketData,
  getBudgetData,
  submitMarketDecision,
  submitBudgetOrdering
} from '../controllers/groupController';
import { authenticateToken } from '../utils/jwt';

const router = Router();

// Protected routes - all require authentication
router.use(authenticateToken);

// Group management
router.post('/create', createGroup);
router.post('/join', joinGroup);
router.get('/list', getGroups);
router.get('/:groupId', getGroup);

// Messaging
router.post('/message', sendMessage);
router.get('/:groupId/messages', getMessages);

// Task data
router.get('/market/data', getMarketData);
router.get('/budget/data', getBudgetData);

// Decisions
router.post('/market/decision', submitMarketDecision);
router.post('/budget/ordering', submitBudgetOrdering);

export default router; 