import { Router } from 'express';
import { shareController } from '../controllers/share.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { shareViewLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Create doctor share token for a wound (authenticated)
router.post('/wounds/:woundId/shares', authenticate, (req, res) =>
  shareController.createShare(req, res)
);

// Public rate-limited unauthenticated doctor view for active share tokens
router.get('/public/shares/:token', shareViewLimiter, (req, res) =>
  shareController.getSharedData(req, res)
);

export default router;
