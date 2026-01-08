-- ============================================================================
-- CLEANUP: Remove sessões e rodadas corrompidas
-- Execute ANTES da migration add_turn_system_v2.sql
-- ============================================================================

-- 1. Verificar estado atual
SELECT
  'Total de sessões online' as info,
  COUNT(*) as count
FROM "game_sessions"
WHERE "mode" = 'online'

UNION ALL

SELECT
  'Sessões online sem participantes' as info,
  COUNT(*) as count
FROM "game_sessions" gs
WHERE gs."mode" = 'online'
  AND NOT EXISTS (
    SELECT 1 FROM "session_participants" sp
    WHERE sp."session_id" = gs."id"
  )

UNION ALL

SELECT
  'Rodadas online sem sessão' as info,
  COUNT(*) as count
FROM "online_rounds" r
WHERE NOT EXISTS (
  SELECT 1 FROM "game_sessions" gs
  WHERE gs."id" = r."session_id"
)

UNION ALL

SELECT
  'Rodadas online sem participantes na sessão' as info,
  COUNT(*) as count
FROM "online_rounds" r
WHERE NOT EXISTS (
  SELECT 1 FROM "session_participants" sp
  WHERE sp."session_id" = r."session_id"
);

-- 2. Limpar respostas de rodadas órfãs
DELETE FROM "online_answers"
WHERE "round_id" NOT IN (SELECT "id" FROM "online_rounds");

-- 3. Limpar rodadas de sessões que não existem mais
DELETE FROM "online_rounds"
WHERE "session_id" NOT IN (SELECT "id" FROM "game_sessions");

-- 4. Limpar rodadas de sessões sem participantes
DELETE FROM "online_rounds" r
WHERE NOT EXISTS (
  SELECT 1 FROM "session_participants" sp
  WHERE sp."session_id" = r."session_id"
);

-- 5. Atualizar currentRoundId nas sessões para apontar para rodadas válidas
UPDATE "game_sessions"
SET "current_round_id" = NULL
WHERE "current_round_id" IS NOT NULL
  AND "current_round_id" NOT IN (SELECT "id" FROM "online_rounds");

-- 6. Verificar resultado
SELECT
  'Sessões online após limpeza' as info,
  COUNT(*) as count
FROM "game_sessions"
WHERE "mode" = 'online'

UNION ALL

SELECT
  'Rodadas online após limpeza' as info,
  COUNT(*) as count
FROM "online_rounds"

UNION ALL

SELECT
  'Respostas online após limpeza' as info,
  COUNT(*) as count
FROM "online_answers";

-- ============================================================================
-- FIM DO CLEANUP
-- Execute add_turn_system_v2.sql depois deste script
-- ============================================================================
