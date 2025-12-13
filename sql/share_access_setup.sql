-- ==========================================
-- SHARE ACCESS FEATURE - DATABASE SETUP
-- ==========================================
-- This allows users to share their database with others via email
-- Similar to Google Drive sharing

-- Step 1: Create collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collaborator_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  -- Prevent duplicate collaborators for same owner
  UNIQUE(owner_id, collaborator_email)
);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_collaborators_owner ON collaborators(owner_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_email ON collaborators(collaborator_email);

-- Step 3: Enable RLS on collaborators table
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies for collaborators table

-- Allow users to see their own collaborators
CREATE POLICY "Users can view their own collaborators"
  ON collaborators FOR SELECT
  USING (auth.uid() = owner_id);

-- Allow users to add collaborators to their data
CREATE POLICY "Users can add collaborators"
  ON collaborators FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to remove their own collaborators
CREATE POLICY "Users can remove their own collaborators"
  ON collaborators FOR DELETE
  USING (auth.uid() = owner_id);

-- Step 5: Helper function to check if user is owner or collaborator
CREATE OR REPLACE FUNCTION is_owner_or_collaborator(
  data_owner_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Get current user ID and email
  current_user_id := auth.uid();
  
  -- If no user is logged in, return false
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if current user is the owner
  IF current_user_id = data_owner_id THEN
    RETURN TRUE;
  END IF;
  
  -- Get current user's email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;
  
  -- Check if current user's email is in collaborators for this owner
  RETURN EXISTS (
    SELECT 1
    FROM collaborators
    WHERE owner_id = data_owner_id
      AND LOWER(collaborator_email) = LOWER(current_user_email)
  );
END;
$$;

-- ==========================================
-- IMPORTANT: Update RLS Policies on Your Monthly Tables
-- ==========================================
-- You need to update the RLS policies on each monthly table
-- (December_2025, November_2025, etc.) to use this new function

-- Example for December_2025:
-- Replace "December_2025" with your actual table name

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own data" ON "December_2025";
DROP POLICY IF EXISTS "Users can insert their own data" ON "December_2025";
DROP POLICY IF EXISTS "Users can update their own data" ON "December_2025";
DROP POLICY IF EXISTS "Users can delete their own data" ON "December_2025";

-- Create new policies that support collaborators
CREATE POLICY "Users can view own or shared data"
  ON "December_2025" FOR SELECT
  USING (is_owner_or_collaborator(user_id));

CREATE POLICY "Users can insert own data"
  ON "December_2025" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or shared data"
  ON "December_2025" FOR UPDATE
  USING (is_owner_or_collaborator(user_id))
  WITH CHECK (is_owner_or_collaborator(user_id));

CREATE POLICY "Users can delete own or shared data"
  ON "December_2025" FOR DELETE
  USING (is_owner_or_collaborator(user_id));

-- ==========================================
-- REPEAT FOR ALL YOUR MONTHLY TABLES
-- ==========================================
-- Copy the policy creation above and replace "December_2025" with:
-- - November_2025
-- - October_2025
-- - January_2026
-- etc.

-- Example template:
/*
DROP POLICY IF EXISTS "Users can view their own data" ON "YOUR_TABLE_NAME";
DROP POLICY IF EXISTS "Users can insert their own data" ON "YOUR_TABLE_NAME";
DROP POLICY IF EXISTS "Users can update their own data" ON "YOUR_TABLE_NAME";
DROP POLICY IF EXISTS "Users can delete their own data" ON "YOUR_TABLE_NAME";

CREATE POLICY "Users can view own or shared data"
  ON "YOUR_TABLE_NAME" FOR SELECT
  USING (is_owner_or_collaborator(user_id));

CREATE POLICY "Users can insert own data"
  ON "YOUR_TABLE_NAME" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or shared data"
  ON "YOUR_TABLE_NAME" FOR UPDATE
  USING (is_owner_or_collaborator(user_id))
  WITH CHECK (is_owner_or_collaborator(user_id));

CREATE POLICY "Users can delete own or shared data"
  ON "YOUR_TABLE_NAME" FOR DELETE
  USING (is_owner_or_collaborator(user_id));
*/
