-- Migration: Tasks 1-11 schema changes
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. Add is_system_user to users (already may exist - safe)
-- ============================================================
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_system_user" BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- 2. Add skips_used and max_skips to game_sessions
-- ============================================================
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "skips_used" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "max_skips" INTEGER NOT NULL DEFAULT 3;

-- ============================================================
-- 3. Create post_comments table
-- ============================================================
CREATE TABLE IF NOT EXISTS "post_comments" (
  "id"         TEXT NOT NULL,
  "post_id"    TEXT NOT NULL,
  "user_id"    TEXT NOT NULL,
  "content"    TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "post_comments_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
  CONSTRAINT "post_comments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "post_comments_post_id_idx" ON "post_comments"("post_id");

-- ============================================================
-- 4. Create notifications table
-- ============================================================
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"         TEXT NOT NULL,
  "user_id"    TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "message"    TEXT NOT NULL,
  "read"       BOOLEAN NOT NULL DEFAULT FALSE,
  "data"       JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("user_id", "read");
