-- Migration: Add posts and post_likes tables
-- Execute this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "posts" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "profile_id" TEXT NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "content"    TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "post_likes" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "post_id"    TEXT NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "profile_id" TEXT NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "post_likes_post_id_profile_id_key" UNIQUE ("post_id", "profile_id")
);

CREATE INDEX IF NOT EXISTS "posts_profile_id_idx" ON "posts"("profile_id");
CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "post_likes_post_id_idx" ON "post_likes"("post_id");
