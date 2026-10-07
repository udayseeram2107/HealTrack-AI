import { z } from 'zod';

export const RiskLevelSchema = z.enum(['stable', 'monitor', 'clinical_review_recommended']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const ExudateLevelSchema = z.enum(['none', 'scant', 'moderate', 'heavy']);
export type ExudateLevel = z.infer<typeof ExudateLevelSchema>;

export const ExudateTypeSchema = z.enum(['none', 'serous', 'serosanguinous', 'sanguinous', 'purulent']);
export type ExudateType = z.infer<typeof ExudateTypeSchema>;

export const OdorLevelSchema = z.enum(['none', 'mild', 'foul']);
export type OdorLevel = z.infer<typeof OdorLevelSchema>;

export const SupportedLanguageSchema = z.enum(['en', 'te', 'hi', 'ta']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const UserRoleSchema = z.enum(['patient', 'doctor', 'caregiver', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const WoundTypeSchema = z.enum([
  'Post-Surgical Incision',
  'Diabetic Foot Ulcer (DFU)',
  'Venous Leg Ulcer (VLU)',
  'Arterial Insufficiency Ulcer',
  'Pressure Injury (Stage 1-4)',
  'Traumatic Laceration / Abrasion',
  'Burn (1st/2nd Degree Superficial)',
  'Other Cutaneous Wound'
]);
export type WoundType = z.infer<typeof WoundTypeSchema>;

export const CreateWoundSchema = z.object({
  wound_name: z.string().min(2, 'Wound name must be at least 2 characters').max(100),
  anatomical_location: z.string().min(2, 'Anatomical location is required').max(100),
  wound_type: z.string().min(2, 'Wound type is required'),
  initial_onset_date: z.string().optional(),
  baseline_notes: z.string().max(1000).optional(),
});
export type CreateWoundInput = z.infer<typeof CreateWoundSchema>;

export const CreateWoundEntryInputSchema = z.object({
  pain_score: z.coerce.number().min(0).max(10),
  exudate_level: ExudateLevelSchema.default('none'),
  exudate_type: ExudateTypeSchema.default('none'),
  odor_level: OdorLevelSchema.default('none'),
  periwound_condition: z.array(z.string()).default([]),
  systemic_symptoms: z.array(z.string()).default([]),
  patient_notes: z.string().max(1000).optional().default(''),
  recorded_language: SupportedLanguageSchema.default('en')
});
export type CreateWoundEntryInput = z.infer<typeof CreateWoundEntryInputSchema>;

export const DoctorShareCreateSchema = z.object({
  wound_id: z.string().uuid(),
  duration_hours: z.number().int().min(1).max(168).default(48), // 1 hour to 7 days
  passcode: z.string().min(4).max(12).optional()
});
export type DoctorShareCreateInput = z.infer<typeof DoctorShareCreateSchema>;

export const NearbyFacilitiesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(500).max(50000).default(10000),
  type: z.string().optional().default('hospital'),
  specialty: z.string().optional()
});
export type NearbyFacilitiesQuery = z.infer<typeof NearbyFacilitiesQuerySchema>;

export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().optional(),
  preferred_language: SupportedLanguageSchema.optional()
});
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

export const CompareEntriesSchema = z.object({
  baseEntryId: z.string().uuid(),
  targetEntryId: z.string().uuid()
});
export type CompareEntriesInput = z.infer<typeof CompareEntriesSchema>;

export const AudioJournalExtractionSchema = z.object({
  transcription: z.string(),
  english_translation: z.string(),
  extracted_symptoms: z.object({
    pain_trend: z.enum(['decreased', 'stable', 'increased', 'unspecified']),
    swelling_present: z.boolean(),
    drainage_mentioned: z.boolean(),
    fever_or_systemic_signs: z.boolean(),
    patient_verbatim_summary: z.string()
  })
});
export type AudioJournalExtraction = z.infer<typeof AudioJournalExtractionSchema>;

export const ClinicalAnalysisSchema = z.object({
  risk_level: RiskLevelSchema,
  is_emergency_escalation: z.boolean(),
  risk_reasoning: z.string(),
  change_detection: z.object({
    area_trend: z.enum(['smaller', 'unchanged', 'larger', 'indeterminate']),
    visual_change_summary: z.string(),
    granulation_percent: z.number().min(0).max(100),
    slough_percent: z.number().min(0).max(100),
    necrosis_percent: z.number().min(0).max(100)
  }),
  personalized_guidance: z.object({
    care_tips: z.array(z.string()),
    risks_if_neglected: z.array(z.string()),
    recommended_specialties: z.array(z.string())
  })
});
export type ClinicalAnalysis = z.infer<typeof ClinicalAnalysisSchema>;

export const SBARSummarySchema = z.object({
  situation: z.string(),
  background: z.string(),
  assessment: z.string(),
  recommendation: z.string()
});
export type SBARSummary = z.infer<typeof SBARSummarySchema>;

export interface WoundRecord {
  id: string;
  patient_id: string;
  wound_name: string;
  anatomical_location: string;
  wound_type: string;
  initial_onset_date?: string;
  baseline_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  latest_entry?: WoundEntryRecord;
  entry_count?: number;
}

export interface WoundEntryRecord {
  id: string;
  wound_id: string;
  patient_id: string;
  image_url: string;
  thumbnail_url?: string;
  audio_recording_url?: string;
  raw_voice_transcript?: string;
  recorded_language: SupportedLanguage;
  pain_score: number;
  exudate_level: ExudateLevel;
  exudate_type: ExudateType;
  odor_level: OdorLevel;
  periwound_condition: string[];
  systemic_symptoms: string[];
  patient_notes?: string;
  ai_risk_level: RiskLevel;
  ai_risk_reasoning: string;
  ai_change_detection_summary?: string;
  ai_granulation_percentage?: number;
  ai_slough_percentage?: number;
  ai_necrosis_percentage?: number;
  ai_care_tips: string[];
  ai_risks_if_neglected: string[];
  ai_recommended_specialties: string[];
  ai_raw_json: any;
  is_emergency_escalation: boolean;
  entry_date: string;
  created_at: string;
}

export interface DoctorShareRecord {
  id: string;
  wound_id: string;
  patient_id: string;
  token: string;
  expires_at: string;
  access_code_hash?: string;
  allowed_entry_ids?: string[];
  view_count: number;
  last_accessed_at?: string;
  created_at: string;
}

export interface VerifiedFacility {
  id: string;
  google_place_id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  is_emergency_capable: boolean;
  supported_specialties: string[];
  distance_km?: number;
  verified_data_source: string;
}
