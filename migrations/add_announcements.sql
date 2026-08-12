-- Announcements board for faculty → students
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_student_select"
  ON announcements FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "announcements_faculty_insert"
  ON announcements FOR INSERT
  WITH CHECK (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "announcements_faculty_delete"
  ON announcements FOR DELETE
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
