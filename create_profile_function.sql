-- Create a function that can be called to create a profile bypassing RLS
-- Run this in your Supabase SQL editor

-- First, make sure the profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '😊',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now create the function
CREATE OR REPLACE FUNCTION create_profile(user_id UUID, user_name TEXT, user_emoji TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, name, emoji)
  VALUES (user_id, user_name, user_emoji)
  ON CONFLICT (id) DO UPDATE
  SET 
    name = user_name,
    emoji = user_emoji,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert user profiles" ON profiles;

-- Create policies
-- 1. Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Allow the system to insert profiles for any user
-- This allows the create_profile function to work since it's SECURITY DEFINER
CREATE POLICY "System can insert user profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true); 