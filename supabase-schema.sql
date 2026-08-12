-- ============================================================
-- Student Hub — Complete Schema + RLS
-- Run this entire file in Supabase SQL Editor in one shot.
-- ============================================================

-- ── 1. TABLES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('student', 'faculty')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  department    TEXT NOT NULL,
  roll_number   TEXT,
  employee_id   TEXT,
  semester      INT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  department  TEXT NOT NULL,
  semester    INT NOT NULL,
  credits     INT DEFAULT 3,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculty_subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(faculty_id, subject_id)
);

CREATE TABLE IF NOT EXISTS marks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id  UUID NOT NULL REFERENCES profiles(id),
  exam_type   TEXT NOT NULL CHECK (exam_type IN ('internal1','internal2','external','practical')),
  score       NUMERIC(5,2) NOT NULL,
  max_score   NUMERIC(5,2) NOT NULL DEFAULT 100,
  remarks     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subject_id, exam_type)
);

CREATE TABLE IF NOT EXISTS assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id  UUID NOT NULL REFERENCES profiles(id),
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE NOT NULL,
  max_marks   NUMERIC(5,2) DEFAULT 10,
  file_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url        TEXT,
  notes           TEXT,
  marks_obtained  NUMERIC(5,2),
  status          TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','graded','late')),
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id  UUID NOT NULL REFERENCES profiles(id),
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subject_id, date)
);

CREATE TABLE IF NOT EXISTS activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL
                  CHECK (category IN ('sports','cultural','technical','social','other')),
  description     TEXT,
  date            DATE NOT NULL,
  proof_url       TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending'
                  CHECK (approval_status IN ('pending','approved','rejected')),
  approved_by     UUID REFERENCES profiles(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marksheets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,       -- e.g. "Semester 1"
  file_url      TEXT NOT NULL,
  file_name     TEXT,
  semester      INT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  sent_at     TIMESTAMPTZ DEFAULT now()
);


-- ── 2. RLS ENABLE ───────────────────────────────────────────
-- (Must be done AFTER tables are created)

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE marksheets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;


-- ── 3. RLS POLICIES ─────────────────────────────────────────
-- NOTE: All policies use the subquery pattern:
--   (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
-- This prevents infinite recursion.

-- profiles
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_faculty_select_students"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'faculty'
    AND role = 'student'
  );
CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- subjects
CREATE POLICY "subjects_select_authenticated"
  ON subjects FOR SELECT TO authenticated USING (true);

-- faculty_subjects
CREATE POLICY "faculty_subjects_select"
  ON faculty_subjects FOR SELECT
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- marks
CREATE POLICY "marks_student_select"
  ON marks FOR SELECT
  USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "marks_faculty_select"
  ON marks FOR SELECT
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "marks_faculty_insert"
  ON marks FOR INSERT
  WITH CHECK (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "marks_faculty_update"
  ON marks FOR UPDATE
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- assignments
CREATE POLICY "assignments_select_authenticated"
  ON assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "assignments_faculty_insert"
  ON assignments FOR INSERT
  WITH CHECK (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "assignments_faculty_update"
  ON assignments FOR UPDATE
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- submissions
CREATE POLICY "submissions_student_select"
  ON submissions FOR SELECT
  USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "submissions_student_insert"
  ON submissions FOR INSERT
  WITH CHECK (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "submissions_faculty_select"
  ON submissions FOR SELECT
  USING (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  );
CREATE POLICY "submissions_faculty_update"
  ON submissions FOR UPDATE
  USING (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- attendance
CREATE POLICY "attendance_student_select"
  ON attendance FOR SELECT
  USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "attendance_faculty_insert"
  ON attendance FOR INSERT
  WITH CHECK (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "attendance_faculty_update"
  ON attendance FOR UPDATE
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "attendance_faculty_select"
  ON attendance FOR SELECT
  USING (
    faculty_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- activities
CREATE POLICY "activities_student_select"
  ON activities FOR SELECT
  USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "activities_student_insert"
  ON activities FOR INSERT
  WITH CHECK (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "activities_faculty_select"
  ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "activities_faculty_update"
  ON activities FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'faculty'
  );

-- marksheets
CREATE POLICY "marksheets_student_select"
  ON marksheets FOR SELECT
  USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "marksheets_student_insert"
  ON marksheets FOR INSERT
  WITH CHECK (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "marksheets_student_delete"
  ON marksheets FOR DELETE
  USING (
    student_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- messages
CREATE POLICY "messages_select"
  ON messages FOR SELECT
  USING (
    sender_id   = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    OR
    receiver_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "messages_insert"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );


-- ── 4. SEED SUBJECTS (Sample data) ──────────────────────────

INSERT INTO subjects (code, name, department, semester) VALUES
  ('CS601', 'Database Management Systems', 'Computer Science', 6),
  ('CS602', 'Computer Networks', 'Computer Science', 6),
  ('CS603', 'Software Engineering', 'Computer Science', 6),
  ('CS604', 'Web Technologies', 'Computer Science', 6),
  ('CS501', 'Operating Systems', 'Computer Science', 5),
  ('CS502', 'Theory of Computation', 'Computer Science', 5),
  ('IT601', 'Human Computer Interaction', 'Information Technology', 6),
  ('IT602', 'Modern Cryptography', 'Information Technology', 6),
  ('IT603', 'Data warehousing and Data Mining', 'Information Technology', 6),
  ('IT604', 'Mobile Computing', 'Information Technology', 6),
  ('IT605', 'Information Coding Theory', 'Information Technology', 6),
  ('IT606', 'Cyber Security', 'Information Technology', 6)
ON CONFLICT (code) DO NOTHING;
