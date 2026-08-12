-- Fix RLS policies so faculty workflows work in production.
-- Run in Supabase SQL Editor if you already applied supabase-schema.sql.

-- Faculty can read student profiles (needed for student list, attendance joins)
CREATE POLICY "profiles_faculty_select_students"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'faculty'
    AND role = 'student'
  );

-- Faculty can read attendance records they created (needed for review/edit)
CREATE POLICY "attendance_faculty_select"
  ON attendance FOR SELECT
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- Tighten profile insert — user can only create their own profile
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tighten message insert — sender must be the authenticated user
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
