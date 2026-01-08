-- ============================================================================
-- MIGRATION: Add Turn System to Online Rounds (V2 - Fixed)
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Add currentTurnProfileId column (allow NULL initially)
ALTER TABLE "online_rounds"
ADD COLUMN IF NOT EXISTS "current_turn_profile_id" TEXT;

-- 2. Delete orphaned rounds (rounds without participants or sessions)
DELETE FROM "online_rounds"
WHERE "session_id" NOT IN (SELECT "id" FROM "game_sessions");

DELETE FROM "online_rounds"
WHERE "session_id" NOT IN (
  SELECT DISTINCT "session_id" FROM "session_participants"
);

-- 3. Update existing rounds to set turn based on round number
-- This ensures proper turn assignment for existing games
UPDATE "online_rounds" AS r
SET "current_turn_profile_id" = (
  SELECT sp."profile_id"
  FROM "session_participants" sp
  WHERE sp."session_id" = r."session_id"
  ORDER BY sp."joined_at" ASC
  LIMIT 1 OFFSET ((r."round_number" - 1) % (
    SELECT COUNT(*) FROM "session_participants" WHERE "session_id" = r."session_id"
  ))
)
WHERE "current_turn_profile_id" IS NULL;

-- 4. Delete any rounds that still have NULL (safety cleanup)
DELETE FROM "online_rounds"
WHERE "current_turn_profile_id" IS NULL;

-- 5. Now make the column NOT NULL
ALTER TABLE "online_rounds"
ALTER COLUMN "current_turn_profile_id" SET NOT NULL;

-- 6. Verify the migration
SELECT
  COUNT(*) as total_rounds,
  COUNT(DISTINCT "current_turn_profile_id") as unique_turn_profiles,
  COUNT(*) FILTER (WHERE "current_turn_profile_id" IS NOT NULL) as rounds_with_turn
FROM "online_rounds";

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
