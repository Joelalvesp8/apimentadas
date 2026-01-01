-- AlterTable: Add fields to profiles for social features
ALTER TABLE "profiles" ADD COLUMN "sessions_played" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN "average_rating" DOUBLE PRECISION;
ALTER TABLE "profiles" ADD COLUMN "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Add fields to game_sessions for online mode
ALTER TABLE "game_sessions" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "game_sessions" ADD COLUMN "current_round_id" TEXT;

-- CreateTable: online_rounds
CREATE TABLE "online_rounds" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "online_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable: online_answers
CREATE TABLE "online_answers" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "online_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "online_answers_round_id_profile_id_key" ON "online_answers"("round_id", "profile_id");

-- AddForeignKey
ALTER TABLE "online_rounds" ADD CONSTRAINT "online_rounds_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_rounds" ADD CONSTRAINT "online_rounds_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_answers" ADD CONSTRAINT "online_answers_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "online_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_answers" ADD CONSTRAINT "online_answers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
