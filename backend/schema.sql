-- Setup UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing student registrations
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  branch TEXT,
  semester TEXT,
  password_hash TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table for storing Previous Year Question Papers (PYQs)
CREATE TABLE IF NOT EXISTS pyqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  semester TEXT,
  resource_type TEXT NOT NULL,
  faculty_name TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES students(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table for tracking recently viewed PYQs by users
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES students(id) ON DELETE CASCADE,
  pyq_id UUID REFERENCES pyqs(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, pyq_id) -- Prevent duplicate entries for the same paper, we update viewed_at instead
);
