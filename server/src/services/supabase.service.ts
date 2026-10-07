import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import {
  WoundRecord,
  WoundEntryRecord,
  DoctorShareRecord,
  VerifiedFacility,
  CreateWoundInput,
  CreateWoundEntryInput,
  DoctorShareCreateInput,
  ProfileUpdateInput
} from '../../../shared/index.js';

interface UserProfile {
  id: string;
  role: 'patient' | 'doctor' | 'caregiver' | 'admin';
  full_name: string;
  phone_number: string;
  preferred_language: 'en' | 'te' | 'hi' | 'ta';
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

interface LocalDatabase {
  profiles: UserProfile[];
  wounds: WoundRecord[];
  wound_entries: WoundEntryRecord[];
  doctor_shares: DoctorShareRecord[];
  verified_facilities: VerifiedFacility[];
}

export class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private isSupabaseConfigured: boolean = false;
  private localDbPath: string;
  private localData: LocalDatabase;

  constructor() {
    this.localDbPath = path.resolve(process.cwd(), 'data', 'healtrack_db.json');
    this.localData = this.loadLocalDatabase();

    if (config.supabase.url && config.supabase.serviceRoleKey) {
      try {
        this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
          auth: { persistSession: false },
          realtime: { transport: ws as any }
        });
        this.isSupabaseConfigured = true;
        console.log('[DatabaseService] Connected to Supabase backend successfully.');
      } catch (err) {
        console.warn('[DatabaseService] Supabase client initialization failed, falling back to local persistent store.', err);
        this.isSupabaseConfigured = false;
      }
    } else {
      console.log('[DatabaseService] Supabase credentials not provided. Running in persistent local clinical data mode.');
    }
  }

  private loadLocalDatabase(): LocalDatabase {
    const dataDir = path.dirname(this.localDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(this.localDbPath)) {
      try {
        const raw = fs.readFileSync(this.localDbPath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('[DatabaseService] Error reading local DB file, initializing fresh store:', e);
      }
    }

    // Default Seed Data
    const defaultPatientId = '00000000-0000-4000-a000-000000000001';
    const defaultWoundId1 = '00000000-0000-4000-a000-000000000011';
    const defaultWoundId2 = '00000000-0000-4000-a000-000000000012';

    const initialDb: LocalDatabase = {
      profiles: [
        {
          id: defaultPatientId,
          role: 'patient',
          full_name: 'Rajesh Sharma',
          phone_number: '+91 98765 43210',
          preferred_language: 'en',
          date_of_birth: '1974-06-15',
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      wounds: [
        {
          id: defaultWoundId1,
          patient_id: defaultPatientId,
          wound_name: 'Left Ankle Surgical Incision',
          anatomical_location: 'Left Lateral Malleolus (Ankle)',
          wound_type: 'Post-Surgical Incision',
          initial_onset_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
          baseline_notes: 'ORIF procedure for bimalleolar fracture. Suture removal done 4 days ago.',
          is_active: true,
          created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: defaultWoundId2,
          patient_id: defaultPatientId,
          wound_name: 'Right Plantar Forefoot Ulcer',
          anatomical_location: 'Right 1st Metatarsal Head (Plantar)',
          wound_type: 'Diabetic Foot Ulcer (DFU)',
          initial_onset_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
          baseline_notes: 'Neuropathic diabetic ulcer, undergoing offloading therapy.',
          is_active: true,
          created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      wound_entries: [
        {
          id: '00000000-0000-4000-a000-000000000101',
          wound_id: defaultWoundId1,
          patient_id: defaultPatientId,
          image_url: '/samples/ankle_wound_day1.webp',
          thumbnail_url: '/samples/ankle_wound_day1.webp',
          audio_recording_url: undefined,
          raw_voice_transcript: 'Mild redness around the stitches, feeling tight but pain is tolerable around 4 out of 10.',
          recorded_language: 'en',
          pain_score: 4,
          exudate_level: 'scant',
          exudate_type: 'serosanguinous',
          odor_level: 'none',
          periwound_condition: ['Erythematous (Red)'],
          systemic_symptoms: [],
          patient_notes: 'Baseline check post suture removal. Dressing changed with sterile gauze.',
          ai_risk_level: 'monitor',
          ai_risk_reasoning: 'Mild periwound erythema post suture removal. Controlled pain and minimal serosanguinous exudate.',
          ai_change_detection_summary: 'Baseline initial capture. Moderate erythema localized to suture line.',
          ai_granulation_percentage: 45.0,
          ai_slough_percentage: 15.0,
          ai_necrosis_percentage: 0.0,
          ai_care_tips: [
            'Maintain dry sterile non-adherent dressing.',
            'Avoid weight bearing directly on ankle.',
            'Keep elevated during rest periods.'
          ],
          ai_risks_if_neglected: [
            'Risk of bacterial colonization if skin moisture builds up.',
            'Superficial wound edge dehiscence.'
          ],
          ai_recommended_specialties: ['General Surgery', 'Orthopedic Surgery'],
          ai_raw_json: {},
          is_emergency_escalation: false,
          entry_date: new Date(Date.now() - 7 * 86400000).toISOString(),
          created_at: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
          id: '00000000-0000-4000-a000-000000000102',
          wound_id: defaultWoundId1,
          patient_id: defaultPatientId,
          image_url: '/samples/ankle_wound_day7.webp',
          thumbnail_url: '/samples/ankle_wound_day7.webp',
          audio_recording_url: undefined,
          raw_voice_transcript: 'Pain is much better now, around 2 out of 10. Redness has faded and incision is closing nicely.',
          recorded_language: 'en',
          pain_score: 2,
          exudate_level: 'none',
          exudate_type: 'none',
          odor_level: 'none',
          periwound_condition: ['Intact'],
          systemic_symptoms: [],
          patient_notes: 'Healing well, no drainage seen on morning dressing change.',
          ai_risk_level: 'stable',
          ai_risk_reasoning: 'Marked clinical improvement: erythema resolved, incision margin epithelized, no exudate or odor.',
          ai_change_detection_summary: 'Epithelial migration visible across 85% of incision. Significant reduction in perimeter redness.',
          ai_granulation_percentage: 85.0,
          ai_slough_percentage: 5.0,
          ai_necrosis_percentage: 0.0,
          ai_care_tips: [
            'Continue gentle cleansing with normal saline.',
            'Apply thin silicone barrier or protective bandage.',
            'Gradual range-of-motion ankle exercises.'
          ],
          ai_risks_if_neglected: [
            'Avoid premature vigorous friction or soaking in water.'
          ],
          ai_recommended_specialties: ['General Surgery'],
          ai_raw_json: {},
          is_emergency_escalation: false,
          entry_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ],
      doctor_shares: [],
      verified_facilities: []
    };

    fs.writeFileSync(this.localDbPath, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  private saveLocalDatabase(): void {
    try {
      fs.writeFileSync(this.localDbPath, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DatabaseService] Failed to persist local DB to file:', err);
    }
  }

  // ============================================================================
  // Profiles
  // ============================================================================
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as UserProfile;
    }
    const profile = this.localData.profiles.find((p) => p.id === userId);
    return profile || this.localData.profiles[0] || null;
  }

  async updateProfile(userId: string, input: ProfileUpdateInput): Promise<UserProfile> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) return data as UserProfile;
    }

    let profile = this.localData.profiles.find((p) => p.id === userId);
    if (!profile) {
      profile = {
        id: userId,
        role: 'patient',
        full_name: input.full_name || 'Patient',
        phone_number: input.phone_number || '',
        preferred_language: input.preferred_language || 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.localData.profiles.push(profile);
    } else {
      if (input.full_name) profile.full_name = input.full_name;
      if (input.phone_number) profile.phone_number = input.phone_number;
      if (input.preferred_language) profile.preferred_language = input.preferred_language;
      profile.updated_at = new Date().toISOString();
    }
    this.saveLocalDatabase();
    return profile;
  }

  // ============================================================================
  // Wounds
  // ============================================================================
  async listWounds(patientId: string): Promise<WoundRecord[]> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('wounds')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as WoundRecord[];
      }
    }

    // In local mode, return patient's wounds or all active wounds if demo patient
    const wounds = this.localData.wounds.filter((w) => w.patient_id === patientId || patientId.startsWith('00000000'));
    // Attach latest entry and entry count
    return wounds.map((w) => {
      const entries = this.localData.wound_entries
        .filter((e) => e.wound_id === w.id)
        .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
      return {
        ...w,
        latest_entry: entries[0],
        entry_count: entries.length
      };
    });
  }

  async getWound(woundId: string, patientId: string): Promise<WoundRecord | null> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('wounds')
        .select('*')
        .eq('id', woundId)
        .eq('patient_id', patientId)
        .single();
      if (!error && data) return data as WoundRecord;
    }
    const wound = this.localData.wounds.find((w) => w.id === woundId);
    if (!wound) return null;
    const entries = this.localData.wound_entries
      .filter((e) => e.wound_id === wound.id)
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
    return {
      ...wound,
      latest_entry: entries[0],
      entry_count: entries.length
    };
  }

  async createWound(patientId: string, input: CreateWoundInput): Promise<WoundRecord> {
    const newWound: WoundRecord = {
      id: uuidv4(),
      patient_id: patientId,
      wound_name: input.wound_name,
      anatomical_location: input.anatomical_location,
      wound_type: input.wound_type,
      initial_onset_date: input.initial_onset_date || new Date().toISOString().split('T')[0],
      baseline_notes: input.baseline_notes || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('wounds')
        .insert(newWound)
        .select()
        .single();
      if (!error && data) return data as WoundRecord;
    }

    this.localData.wounds.unshift(newWound);
    this.saveLocalDatabase();
    return newWound;
  }

  // ============================================================================
  // Wound Entries
  // ============================================================================
  async listWoundEntries(woundId: string): Promise<WoundEntryRecord[]> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('wound_entries')
        .select('*')
        .eq('wound_id', woundId)
        .order('entry_date', { ascending: false });
      if (!error && data) return data as WoundEntryRecord[];
    }

    return this.localData.wound_entries
      .filter((e) => e.wound_id === woundId)
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  }

  async getWoundEntry(entryId: string): Promise<WoundEntryRecord | null> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('wound_entries')
        .select('*')
        .eq('id', entryId)
        .single();
      if (!error && data) return data as WoundEntryRecord;
    }

    return this.localData.wound_entries.find((e) => e.id === entryId) || null;
  }

  async createWoundEntry(entry: Omit<WoundEntryRecord, 'id' | 'created_at'>): Promise<WoundEntryRecord> {
    const record: WoundEntryRecord = {
      ...entry,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };

    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('wound_entries')
        .insert(record)
        .select()
        .single();
      if (!error && data) return data as WoundEntryRecord;
    }

    this.localData.wound_entries.unshift(record);
    // Update wound updated_at
    const wound = this.localData.wounds.find((w) => w.id === record.wound_id);
    if (wound) wound.updated_at = record.created_at;

    this.saveLocalDatabase();
    return record;
  }

  // ============================================================================
  // Doctor Shares
  // ============================================================================
  async createDoctorShare(
    patientId: string,
    input: DoctorShareCreateInput
  ): Promise<DoctorShareRecord> {
    const token = uuidv4().replace(/-/g, '') + Math.random().toString(36).substring(2, 8);
    const expiresAt = new Date(Date.now() + input.duration_hours * 3600000).toISOString();

    const record: DoctorShareRecord = {
      id: uuidv4(),
      wound_id: input.wound_id,
      patient_id: patientId,
      token,
      expires_at: expiresAt,
      view_count: 0,
      created_at: new Date().toISOString()
    };

    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('doctor_shares')
        .insert(record)
        .select()
        .single();
      if (!error && data) return data as DoctorShareRecord;
    }

    this.localData.doctor_shares.push(record);
    this.saveLocalDatabase();
    return record;
  }

  async getSharedDataByToken(token: string): Promise<{
    wound: WoundRecord;
    entries: WoundEntryRecord[];
    shareInfo: { expires_at: string; view_count: number };
  } | null> {
    if (this.isSupabaseConfigured && this.supabase) {
      // Call security definer stored procedure or direct query
      const { data: share, error: shareErr } = await this.supabase
        .from('doctor_shares')
        .select('*')
        .eq('token', token)
        .single();

      if (!shareErr && share && new Date(share.expires_at) > new Date()) {
        await this.supabase
          .from('doctor_shares')
          .update({
            view_count: share.view_count + 1,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', share.id);

        const { data: wound } = await this.supabase
          .from('wounds')
          .select('*')
          .eq('id', share.wound_id)
          .single();

        const { data: entries } = await this.supabase
          .from('wound_entries')
          .select('*')
          .eq('wound_id', share.wound_id)
          .order('entry_date', { ascending: false });

        if (wound && entries) {
          return {
            wound: wound as WoundRecord,
            entries: entries as WoundEntryRecord[],
            shareInfo: {
              expires_at: share.expires_at,
              view_count: share.view_count + 1
            }
          };
        }
      }
    }

    // Local DB resolution
    const share = this.localData.doctor_shares.find((s) => s.token === token);
    if (!share) return null;

    if (new Date(share.expires_at).getTime() < Date.now()) {
      return null; // Expired
    }

    share.view_count += 1;
    share.last_accessed_at = new Date().toISOString();
    this.saveLocalDatabase();

    const wound = this.localData.wounds.find((w) => w.id === share.wound_id);
    if (!wound) return null;

    const entries = this.localData.wound_entries
      .filter((e) => e.wound_id === wound.id)
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

    return {
      wound,
      entries,
      shareInfo: {
        expires_at: share.expires_at,
        view_count: share.view_count
      }
    };
  }

  // ============================================================================
  // Verified Facilities Cache
  // ============================================================================
  async getFacilitiesCache(): Promise<VerifiedFacility[]> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data } = await this.supabase.from('verified_facilities').select('*');
      if (data && data.length > 0) return data as VerifiedFacility[];
    }
    return this.localData.verified_facilities;
  }

  async saveFacilitiesCache(facilities: VerifiedFacility[]): Promise<void> {
    if (this.isSupabaseConfigured && this.supabase) {
      for (const fac of facilities) {
        await this.supabase.from('verified_facilities').upsert(fac, { onConflict: 'google_place_id' });
      }
    }
    for (const fac of facilities) {
      const idx = this.localData.verified_facilities.findIndex((f) => f.google_place_id === fac.google_place_id);
      if (idx >= 0) {
        this.localData.verified_facilities[idx] = fac;
      } else {
        this.localData.verified_facilities.push(fac);
      }
    }
    this.saveLocalDatabase();
  }
}

export const db = new DatabaseService();
