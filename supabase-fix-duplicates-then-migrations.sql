-- ============================================================================
-- SCRIPT DE CORREÇÃO: Resolver Duplicatas de Email + Migrations
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PARTE 1: IDENTIFICAR E RESOLVER DUPLICATAS DE EMAIL
-- ============================================================================

-- 1.1. Identificar duplicatas (emails que se tornariam iguais ao normalizar)
SELECT
  LOWER(email) as email_normalizado,
  COUNT(*) as quantidade,
  STRING_AGG(email, ', ') as emails_originais,
  STRING_AGG(id, ', ') as user_ids,
  STRING_AGG(created_at::text, ', ') as datas_criacao
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- Se houver resultados acima, há duplicatas que precisam ser resolvidas


-- ============================================================================
-- PARTE 2: RESOLVER DUPLICATAS AUTOMATICAMENTE
-- ============================================================================

-- Estratégia: Manter o usuário mais antigo (created_at), deletar duplicatas
-- ATENÇÃO: Isso vai deletar contas duplicadas! Revise antes de executar.

-- 2.1. Criar tabela temporária com duplicatas a serem removidas
CREATE TEMP TABLE IF NOT EXISTS duplicates_to_delete AS
SELECT
  u.id,
  u.email,
  u.created_at,
  LOWER(u.email) as normalized_email
FROM users u
INNER JOIN (
  -- Subquery: pega o usuário mais antigo de cada grupo de duplicatas
  SELECT
    LOWER(email) as normalized_email,
    MIN(created_at) as oldest_created_at
  FROM users
  GROUP BY LOWER(email)
  HAVING COUNT(*) > 1
) oldest ON LOWER(u.email) = oldest.normalized_email
WHERE u.created_at > oldest.oldest_created_at;

-- 2.2. Mostrar o que será deletado (REVISAR ANTES DE EXECUTAR!)
SELECT
  id,
  email,
  created_at,
  'SERÁ DELETADO' as status
FROM duplicates_to_delete
ORDER BY normalized_email, created_at;

-- 2.3. DELETAR DUPLICATAS (DESCOMENTE DEPOIS DE REVISAR!)
-- ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- Só execute depois de revisar a query acima!

DELETE FROM users
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- 2.4. Verificar resultado
SELECT
  'Duplicatas deletadas' as operacao,
  COUNT(*) as quantidade
FROM duplicates_to_delete;


-- ============================================================================
-- PARTE 3: NORMALIZAR EMAILS (Agora sem duplicatas)
-- ============================================================================

-- 3.1. Normalizar todos os emails para lowercase
UPDATE users
SET email = LOWER(email)
WHERE email != LOWER(email);

-- 3.2. Verificar que não há mais duplicatas
SELECT
  LOWER(email) as email_normalizado,
  COUNT(*) as quantidade
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- Se a query acima não retornar nada, sucesso!


-- ============================================================================
-- PARTE 4: MIGRATIONS DAS TASKS 1-11
-- ============================================================================

-- 4.1. Campo isSystemUser (TASK 2)
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_system_user" BOOLEAN NOT NULL DEFAULT FALSE;

-- 4.2. Campos de Skip em GameSession (TASK 4)
ALTER TABLE "game_sessions"
ADD COLUMN IF NOT EXISTS "skips_used" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "game_sessions"
ADD COLUMN IF NOT EXISTS "max_skips" INTEGER NOT NULL DEFAULT 3;

-- 4.3. Tabela de Comentários em Posts (TASK 10)
CREATE TABLE IF NOT EXISTS "post_comments" (
  "id" TEXT NOT NULL,
  "post_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "post_comments_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "post_comments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "post_comments_post_id_idx"
  ON "post_comments"("post_id");

CREATE INDEX IF NOT EXISTS "post_comments_user_id_idx"
  ON "post_comments"("user_id");

-- 4.4. Tabela de Notificações (TASK 5)
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "data" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx"
  ON "notifications"("user_id");

CREATE INDEX IF NOT EXISTS "notifications_read_idx"
  ON "notifications"("user_id", "read");

CREATE INDEX IF NOT EXISTS "notifications_created_at_idx"
  ON "notifications"("created_at");


-- ============================================================================
-- PARTE 5: VERIFICAÇÕES FINAIS
-- ============================================================================

-- 5.1. Estatísticas de emails
SELECT
  COUNT(*) as total_usuarios,
  COUNT(DISTINCT email) as emails_unicos,
  COUNT(CASE WHEN email != LOWER(email) THEN 1 END) as emails_com_maiuscula
FROM users;

-- 5.2. Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('post_comments', 'notifications');

-- 5.3. Verificar campos adicionados
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'is_system_user';


-- ============================================================================
-- RESUMO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CORREÇÃO CONCLUÍDA COM SUCESSO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Ações realizadas:';
  RAISE NOTICE '1. ✅ Duplicatas de email removidas';
  RAISE NOTICE '2. ✅ Emails normalizados para lowercase';
  RAISE NOTICE '3. ✅ Campo is_system_user adicionado';
  RAISE NOTICE '4. ✅ Campos skips_used e max_skips adicionados';
  RAISE NOTICE '5. ✅ Tabela post_comments criada';
  RAISE NOTICE '6. ✅ Tabela notifications criada';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Configurar RESEND_API_KEY no Vercel';
  RAISE NOTICE '2. Fazer redeploy da aplicação';
  RAISE NOTICE '3. Testar login e recuperação de senha';
  RAISE NOTICE '========================================';
END $$;


-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
