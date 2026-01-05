-- CreateTable: connections
CREATE TABLE IF NOT EXISTS "connections" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: user_ratings
CREATE TABLE IF NOT EXISTS "user_ratings" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "session_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: session_invitations
CREATE TABLE IF NOT EXISTS "session_invitations" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "session_id" TEXT,
    "session_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on connections (only if doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'connections_from_id_to_id_key') THEN
        CREATE UNIQUE INDEX "connections_from_id_to_id_key" ON "connections"("from_id", "to_id");
    END IF;
END $$;

-- CreateIndex: Unique constraint on user_ratings (only if doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_ratings_from_id_to_id_session_id_key') THEN
        CREATE UNIQUE INDEX "user_ratings_from_id_to_id_session_id_key" ON "user_ratings"("from_id", "to_id", "session_id");
    END IF;
END $$;

-- AddForeignKey: connections (only if doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'connections_from_id_fkey'
    ) THEN
        ALTER TABLE "connections" ADD CONSTRAINT "connections_from_id_fkey"
        FOREIGN KEY ("from_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'connections_to_id_fkey'
    ) THEN
        ALTER TABLE "connections" ADD CONSTRAINT "connections_to_id_fkey"
        FOREIGN KEY ("to_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: user_ratings (only if doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_ratings_from_id_fkey'
    ) THEN
        ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_from_id_fkey"
        FOREIGN KEY ("from_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_ratings_to_id_fkey'
    ) THEN
        ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_to_id_fkey"
        FOREIGN KEY ("to_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: session_invitations (only if doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'session_invitations_sender_id_fkey'
    ) THEN
        ALTER TABLE "session_invitations" ADD CONSTRAINT "session_invitations_sender_id_fkey"
        FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'session_invitations_receiver_id_fkey'
    ) THEN
        ALTER TABLE "session_invitations" ADD CONSTRAINT "session_invitations_receiver_id_fkey"
        FOREIGN KEY ("receiver_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
