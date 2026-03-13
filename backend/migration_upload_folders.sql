-- Migration: Create dedicated tables for "My Uploads" folder organization
-- These are SEPARATE from saved_folders / saved_papers which are used by the Bookmarks feature.
-- Run this in your Supabase SQL editor.

-- Folders created by users to organize their uploaded PYQs
CREATE TABLE IF NOT EXISTS upload_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES students(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Junction table: which uploaded PYQs belong to which upload folder
CREATE TABLE IF NOT EXISTS upload_folder_papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  folder_id UUID REFERENCES upload_folders(id) ON DELETE CASCADE,
  pyq_id UUID REFERENCES pyqs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(folder_id, pyq_id)
);
