# Student Hub

A role-based academic portal for students and faculty — marks, attendance, assignments, activities, profile/resume, and marksheets.

**Stack:** Next.js 16 · React 19 · Tailwind CSS 4 · Supabase (Auth, PostgreSQL, Storage)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Get values from [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings → API**.

### 3. Set up the database

In the Supabase **SQL Editor**, run these files in order:

1. `supabase-schema.sql` — core tables, RLS policies, sample subjects
2. `storage-schema.sql` — storage buckets for uploads
3. `migrations/add_student_profile.sql` — extended profile tables
4. `migrations/add_marksheets.sql` — marksheets (if not in main schema)
5. `migrations/fix_faculty_rls_policies.sql` — **required if you ran an older schema**

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  student/     Student pages (dashboard, marks, assignments, …)
  faculty/     Faculty pages (upload marks, attendance, …)
  api/         Backend API routes (auth, student, faculty)
components/    UI, layout, resume preview
hooks/         Data-fetching hooks
services/      API client layer
lib/           Supabase clients, auth context, types
migrations/    Incremental SQL migrations
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Roles

- **Student** — view marks/attendance, assignments, submit activities, build profile & resume
- **Faculty** — upload marks, mark attendance, create assignments, review activities, browse students

Register at `/register` and choose a role. Faculty can assign subjects during signup.
