-- ============================================================
-- Migration: Add marksheets table + storage bucket
-- Run this ONCE against your Supabase project.
-- Safe to run even if other tables/policies already exist.
-- ============================================================

-- 0. Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the marksheets table
CREATE TABLE IF NOT EXISTS marksheets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,       -- e.g. "Semester 1"
  file_url      TEXT NOT NULL,
  file_name     TEXT,
  semester      INT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Fix id default in case the table already exists without one
ALTER TABLE marksheets ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 2. Enable Row Level Security
ALTER TABLE marksheets ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (use DO blocks to skip if already exist)
DO $$ BEGIN
  CREATE POLICY "marksheets_student_select"
    ON marksheets FOR SELECT
    USING (
      student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "marksheets_student_insert"
    ON marksheets FOR INSERT
    WITH CHECK (
      student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "marksheets_student_delete"
    ON marksheets FOR DELETE
    USING (
      student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Storage bucket (idempotent — skips if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('marksheets', 'marksheets', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies (safe DO blocks)
DO $$ BEGIN
  CREATE POLICY "marksheets_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'marksheets');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "marksheets_auth_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'marksheets');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "marksheets_auth_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'marksheets');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
