-- ============================================================================
-- MIGRATION: Sistema de Turnos
-- ============================================================================
-- Adiciona sistema de turnos alternados ao jogo
-- Execute este script no Supabase SQL Editor
-- ============================================================================

-- 1. Adicionar coluna de turno atual na tabela game_sessions
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS current_turn_profile_id TEXT;

-- 2. Adicionar colunas na tabela played_cards para controle de turnos
ALTER TABLE played_cards
ADD COLUMN IF NOT EXISTS picked_by_profile_id TEXT,
ADD COLUMN IF NOT EXISTS answered_by_profile_id TEXT,
ADD COLUMN IF NOT EXISTS qualitative_rating TEXT;

-- 3. Para sessões ativas existentes, definir o turno para o primeiro participante
UPDATE game_sessions gs
SET current_turn_profile_id = (
  SELECT sp.profile_id
  FROM session_participants sp
  WHERE sp.session_id = gs.id
  ORDER BY sp.joined_at ASC
  LIMIT 1
)
WHERE gs.status = 'active'
AND gs.current_turn_profile_id IS NULL;

-- 4. Para played_cards existentes sem picked_by, atribuir ao criador da sessão
UPDATE played_cards pc
SET picked_by_profile_id = COALESCE(
  pc.picked_by_profile_id,
  (
    SELECT p.id
    FROM game_sessions gs
    JOIN users u ON u.id = gs.creator_id
    JOIN profiles p ON p.user_id = u.id
    WHERE gs.id = pc.session_id
    LIMIT 1
  )
)
WHERE picked_by_profile_id IS NULL;

-- 5. Adicionar constraint check para qualitative_rating
ALTER TABLE played_cards
DROP CONSTRAINT IF EXISTS check_qualitative_rating;

ALTER TABLE played_cards
ADD CONSTRAINT check_qualitative_rating
CHECK (qualitative_rating IS NULL OR qualitative_rating IN ('ruim', 'satisfatoria', 'excelente'));

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_current_turn
ON game_sessions(current_turn_profile_id);

CREATE INDEX IF NOT EXISTS idx_played_cards_picked_by
ON played_cards(picked_by_profile_id);

CREATE INDEX IF NOT EXISTS idx_played_cards_answered_by
ON played_cards(answered_by_profile_id);

-- ============================================================================
-- MIGRATION COMPLETA! ✅
-- ============================================================================
-- Próximos passos:
-- 1. Fazer deploy do código atualizado
-- 2. Testar o sistema de turnos
-- ============================================================================
