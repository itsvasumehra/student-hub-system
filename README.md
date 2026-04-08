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
