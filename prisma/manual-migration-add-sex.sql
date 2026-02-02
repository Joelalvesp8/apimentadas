-- Migration: Add sex field to profiles table
-- Execute this in your Supabase SQL Editor

-- Add sex column to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "sex" TEXT;

-- Optional: Add comment to document the field
COMMENT ON COLUMN "profiles"."sex" IS 'User sex: male or female';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'sex';
