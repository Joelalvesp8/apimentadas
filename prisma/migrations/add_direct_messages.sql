-- Migration: Add direct_messages table
-- Execute this in your Supabase SQL Editor

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS "direct_messages" (
  "id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "receiver_id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_fkey"
  FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_receiver_id_fkey"
  FOREIGN KEY ("receiver_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "direct_messages_receiver_id_idx" ON "direct_messages"("receiver_id");
CREATE INDEX IF NOT EXISTS "direct_messages_read_idx" ON "direct_messages"("read");

-- Verify the table was created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'direct_messages'
ORDER BY ordinal_position;
