<<<<<<< HEAD
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
=======
# Student Hub – Full-Stack Academic Management System

A modern full-stack academic management platform designed to streamline interactions between students and faculty through secure, role-based workflows and real-time academic tracking.

---

## System Overview

Student Hub provides a unified platform for managing:

- Attendance tracking  
- Assignment submission and grading  
- Academic performance monitoring  
- Extracurricular activity logging  
- Resume generation  

The system enforces strict **role-based access control (RBAC)** and **database-level security (RLS)** to ensure data privacy and integrity.

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React 19
- TypeScript

### UI & Styling
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Backend & Database
- Supabase (PostgreSQL)
- Supabase SSR Authentication
- Row Level Security (RLS)

### Storage
- Supabase Buckets (file uploads)

---

## Key Features

- Role-based portals for Students and Faculty  
- Secure data access using Row Level Security (RLS)  
- Assignment creation, submission, and grading workflow  
- Attendance and marks management system  
- Extracurricular activity tracking with approval system  
- Resume generator with dynamic data rendering  

---

## Application Architecture

### Faculty Workflow
- Manage subjects and student data  
- Mark attendance and upload grades  
- Create assignments and evaluate submissions  
- Review extracurricular activities  

### Student Workflow
- View attendance and academic performance  
- Submit assignments and track deadlines  
- Upload and manage academic documents  
- Generate resume from academic data  

---

## System Design Highlights

- Middleware-based route protection using Next.js  
- Secure session handling via SSR authentication  
- Database-level access control via RLS policies  
- Modular service-based architecture for API interaction  

---

## Future Enhancements

- Real-time notifications  
- AI-based performance insights  
- Mobile application support  

---

## Key Learning Outcomes

- Designing secure full-stack systems  
- Implementing RBAC and database-level security  
- Managing complex relational data workflows  
- Building scalable modern web applications  
>>>>>>> d6bab6c6543768a54d575e47cbfd0179efe8d534
