-- Migration: Auto-approve all existing users
-- This migration approves all users that are currently pending approval
-- After this, all new users will be auto-approved on registration

-- Update all users to approved status
UPDATE "users"
SET
  "approved" = true,
  "updated_at" = NOW()
WHERE "approved" = false;

-- Verification query
-- SELECT id, email, name, approved, created_at
-- FROM "users"
-- ORDER BY created_at DESC;
