-- ============================================================
-- Migration: Student Profile System
-- Run this ONCE in your Supabase SQL Editor.
-- Safe to run multiple times (idempotent).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. EXTENDED STUDENT PROFILE ────────────────────────────
-- One row per student (linked to profiles.id)
CREATE TABLE IF NOT EXISTS student_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone           TEXT,
  address         TEXT,
  photo_url       TEXT,           -- profile photo (separate from avatar_url)
  bio             TEXT,
  college_name    TEXT,
  degree          TEXT,           -- e.g. "B.Tech"
  cgpa            NUMERIC(4,2),
  linkedin_url    TEXT,
  github_url      TEXT,
  website_url     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id)
);

-- ── 2. SKILLS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'technical'
              CHECK (category IN ('technical', 'soft')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 3. PROJECTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  tech_stack    TEXT[],           -- array of tech names e.g. {"React","Node.js"}
  project_url   TEXT,
  github_url    TEXT,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 4. EXPERIENCE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_experience (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company       TEXT NOT NULL,
  role          TEXT NOT NULL,
  start_date    DATE,
  end_date      DATE,             -- NULL = current
  description   TEXT,
  is_current    BOOLEAN DEFAULT false,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 5. ACHIEVEMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_achievements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  issuer        TEXT,
  date_awarded  DATE,
  description   TEXT,
  cert_url      TEXT,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 6. ENABLE RLS ──────────────────────────────────────────
ALTER TABLE student_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_experience  ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- ── 7. RLS POLICIES ────────────────────────────────────────

-- student_profiles
DO $$ BEGIN
  CREATE POLICY "sp_select_own" ON student_profiles FOR SELECT
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sp_insert_own" ON student_profiles FOR INSERT
    WITH CHECK (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sp_update_own" ON student_profiles FOR UPDATE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- student_skills
DO $$ BEGIN
  CREATE POLICY "ss_select_own" ON student_skills FOR SELECT
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ss_insert_own" ON student_skills FOR INSERT
    WITH CHECK (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ss_delete_own" ON student_skills FOR DELETE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- student_projects
DO $$ BEGIN
  CREATE POLICY "sproj_select_own" ON student_projects FOR SELECT
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sproj_insert_own" ON student_projects FOR INSERT
    WITH CHECK (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sproj_update_own" ON student_projects FOR UPDATE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sproj_delete_own" ON student_projects FOR DELETE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- student_experience
DO $$ BEGIN
  CREATE POLICY "sexp_select_own" ON student_experience FOR SELECT
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sexp_insert_own" ON student_experience FOR INSERT
    WITH CHECK (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sexp_update_own" ON student_experience FOR UPDATE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sexp_delete_own" ON student_experience FOR DELETE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- student_achievements
DO $$ BEGIN
  CREATE POLICY "sach_select_own" ON student_achievements FOR SELECT
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sach_insert_own" ON student_achievements FOR INSERT
    WITH CHECK (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sach_update_own" ON student_achievements FOR UPDATE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sach_delete_own" ON student_achievements FOR DELETE
    USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 8. STORAGE BUCKET FOR PROFILE PHOTOS ───────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "profile_photos_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profile_photos_auth_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'profile-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profile_photos_auth_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'profile-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
