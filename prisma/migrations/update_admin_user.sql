-- Migration: Update admin user system
-- Changes joelalvesp8@gmail.com to regular user and creates new admin joelalvesp8@icloud.com
-- Execute this SQL in your Supabase SQL Editor

-- Step 1: Create new admin user if doesn't exist
-- Password hash for: #Formula1
-- Generated with: bcrypt.hash('#Formula1', 10)
INSERT INTO "users" (
  "id",
  "email",
  "name",
  "password",
  "provider",
  "approved",
  "created_at",
  "updated_at"
)
VALUES (
  'admin-' || gen_random_uuid(),
  'joelalvesp8@icloud.com',
  'Admin',
  '$2a$10$sBAyPG/iCYW7J1VKrmAtyud/pXk8lIp/FGnQpX672HJLEAj5gkICS', -- Password: #Formula1
  'credentials',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- Step 2: Ensure joelalvesp8@gmail.com is approved (remains as regular user)
UPDATE "users"
SET "approved" = true
WHERE "email" = 'joelalvesp8@gmail.com';

-- Step 3: Add admin to waitlist as approved (if needed)
INSERT INTO "waitlist" (
  "id",
  "email",
  "status",
  "notes",
  "created_at",
  "updated_at"
)
VALUES (
  'wl-admin-' || gen_random_uuid(),
  'joelalvesp8@icloud.com',
  'approved',
  'Admin account - auto approved',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- Verification queries (run these to check the changes)
-- SELECT * FROM "users" WHERE "email" IN ('joelalvesp8@gmail.com', 'joelalvesp8@icloud.com');
-- SELECT * FROM "waitlist" WHERE "email" IN ('joelalvesp8@gmail.com', 'joelalvesp8@icloud.com');
