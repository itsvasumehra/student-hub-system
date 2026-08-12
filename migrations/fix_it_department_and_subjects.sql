-- Fix IT department mismatch and ensure IT subjects exist.
-- Run in Supabase SQL Editor if assignments don't show for IT students.

-- 1. Normalize profile departments (IT → Information Technology)
UPDATE profiles
SET department = 'Information Technology'
WHERE LOWER(TRIM(department)) IN ('it', 'information technology');

-- 2. Normalize subject departments
UPDATE subjects
SET department = 'Information Technology'
WHERE LOWER(TRIM(department)) = 'it';

-- 3. Seed IT semester-6 subjects if missing
INSERT INTO subjects (code, name, department, semester) VALUES
  ('IT601', 'Human Computer Interaction', 'Information Technology', 6),
  ('IT602', 'Modern Cryptography', 'Information Technology', 6),
  ('IT603', 'Data warehousing and Data Mining', 'Information Technology', 6),
  ('IT604', 'Mobile Computing', 'Information Technology', 6),
  ('IT605', 'Information Coding Theory', 'Information Technology', 6),
  ('IT606', 'Cyber Security', 'Information Technology', 6)
ON CONFLICT (code) DO UPDATE
SET department = EXCLUDED.department,
    name = EXCLUDED.name,
    semester = EXCLUDED.semester;

-- 4. Re-link faculty to IT604 if they registered with fallback IDs
-- (Run only if Sunil's faculty_subjects row is missing for IT604)
-- Replace FACULTY_EMAIL with Sunil's email:
--
-- INSERT INTO faculty_subjects (faculty_id, subject_id)
-- SELECT p.id, s.id
-- FROM profiles p, subjects s
-- WHERE p.email = 'sunil@example.com' AND s.code = 'IT604'
-- ON CONFLICT (faculty_id, subject_id) DO NOTHING;
