import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { db } from '../services/supabase.service.js';
import { geminiService } from '../services/gemini.service.js';
import { DoctorShareCreateSchema } from '../../../shared/index.js';

export class ShareController {
  async createShare(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { woundId } = req.params;
      const patientId = req.user?.id || '00000000-0000-4000-a000-000000000001';

      const wound = await db.getWound(woundId, patientId);
      if (!wound) {
        res.status(404).json({ success: false, error: 'Wound record not found' });
        return;
      }

      const input = DoctorShareCreateSchema.parse({
        wound_id: woundId,
        duration_hours: req.body.duration_hours || req.body.durationHours || 48,
        passcode: req.body.passcode
      });

      const shareRecord = await db.createDoctorShare(patientId, input);

      res.status(201).json({
        success: true,
        data: {
          token: shareRecord.token,
          expires_at: shareRecord.expires_at,
          share_url: `/share/${shareRecord.token}`
        }
      });
    } catch (err: any) {
      console.error('[ShareController] createShare error:', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to create share token' });
    }
  }

  async getSharedData(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token || token.length < 10) {
        res.status(400).json({ success: false, error: 'Invalid share token' });
        return;
      }

      const shared = await db.getSharedDataByToken(token);

      if (!shared) {
        res.status(404).json({
          success: false,
          error: 'This doctor-share link is invalid or has expired. Please ask the patient for a renewed link.'
        });
        return;
      }

      // Generate physician SBAR summary
      let sbarSummary = null;
      if (shared.entries.length > 0) {
        sbarSummary = await geminiService.generateSBARSummary({
          woundName: shared.wound.wound_name,
          location: shared.wound.anatomical_location,
          woundType: shared.wound.wound_type,
          entries: shared.entries
        });
      }

      res.json({
        success: true,
        data: {
          wound: {
            wound_name: shared.wound.wound_name,
            anatomical_location: shared.wound.anatomical_location,
            wound_type: shared.wound.wound_type,
            initial_onset_date: shared.wound.initial_onset_date,
            baseline_notes: shared.wound.baseline_notes
          },
          entries: shared.entries,
          sbarSummary,
          shareInfo: shared.shareInfo
        }
      });
    } catch (err: any) {
      console.error('[ShareController] getSharedData error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to retrieve shared record' });
    }
  }
}

export const shareController = new ShareController();
