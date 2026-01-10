-- ============================================================================
-- MIGRATION: Add Waitlist System and User Approval
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Add approved column to users table
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false;

-- 2. Approve admin user automatically
UPDATE "users"
SET "approved" = true
WHERE "email" = 'joelalvesp8@gmail.com';

-- 3. Create waitlist table
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Create index for faster email lookups in waitlist
CREATE INDEX IF NOT EXISTS "idx_waitlist_email" ON "waitlist"("email");
CREATE INDEX IF NOT EXISTS "idx_waitlist_status" ON "waitlist"("status");

-- 5. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_waitlist_updated_at ON "waitlist";
CREATE TRIGGER trigger_update_waitlist_updated_at
  BEFORE UPDATE ON "waitlist"
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_updated_at();

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
