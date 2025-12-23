-- Add delivery address fields to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "delivery_address" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "delivery_city" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "delivery_state" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "delivery_zip_code" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "delivery_complement" TEXT;

-- Add delivery address fields to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_state" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_zip_code" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_complement" TEXT;

-- Remove default values after adding columns
ALTER TABLE "orders" ALTER COLUMN "delivery_address" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "delivery_city" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "delivery_state" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "delivery_zip_code" DROP DEFAULT;
