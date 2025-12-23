-- Migration: Add delivery address fields to profiles table
-- This migration adds the delivery address columns if they don't exist yet

-- Add delivery address fields to profiles table (using IF NOT EXISTS to avoid errors)
DO $$
BEGIN
    -- Add deliveryAddress
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='delivery_address') THEN
        ALTER TABLE "profiles" ADD COLUMN "delivery_address" TEXT;
    END IF;

    -- Add deliveryCity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='delivery_city') THEN
        ALTER TABLE "profiles" ADD COLUMN "delivery_city" TEXT;
    END IF;

    -- Add deliveryState
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='delivery_state') THEN
        ALTER TABLE "profiles" ADD COLUMN "delivery_state" TEXT;
    END IF;

    -- Add deliveryZipCode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='delivery_zip_code') THEN
        ALTER TABLE "profiles" ADD COLUMN "delivery_zip_code" TEXT;
    END IF;

    -- Add deliveryComplement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='delivery_complement') THEN
        ALTER TABLE "profiles" ADD COLUMN "delivery_complement" TEXT;
    END IF;
END $$;

-- Add delivery address fields to orders table (with proper NOT NULL handling)
DO $$
BEGIN
    -- Add deliveryAddress to orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='delivery_address') THEN
        ALTER TABLE "orders" ADD COLUMN "delivery_address" TEXT NOT NULL DEFAULT '';
        ALTER TABLE "orders" ALTER COLUMN "delivery_address" DROP DEFAULT;
    END IF;

    -- Add deliveryCity to orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='delivery_city') THEN
        ALTER TABLE "orders" ADD COLUMN "delivery_city" TEXT NOT NULL DEFAULT '';
        ALTER TABLE "orders" ALTER COLUMN "delivery_city" DROP DEFAULT;
    END IF;

    -- Add deliveryState to orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='delivery_state') THEN
        ALTER TABLE "orders" ADD COLUMN "delivery_state" TEXT NOT NULL DEFAULT '';
        ALTER TABLE "orders" ALTER COLUMN "delivery_state" DROP DEFAULT;
    END IF;

    -- Add deliveryZipCode to orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='delivery_zip_code') THEN
        ALTER TABLE "orders" ADD COLUMN "delivery_zip_code" TEXT NOT NULL DEFAULT '';
        ALTER TABLE "orders" ALTER COLUMN "delivery_zip_code" DROP DEFAULT;
    END IF;

    -- Add deliveryComplement to orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='delivery_complement') THEN
        ALTER TABLE "orders" ADD COLUMN "delivery_complement" TEXT;
    END IF;
END $$;
