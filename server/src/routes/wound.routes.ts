import { Router } from 'express';
import { woundController } from '../controllers/wound.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadWoundEntryFiles } from '../middleware/upload.middleware.js';
import { aiProcessingLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// List wounds for authenticated patient
router.get('/', authenticate, (req, res) => woundController.listWounds(req, res));

// Create a new wound
router.post('/', authenticate, (req, res) => woundController.createWound(req, res));

// Fetch specific wound details and history
router.get('/:woundId', authenticate, (req, res) => woundController.getWound(req, res));

// Upload and analyze new wound entry (multipart/form-data)
router.post(
  '/:woundId/entries',
  authenticate,
  aiProcessingLimiter,
  uploadWoundEntryFiles,
  (req, res) => woundController.createWoundEntry(req, res)
);

// Compare two historical entries
router.post('/:woundId/compare', authenticate, (req, res) =>
  woundController.compareWoundEntries(req, res)
);

// Generate physician SBAR clinical summary
router.get('/:woundId/summary', authenticate, (req, res) =>
  woundController.getWoundSummary(req, res)
);

export default router;
