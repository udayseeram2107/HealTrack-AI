-- ==============================================================================
-- HealTrack AI / Smart Wound AI - Production PostgreSQL Database Schema & RLS
-- ==============================================================================

-- Enable required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for idempotency if needed (comment out in production upgrades)
-- DROP TYPE IF EXISTS user_role CASCADE;
-- DROP TYPE IF EXISTS risk_level CASCADE;
-- DROP TYPE IF EXISTS exudate_type_enum CASCADE;
-- DROP TYPE IF EXISTS exudate_level_enum CASCADE;
-- DROP TYPE IF EXISTS odor_level_enum CASCADE;

-- 1. Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'caregiver', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('stable', 'monitor', 'clinical_review_recommended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE exudate_type_enum AS ENUM ('none', 'serous', 'serosanguinous', 'sanguinous', 'purulent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE exudate_level_enum AS ENUM ('none', 'scant', 'moderate', 'heavy');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE odor_level_enum AS ENUM ('none', 'mild', 'foul');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'patient' NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    preferred_language VARCHAR(5) DEFAULT 'en' NOT NULL, -- 'en', 'te', 'hi', 'ta'
    date_of_birth DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Wounds Entity Table
CREATE TABLE IF NOT EXISTS wounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    wound_name TEXT NOT NULL, -- e.g., "Left Ankle Ulcer"
    anatomical_location TEXT NOT NULL,
    wound_type TEXT NOT NULL,
    initial_onset_date DATE,
    baseline_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Wound Entries Table (Daily Longitudinal Records)
CREATE TABLE IF NOT EXISTS wound_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wound_id UUID NOT NULL REFERENCES wounds(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    audio_recording_url TEXT,
    raw_voice_transcript TEXT,
    recorded_language VARCHAR(5) DEFAULT 'en',
    
    -- Patient Reported Measurements
    pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
    exudate_level exudate_level_enum DEFAULT 'none',
    exudate_type exudate_type_enum DEFAULT 'none',
    odor_level odor_level_enum DEFAULT 'none',
    periwound_condition TEXT[] DEFAULT '{}',
    systemic_symptoms TEXT[] DEFAULT '{}',
    patient_notes TEXT,

    -- AI Clinical Analysis Results
    ai_risk_level risk_level DEFAULT 'stable' NOT NULL,
    ai_risk_reasoning TEXT NOT NULL,
    ai_change_detection_summary TEXT,
    ai_granulation_percentage NUMERIC(5, 2),
    ai_slough_percentage NUMERIC(5, 2),
    ai_necrosis_percentage NUMERIC(5, 2),
    ai_care_tips TEXT[] DEFAULT '{}',
    ai_risks_if_neglected TEXT[] DEFAULT '{}',
    ai_recommended_specialties TEXT[] DEFAULT '{}',
    ai_raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_emergency_escalation BOOLEAN DEFAULT FALSE NOT NULL,

    entry_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Secure Doctor-Share Tokens
CREATE TABLE IF NOT EXISTS doctor_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wound_id UUID NOT NULL REFERENCES wounds(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    access_code_hash TEXT, -- Optional bcrypt PIN
    allowed_entry_ids UUID[] DEFAULT NULL, -- NULL means all entries
    view_count INT DEFAULT 0 NOT NULL,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Verified Medical Facilities Directory Cache
CREATE TABLE IF NOT EXISTS verified_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_place_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    formatted_address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    phone_number TEXT,
    rating NUMERIC(2, 1),
    user_ratings_total INT,
    is_emergency_capable BOOLEAN DEFAULT FALSE NOT NULL,
    supported_specialties TEXT[] DEFAULT '{}',
    verified_data_source TEXT DEFAULT 'Google Places API' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wounds_patient_id ON wounds(patient_id);
CREATE INDEX IF NOT EXISTS idx_wound_entries_wound_id ON wound_entries(wound_id);
CREATE INDEX IF NOT EXISTS idx_wound_entries_created_at ON wound_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_shares_token ON doctor_shares(token);
CREATE INDEX IF NOT EXISTS idx_verified_facilities_coords ON verified_facilities(latitude, longitude);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE wound_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_facilities ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile"
ON profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Wounds RLS
DROP POLICY IF EXISTS "Patients manage their own wounds" ON wounds;
CREATE POLICY "Patients manage their own wounds"
ON wounds FOR ALL
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- 3. Wound Entries RLS
DROP POLICY IF EXISTS "Patients manage their own entries" ON wound_entries;
CREATE POLICY "Patients manage their own entries"
ON wound_entries FOR ALL
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- 4. Doctor Shares RLS
DROP POLICY IF EXISTS "Patients manage their doctor share records" ON doctor_shares;
CREATE POLICY "Patients manage their doctor share records"
ON doctor_shares FOR ALL
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Public read access for valid share tokens" ON doctor_shares;
CREATE POLICY "Public read access for valid share tokens"
ON doctor_shares FOR SELECT
USING (expires_at > NOW());

-- 5. Verified Facilities RLS
DROP POLICY IF EXISTS "Authenticated users can read facilities" ON verified_facilities;
CREATE POLICY "Authenticated users can read facilities"
ON verified_facilities FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Public read access to facilities" ON verified_facilities;
CREATE POLICY "Public read access to facilities"
ON verified_facilities FOR SELECT
TO anon
USING (true);

-- ==============================================================================
-- Stored Procedure: get_shared_wound_data (Security Definer)
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_shared_wound_data(share_token TEXT)
RETURNS TABLE (
    wound_name TEXT,
    anatomical_location TEXT,
    entry_date TIMESTAMPTZ,
    image_url TEXT,
    pain_score INT,
    exudate_level exudate_level_enum,
    ai_risk_level risk_level,
    ai_change_detection_summary TEXT,
    ai_risk_reasoning TEXT,
    ai_granulation_percentage NUMERIC,
    ai_slough_percentage NUMERIC,
    ai_necrosis_percentage NUMERIC,
    ai_care_tips TEXT[],
    ai_risks_if_neglected TEXT[],
    ai_recommended_specialties TEXT[]
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_wound_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    SELECT wound_id, expires_at INTO v_wound_id, v_expires_at
    FROM doctor_shares
    WHERE token = share_token;

    IF v_wound_id IS NULL OR v_expires_at < NOW() THEN
        RAISE EXCEPTION 'Invalid or expired access token';
    END IF;

    -- Update access metrics
    UPDATE doctor_shares
    SET view_count = view_count + 1,
        last_accessed_at = NOW()
    WHERE token = share_token;

    RETURN QUERY
    SELECT 
        w.wound_name,
        w.anatomical_location,
        we.entry_date,
        we.image_url,
        we.pain_score,
        we.exudate_level,
        we.ai_risk_level,
        we.ai_change_detection_summary,
        we.ai_risk_reasoning,
        we.ai_granulation_percentage,
        we.ai_slough_percentage,
        we.ai_necrosis_percentage,
        we.ai_care_tips,
        we.ai_risks_if_neglected,
        we.ai_recommended_specialties
    FROM wound_entries we
    JOIN wounds w ON w.id = we.wound_id
    WHERE we.wound_id = v_wound_id
    ORDER BY we.entry_date DESC;
END;
$$;

-- Storage Bucket setup note:
-- Bucket 'wound-records' must be created with private = true.
-- Policies:
-- INSERT: auth.uid() IS NOT NULL
-- SELECT: auth.uid() = owner OR signed URL access
