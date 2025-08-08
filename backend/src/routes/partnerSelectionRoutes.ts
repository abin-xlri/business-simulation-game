import { Router } from 'express';
import { 
  getPartners, 
  calculatePartnerScores, 
  submitPartnerSelection, 
  getPartnerSelection 
} from '../controllers/partnerSelectionController';
import { authenticateToken } from '../utils/jwt';

const router = Router();

// Public routes
router.get('/partners', getPartners);
router.get('/scores', calculatePartnerScores);

// Protected routes
router.get('/selection', authenticateToken, getPartnerSelection);
router.post('/submit', authenticateToken, submitPartnerSelection);

export default router; 