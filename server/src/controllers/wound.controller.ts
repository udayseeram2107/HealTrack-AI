import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { db } from '../services/supabase.service.js';
import { geminiService } from '../services/gemini.service.js';
import { saveBufferToUploads } from '../middleware/upload.middleware.js';
import {
  CreateWoundSchema,
  CreateWoundEntryInputSchema,
  SupportedLanguage
} from '../../../shared/index.js';
import fs from 'fs';
import path from 'path';

export class WoundController {
  async listWounds(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.user?.id || '00000000-0000-4000-a000-000000000001';
      const wounds = await db.listWounds(patientId);
      res.json({ success: true, data: wounds });
    } catch (err: any) {
      console.error('[WoundController] listWounds error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to list wounds' });
    }
  }

  async getWound(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { woundId } = req.params;
      const patientId = req.user?.id || '00000000-0000-4000-a000-000000000001';
      const wound = await db.getWound(woundId, patientId);

      if (!wound) {
        res.status(404).json({ success: false, error: 'Wound record not found' });
        return;
      }

      const entries = await db.listWoundEntries(woundId);
      res.json({
        success: true,
        data: {
          ...wound,
          entries
        }
      });
    } catch (err: any) {
      console.error('[WoundController] getWound error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to get wound' });
    }
  }

  async createWound(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.user?.id || '00000000-0000-4000-a000-000000000001';
      const validated = CreateWoundSchema.parse(req.body);
      const newWound = await db.createWound(patientId, validated);
      res.status(201).json({ success: true, data: newWound });
    } catch (err: any) {
      console.error('[WoundController] createWound error:', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to create wound' });
    }
  }

  async createWoundEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { woundId } = req.params;
      const patientId = req.user?.id || '00000000-0000-4000-a000-000000000001';

      const wound = await db.getWound(woundId, patientId);
      if (!wound) {
        res.status(404).json({ success: false, error: 'Wound record not found' });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.['image']?.[0];
      const audioFile = files?.['audio']?.[0];

      if (!imageFile) {
        res.status(400).json({ success: false, error: 'Wound image is required' });
        return;
      }

      // Parse symptom telemetry from request body
      let rawTelemetry = req.body;
      if (req.body.body) {
        if (typeof req.body.body === 'string') {
          try {
            let str = req.body.body.trim();
            if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"') && !str.startsWith('{"'))) {
              str = str.slice(1, -1);
            }
            rawTelemetry = JSON.parse(str);
          } catch (e) {
            console.warn('[WoundController] Could not parse body JSON string, using raw fields');
          }
        } else if (typeof req.body.body === 'object') {
          rawTelemetry = req.body.body;
        }
      }

      if (rawTelemetry.pain_score === undefined && req.body.pain_score !== undefined) {
        rawTelemetry.pain_score = req.body.pain_score;
      }
      if (rawTelemetry.pain_score === undefined || isNaN(Number(rawTelemetry.pain_score))) {
        rawTelemetry.pain_score = 0;
      }

      const validatedTelemetry = CreateWoundEntryInputSchema.parse(rawTelemetry);

      // Save image to upload store
      const imageUrl = saveBufferToUploads(imageFile.buffer, imageFile.originalname, 'wound');

      // Process Audio Journal if provided
      let rawVoiceTranscript = '';
      if (audioFile && audioFile.buffer) {
        const audioResult = await geminiService.processAudioJournal(
          audioFile.buffer,
          audioFile.mimetype,
          validatedTelemetry.recorded_language
        );
        rawVoiceTranscript = audioResult.english_translation || audioResult.transcription;

        // If audio notes found and patient notes was empty, populate it
        if (!validatedTelemetry.patient_notes || validatedTelemetry.patient_notes.trim().length === 0) {
          validatedTelemetry.patient_notes = audioResult.extracted_symptoms?.patient_verbatim_summary || audioResult.english_translation;
        }
      }

      // Find previous entry for longitudinal comparison
      const existingEntries = await db.listWoundEntries(woundId);
      const previousEntry = existingEntries[0]; // most recent
      let previousImageBuffer: Buffer | undefined;

      if (previousEntry && previousEntry.image_url) {
        try {
          // If local file path
          if (previousEntry.image_url.startsWith('/uploads/')) {
            const localPath = path.join(process.cwd(), previousEntry.image_url);
            if (fs.existsSync(localPath)) {
              previousImageBuffer = fs.readFileSync(localPath);
            }
          }
        } catch (e) {
          console.warn('[WoundController] Could not read previous image for comparison:', e);
        }
      }

      // Multimodal Gemini Longitudinal Analysis
      const clinicalAnalysis = await geminiService.analyzeWoundTelemetry({
        currentImageBuffer: imageFile.buffer,
        currentImageMime: imageFile.mimetype,
        previousImageBuffer,
        previousImageMime: 'image/jpeg',
        pain_score: validatedTelemetry.pain_score,
        exudate_level: validatedTelemetry.exudate_level,
        exudate_type: validatedTelemetry.exudate_type,
        odor_level: validatedTelemetry.odor_level,
        periwound_condition: validatedTelemetry.periwound_condition,
        systemic_symptoms: validatedTelemetry.systemic_symptoms,
        patient_notes: validatedTelemetry.patient_notes,
        language: validatedTelemetry.recorded_language
      });

      // Save Entry Record to DB
      const entryRecord = await db.createWoundEntry({
        wound_id: woundId,
        patient_id: patientId,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        audio_recording_url: undefined, // temporary audio scrubbed per security policy
        raw_voice_transcript: rawVoiceTranscript,
        recorded_language: validatedTelemetry.recorded_language as SupportedLanguage,
        pain_score: validatedTelemetry.pain_score,
        exudate_level: validatedTelemetry.exudate_level,
        exudate_type: validatedTelemetry.exudate_type,
        odor_level: validatedTelemetry.odor_level,
        periwound_condition: validatedTelemetry.periwound_condition,
        systemic_symptoms: validatedTelemetry.systemic_symptoms,
        patient_notes: validatedTelemetry.patient_notes,
        ai_risk_level: clinicalAnalysis.risk_level,
        ai_risk_reasoning: clinicalAnalysis.risk_reasoning,
        ai_change_detection_summary: clinicalAnalysis.change_detection.visual_change_summary,
        ai_granulation_percentage: clinicalAnalysis.change_detection.granulation_percent,
        ai_slough_percentage: clinicalAnalysis.change_detection.slough_percent,
        ai_necrosis_percentage: clinicalAnalysis.change_detection.necrosis_percent,
        ai_care_tips: clinicalAnalysis.personalized_guidance.care_tips,
        ai_risks_if_neglected: clinicalAnalysis.personalized_guidance.risks_if_neglected,
        ai_recommended_specialties: clinicalAnalysis.personalized_guidance.recommended_specialties,
        ai_raw_json: clinicalAnalysis,
        is_emergency_escalation: clinicalAnalysis.is_emergency_escalation,
        entry_date: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        data: entryRecord
      });
    } catch (err: any) {
      console.error('[WoundController] createWoundEntry error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to create wound entry' });
    }
  }

  async compareWoundEntries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { woundId } = req.params;
      const { baseEntryId, targetEntryId } = req.body;

      if (!baseEntryId || !targetEntryId) {
        res.status(400).json({ success: false, error: 'baseEntryId and targetEntryId are required' });
        return;
      }

      const baseEntry = await db.getWoundEntry(baseEntryId);
      const targetEntry = await db.getWoundEntry(targetEntryId);

      if (!baseEntry || !targetEntry) {
        res.status(404).json({ success: false, error: 'One or both entries not found' });
        return;
      }

      const painDelta = targetEntry.pain_score - baseEntry.pain_score;
      const granulationDelta =
        (targetEntry.ai_granulation_percentage || 0) - (baseEntry.ai_granulation_percentage || 0);
      const sloughDelta =
        (targetEntry.ai_slough_percentage || 0) - (baseEntry.ai_slough_percentage || 0);
      const necrosisDelta =
        (targetEntry.ai_necrosis_percentage || 0) - (baseEntry.ai_necrosis_percentage || 0);

      const daysElapsed = Math.max(
        0,
        Math.round(
          (new Date(targetEntry.entry_date).getTime() - new Date(baseEntry.entry_date).getTime()) /
            86400000
        )
      );

      let healingStatus = 'Stable / Unchanged';
      if (granulationDelta > 10 && painDelta <= 0) {
        healingStatus = 'Positive Healing Trajectory (Active Granulation)';
      } else if (granulationDelta < -10 || painDelta > 2 || sloughDelta > 15) {
        healingStatus = 'Potential Regression (Monitor Closely)';
      }

      res.json({
        success: true,
        data: {
          baseEntry,
          targetEntry,
          daysElapsed,
          healingStatus,
          deltas: {
            pain: painDelta,
            granulation: Math.round(granulationDelta * 10) / 10,
            slough: Math.round(sloughDelta * 10) / 10,
            necrosis: Math.round(necrosisDelta * 10) / 10
          }
        }
      });
    } catch (err: any) {
      console.error('[WoundController] compareWoundEntries error:', err);
      res.status(500).json({ success: false, error: err.message || 'Comparison failed' });
    }
  }

  async getWoundSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { woundId } = req.params;
      const patientId = req.user?.id || '00000000-0000-4000-a000-000000000001';

      const wound = await db.getWound(woundId, patientId);
      if (!wound) {
        res.status(404).json({ success: false, error: 'Wound record not found' });
        return;
      }

      const entries = await db.listWoundEntries(woundId);
      if (entries.length === 0) {
        res.status(400).json({ success: false, error: 'No clinical entries recorded for this wound yet' });
        return;
      }

      const sbar = await geminiService.generateSBARSummary({
        woundName: wound.wound_name,
        location: wound.anatomical_location,
        woundType: wound.wound_type,
        entries
      });

      res.json({
        success: true,
        data: {
          wound,
          summary: sbar,
          entryCount: entries.length,
          latestRisk: entries[0]?.ai_risk_level || 'stable'
        }
      });
    } catch (err: any) {
      console.error('[WoundController] getWoundSummary error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to generate summary' });
    }
  }
}

export const woundController = new WoundController();
