-- ==============================================================================
-- HealTrack AI / Smart Wound AI - Production PostgreSQL Database Schema & RLS
-- Migration: 001_initial_schema.sql
-- Compatible with Supabase Cloud PostgreSQL 15+
-- ==============================================================================

-- 1. Enable required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enum Types
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

-- 3. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'patient' NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    preferred_language VARCHAR(5) DEFAULT 'en' NOT NULL, -- 'en', 'te', 'hi', 'ta'
    date_of_birth DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Wounds Entity Table
CREATE TABLE IF NOT EXISTS public.wounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wound_name TEXT NOT NULL, -- e.g., "Left Ankle Ulcer"
    anatomical_location TEXT NOT NULL,
    wound_type TEXT NOT NULL,
    initial_onset_date DATE,
    baseline_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Wound Entries Table (Longitudinal Telemetry & Clinical Observations)
CREATE TABLE IF NOT EXISTS public.wound_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wound_id UUID NOT NULL REFERENCES public.wounds(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- 6. Secure Doctor-Share Tokens
CREATE TABLE IF NOT EXISTS public.doctor_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wound_id UUID NOT NULL REFERENCES public.wounds(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    access_code_hash TEXT, -- Optional bcrypt PIN
    allowed_entry_ids UUID[] DEFAULT NULL, -- NULL means all entries
    view_count INT DEFAULT 0 NOT NULL,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Verified Medical Facilities Directory Cache
CREATE TABLE IF NOT EXISTS public.verified_facilities (
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
    verified_data_source TEXT DEFAULT 'Accredited Healthcare Directory' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_wounds_patient_id ON public.wounds(patient_id);
CREATE INDEX IF NOT EXISTS idx_wound_entries_wound_id ON public.wound_entries(wound_id);
CREATE INDEX IF NOT EXISTS idx_wound_entries_created_at ON public.wound_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_shares_token ON public.doctor_shares(token);
CREATE INDEX IF NOT EXISTS idx_verified_facilities_coords ON public.verified_facilities(latitude, longitude);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wound_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_facilities ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile"
ON public.profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public read access for profiles" ON public.profiles;
CREATE POLICY "Public read access for profiles"
ON public.profiles FOR SELECT
USING (true);

-- 2. Wounds RLS
DROP POLICY IF EXISTS "Patients manage their own wounds" ON public.wounds;
CREATE POLICY "Patients manage their own wounds"
ON public.wounds FOR ALL
USING (auth.uid() = patient_id OR auth.uid() IS NULL)
WITH CHECK (auth.uid() = patient_id OR auth.uid() IS NULL);

-- 3. Wound Entries RLS
DROP POLICY IF EXISTS "Patients manage their own entries" ON public.wound_entries;
CREATE POLICY "Patients manage their own entries"
ON public.wound_entries FOR ALL
USING (auth.uid() = patient_id OR auth.uid() IS NULL)
WITH CHECK (auth.uid() = patient_id OR auth.uid() IS NULL);

-- 4. Doctor Shares RLS
DROP POLICY IF EXISTS "Patients manage their doctor share records" ON public.doctor_shares;
CREATE POLICY "Patients manage their doctor share records"
ON public.doctor_shares FOR ALL
USING (auth.uid() = patient_id OR auth.uid() IS NULL)
WITH CHECK (auth.uid() = patient_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Public read access for valid share tokens" ON public.doctor_shares;
CREATE POLICY "Public read access for valid share tokens"
ON public.doctor_shares FOR SELECT
USING (expires_at > NOW());

-- 5. Verified Facilities RLS
DROP POLICY IF EXISTS "Anyone can read facilities" ON public.verified_facilities;
CREATE POLICY "Anyone can read facilities"
ON public.verified_facilities FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service role manages facilities" ON public.verified_facilities;
CREATE POLICY "Service role manages facilities"
ON public.verified_facilities FOR ALL
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- Stored Procedure: get_shared_wound_data (Security Definer)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_shared_wound_data(share_token TEXT)
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
    FROM public.doctor_shares
    WHERE token = share_token;

    IF v_wound_id IS NULL OR v_expires_at < NOW() THEN
        RAISE EXCEPTION 'Invalid or expired access token';
    END IF;

    -- Update access metrics
    UPDATE public.doctor_shares
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
    FROM public.wound_entries we
    JOIN public.wounds w ON w.id = we.wound_id
    WHERE we.wound_id = v_wound_id
    ORDER BY we.entry_date DESC;
END;
$$;

-- ==============================================================================
-- Seed Data: Demo Profiles, Wounds, Entries & Facilities
-- ==============================================================================

-- 1. Create auth users for demo profiles if they do not already exist
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
)
VALUES 
    (
        '00000000-0000-4000-a000-000000000001',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'patient@healtrack.ai',
        crypt('HealTrackDemo123!', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Rajesh Sharma"}',
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-4000-a000-000000000002',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'doctor@healtrack.ai',
        crypt('HealTrackDemo123!', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Dr. Priya Sundaram"}',
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-4000-a000-000000000003',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'caregiver@healtrack.ai',
        crypt('HealTrackDemo123!', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Ananya Sharma"}',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Demo Profiles
INSERT INTO public.profiles (id, role, full_name, phone_number, preferred_language, date_of_birth, created_at, updated_at)
VALUES 
    ('00000000-0000-4000-a000-000000000001', 'patient', 'Rajesh Sharma', '+91 98765 43210', 'en', '1974-06-15', NOW() - INTERVAL '30 days', NOW()),
    ('00000000-0000-4000-a000-000000000002', 'doctor', 'Dr. Priya Sundaram', '+91 98765 43211', 'en', '1981-11-20', NOW() - INTERVAL '60 days', NOW()),
    ('00000000-0000-4000-a000-000000000003', 'caregiver', 'Ananya Sharma', '+91 98765 43212', 'en', '1998-03-10', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 3. Seed Clinical Wounds
INSERT INTO public.wounds (id, patient_id, wound_name, anatomical_location, wound_type, initial_onset_date, baseline_notes, is_active, created_at, updated_at)
VALUES 
    (
        '00000000-0000-4000-a000-000000000011',
        '00000000-0000-4000-a000-000000000001',
        'Left Ankle Surgical Incision',
        'Left Lateral Malleolus (Ankle)',
        'Post-Surgical Incision',
        (CURRENT_DATE - INTERVAL '14 days')::date,
        'ORIF procedure for bimalleolar fracture. Suture removal done 4 days ago.',
        TRUE,
        NOW() - INTERVAL '14 days',
        NOW()
    ),
    (
        '00000000-0000-4000-a000-000000000012',
        '00000000-0000-4000-a000-000000000001',
        'Right Plantar Forefoot Ulcer',
        'Right 1st Metatarsal Head (Plantar)',
        'Diabetic Foot Ulcer (DFU)',
        (CURRENT_DATE - INTERVAL '45 days')::date,
        'Neuropathic diabetic ulcer, undergoing offloading therapy.',
        TRUE,
        NOW() - INTERVAL '45 days',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Longitudinal Wound Entries
INSERT INTO public.wound_entries (
    id, wound_id, patient_id, image_url, thumbnail_url,
    raw_voice_transcript, recorded_language, pain_score, exudate_level, exudate_type, odor_level,
    periwound_condition, systemic_symptoms, patient_notes,
    ai_risk_level, ai_risk_reasoning, ai_change_detection_summary,
    ai_granulation_percentage, ai_slough_percentage, ai_necrosis_percentage,
    ai_care_tips, ai_risks_if_neglected, ai_recommended_specialties,
    is_emergency_escalation, entry_date, created_at
)
VALUES 
    (
        '00000000-0000-4000-a000-000000000101',
        '00000000-0000-4000-a000-000000000011',
        '00000000-0000-4000-a000-000000000001',
        '/samples/ankle_wound_day1.webp',
        '/samples/ankle_wound_day1.webp',
        'Mild redness around the stitches, feeling tight but pain is tolerable around 4 out of 10.',
        'en',
        4,
        'scant',
        'serosanguinous',
        'none',
        ARRAY['Erythematous (Red)'],
        ARRAY[]::TEXT[],
        'Baseline check post suture removal. Dressing changed with sterile gauze.',
        'monitor',
        'Mild periwound erythema post suture removal. Controlled pain and minimal serosanguinous exudate.',
        'Baseline initial capture. Moderate erythema localized to suture line.',
        45.0,
        15.0,
        0.0,
        ARRAY['Maintain dry sterile non-adherent dressing.', 'Avoid weight bearing directly on ankle.', 'Keep elevated during rest periods.'],
        ARRAY['Risk of bacterial colonization if skin moisture builds up.', 'Superficial wound edge dehiscence.'],
        ARRAY['General Surgery', 'Orthopedic Surgery'],
        FALSE,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    ),
    (
        '00000000-0000-4000-a000-000000000102',
        '00000000-0000-4000-a000-000000000011',
        '00000000-0000-4000-a000-000000000001',
        '/samples/ankle_wound_day7.webp',
        '/samples/ankle_wound_day7.webp',
        'Pain is much better now, around 2 out of 10. Redness has faded and incision is closing nicely.',
        'en',
        2,
        'none',
        'none',
        'none',
        ARRAY['Intact'],
        ARRAY[]::TEXT[],
        'Healing well, no drainage seen on morning dressing change.',
        'stable',
        'Marked clinical improvement: erythema resolved, incision margin epithelized, no exudate or odor.',
        'Epithelial migration visible across 85% of incision. Significant reduction in perimeter redness.',
        85.0,
        5.0,
        0.0,
        ARRAY['Continue gentle cleansing with normal saline.', 'Apply thin silicone barrier or protective bandage.', 'Gradual range-of-motion ankle exercises.'],
        ARRAY['Avoid premature vigorous friction or soaking in water.'],
        ARRAY['General Surgery'],
        FALSE,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Initial Doctor Share Token
INSERT INTO public.doctor_shares (
    id, wound_id, patient_id, token, expires_at, view_count, created_at
)
VALUES (
    '00000000-0000-4000-a000-000000000201',
    '00000000-0000-4000-a000-000000000011',
    '00000000-0000-4000-a000-000000000001',
    'healtrack-demo-share-2026',
    NOW() + INTERVAL '7 days',
    1,
    NOW()
)
ON CONFLICT (token) DO UPDATE SET
    expires_at = NOW() + INTERVAL '7 days';

-- 6. Seed Accredited Facilities
INSERT INTO public.verified_facilities (
    id, google_place_id, name, formatted_address, latitude, longitude, phone_number, rating, user_ratings_total, is_emergency_capable, supported_specialties
)
VALUES 
    (
        uuid_generate_v4(),
        'fac-apollo-001',
        'Apollo Hospital & 24/7 Trauma Emergency Center',
        'Jubilee Hills, Road No 72, Film Nagar, Hyderabad, Telangana 500033',
        17.4156,
        78.4124,
        '+91 40 2360 7777',
        4.8,
        12480,
        TRUE,
        ARRAY['Emergency Medicine', 'Vascular Surgery', 'Plastic & Reconstructive Surgery', 'Wound Care']
    ),
    (
        uuid_generate_v4(),
        'fac-kims-002',
        'KIMS Hospitals — Comprehensive Vascular & Diabetic Foot Center',
        '1-8-31/1, Minister Rd, Begumpet, Secunderabad, Telangana 500003',
        17.4412,
        78.4891,
        '+91 40 4488 5000',
        4.6,
        8930,
        TRUE,
        ARRAY['Vascular Surgery', 'Diabetology / Endocrinology', 'Wound Care / Hyperbaric']
    )
ON CONFLICT (google_place_id) DO NOTHING;
