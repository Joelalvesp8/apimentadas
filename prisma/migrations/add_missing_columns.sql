-- Migration: Add columns that exist in schema.prisma but were never migrated
-- Safe to run multiple times (uses IF NOT EXISTS guards)
-- Apply this in the Supabase SQL Editor

-- 1. Add is_system_user to users table
--    Used to hide system/bot accounts from public explore queries
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_system_user" BOOLEAN NOT NULL DEFAULT false;

-- 2. Add current_turn_profile_id to game_sessions
--    Tracks whose turn it is in local mode sessions
ALTER TABLE "game_sessions"
ADD COLUMN IF NOT EXISTS "current_turn_profile_id" TEXT;
