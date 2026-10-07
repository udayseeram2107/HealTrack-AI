import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { db } from '../services/supabase.service.js';
import { geminiService } from '../services/gemini.service.js';
import { mapsService } from '../services/maps.service.js';
import { ProfileUpdateSchema } from '../shared/index.js';

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '00000000-0000-4000-a000-000000000001';
      const profile = await db.getProfile(userId);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      console.error('[ProfileController] getProfile error:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '00000000-0000-4000-a000-000000000001';
      const validated = ProfileUpdateSchema.parse(req.body);
      const updated = await db.updateProfile(userId, validated);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('[ProfileController] updateProfile error:', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to update profile' });
    }
  }

  async getSystemStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          gemini: {
            isConfigured: geminiService.isConfigured(),
            model: 'gemini-2.5-flash'
          },
          googleMaps: {
            isConfigured: mapsService.isConfigured()
          },
          database: {
            type: 'hybrid-clinical-store',
            status: 'operational'
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to get system status' });
    }
  }

  async updateApiKeys(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { geminiApiKey, googleMapsApiKey } = req.body;
      if (geminiApiKey) {
        geminiService.setApiKey(geminiApiKey);
      }
      if (googleMapsApiKey) {
        mapsService.setApiKey(googleMapsApiKey);
      }
      res.json({
        success: true,
        message: 'API credentials updated successfully',
        status: {
          geminiConfigured: geminiService.isConfigured(),
          mapsConfigured: mapsService.isConfigured()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to update API credentials' });
    }
  }
}

export const profileController = new ProfileController();
