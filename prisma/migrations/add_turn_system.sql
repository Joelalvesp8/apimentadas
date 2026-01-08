-- ============================================================================
-- MIGRATION: Add Turn System to Online Rounds
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Add currentTurnProfileId column to online_rounds table
ALTER TABLE "online_rounds"
ADD COLUMN IF NOT EXISTS "current_turn_profile_id" TEXT;

-- Update existing rounds to set a default turn (first participant)
-- This is for backward compatibility with existing sessions
UPDATE "online_rounds"
SET "current_turn_profile_id" = (
  SELECT sp."profile_id"
  FROM "session_participants" sp
  WHERE sp."session_id" = "online_rounds"."session_id"
  ORDER BY sp."joined_at" ASC
  LIMIT 1
)
WHERE "current_turn_profile_id" IS NULL;

-- Now make the column NOT NULL since all existing rows have been updated
ALTER TABLE "online_rounds"
ALTER COLUMN "current_turn_profile_id" SET NOT NULL;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
