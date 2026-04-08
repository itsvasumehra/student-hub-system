-- ============================================================
-- Student Hub — Storage Buckets Setup
-- Run this in your Supabase SQL Editor to create the required 
-- public buckets for file uploads.
-- ============================================================

-- 1. Create the Storage Buckets (Public)
insert into storage.buckets (id, name, public) 
values 
  ('assignments', 'assignments', true),
  ('activity-proofs', 'activity-proofs', true),
  ('avatars', 'avatars', true),
  ('marksheets', 'marksheets', true)
on conflict (id) do nothing;

-- 2. Configure Storage Object Policies

-- Allow public read access to all files in these buckets
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id in ('assignments', 'activity-proofs', 'avatars', 'marksheets') );

-- Allow authenticated users to upload files to these buckets
create policy "Authenticated users can upload" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id in ('assignments', 'activity-proofs', 'avatars', 'marksheets') );

-- Allow authenticated users to update their own files
create policy "Users can update their own files" 
on storage.objects for update 
to authenticated 
using ( auth.uid() = owner );

-- Allow authenticated users to delete their own files
create policy "Users can delete their own files" 
on storage.objects for delete 
to authenticated 
using ( auth.uid() = owner );
