-- Índices de performance adicionados ao schema
-- Execute no Supabase SQL Editor

CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "profiles_user_id_idx" ON "profiles"("user_id");
CREATE INDEX IF NOT EXISTS "profiles_nickname_idx" ON "profiles"("nickname");
CREATE INDEX IF NOT EXISTS "connections_from_id_idx" ON "connections"("from_id");
CREATE INDEX IF NOT EXISTS "connections_to_id_idx" ON "connections"("to_id");
CREATE INDEX IF NOT EXISTS "posts_profile_id_idx" ON "posts"("profile_id");
CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts"("created_at");
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("read");
CREATE INDEX IF NOT EXISTS "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "direct_messages_receiver_id_idx" ON "direct_messages"("receiver_id");
CREATE INDEX IF NOT EXISTS "direct_messages_created_at_idx" ON "direct_messages"("created_at");
CREATE INDEX IF NOT EXISTS "game_sessions_creator_id_idx" ON "game_sessions"("creator_id");
CREATE INDEX IF NOT EXISTS "game_sessions_status_idx" ON "game_sessions"("status");
CREATE INDEX IF NOT EXISTS "game_sessions_mode_idx" ON "game_sessions"("mode");
