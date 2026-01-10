-- ============================================================================
-- MIGRATION: Add Password Reset Fields to Users Table
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Add reset_token and reset_token_expiry columns to users table
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "reset_token" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "reset_token_expiry" TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS "idx_users_reset_token" ON "users"("reset_token");

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
