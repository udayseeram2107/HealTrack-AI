import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Current user profile
router.get('/', authenticate, (req, res) => profileController.getProfile(req, res));

// Update profile preferences
router.patch('/', authenticate, (req, res) => profileController.updateProfile(req, res));

// System configuration and API status check
router.get('/status', (req, res) => profileController.getSystemStatus(req as any, res));

// Update runtime API keys dynamically
router.post('/keys', authenticate, (req, res) => profileController.updateApiKeys(req, res));

export default router;
