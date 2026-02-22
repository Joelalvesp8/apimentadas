-- ============================================================================
-- SCRIPT DE CORREÇÃO: Normalizar Emails + Migrations Pendentes
-- Execute este SQL completo no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PARTE 1: NORMALIZAR EMAILS EXISTENTES (FIX LOGIN)
-- ============================================================================

-- Esta query corrige emails que foram salvos com maiúsculas/minúsculas
-- inconsistentes, o que causava erro "email ou senha inválida" no login

-- 1.1. Normalizar todos os emails para lowercase
UPDATE users
SET email = LOWER(email)
WHERE email != LOWER(email);

-- 1.2. Verificar se há duplicatas após normalização
-- (Se houver duplicatas, o admin precisa resolver manualmente)
SELECT
  LOWER(email) as email_normalizado,
  COUNT(*) as quantidade,
  STRING_AGG(id, ', ') as user_ids
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- Se a query acima retornar linhas, significa que há emails duplicados
-- Exemplo: Usuario@Email.com e usuario@email.com são 2 contas diferentes
-- Ação: Decidir qual manter ou mesclar dados manualmente


-- ============================================================================
-- PARTE 2: MIGRATIONS DAS TASKS 1-11 (Se ainda não executadas)
-- ============================================================================

-- 2.1. Campo isSystemUser (TASK 2)
-- Adiciona flag para ocultar contas de sistema do Explorar/Conexões
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_system_user" BOOLEAN NOT NULL DEFAULT FALSE;

-- 2.2. Campos de Skip em GameSession (TASK 4)
-- Adiciona sistema de pular cartas com limite de 3 skips
ALTER TABLE "game_sessions"
ADD COLUMN IF NOT EXISTS "skips_used" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "game_sessions"
ADD COLUMN IF NOT EXISTS "max_skips" INTEGER NOT NULL DEFAULT 3;

-- 2.3. Tabela de Comentários em Posts (TASK 10)
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

-- Índices para performance de comentários
CREATE INDEX IF NOT EXISTS "post_comments_post_id_idx"
  ON "post_comments"("post_id");

CREATE INDEX IF NOT EXISTS "post_comments_user_id_idx"
  ON "post_comments"("user_id");

-- 2.4. Tabela de Notificações (TASK 5)
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

-- Índices para performance de notificações
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx"
  ON "notifications"("user_id");

CREATE INDEX IF NOT EXISTS "notifications_read_idx"
  ON "notifications"("user_id", "read");

CREATE INDEX IF NOT EXISTS "notifications_created_at_idx"
  ON "notifications"("created_at");


-- ============================================================================
-- PARTE 3: VERIFICAÇÕES PÓS-EXECUÇÃO
-- ============================================================================

-- 3.1. Verificar estrutura da tabela users
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('email', 'is_system_user')
ORDER BY ordinal_position;

-- 3.2. Verificar se tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('post_comments', 'notifications');

-- 3.3. Verificar índices criados
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('post_comments', 'notifications', 'users')
ORDER BY tablename, indexname;

-- 3.4. Estatísticas de emails normalizados
SELECT
  COUNT(*) as total_usuarios,
  COUNT(DISTINCT email) as emails_unicos,
  COUNT(CASE WHEN email != LOWER(email) THEN 1 END) as emails_com_maiuscula
FROM users;

-- Se "emails_com_maiuscula" = 0, tudo certo!


-- ============================================================================
-- PARTE 4: (OPCIONAL) CORREÇÕES ADICIONAIS
-- ============================================================================

-- 4.1. Atualizar updated_at em registros antigos de post_comments
-- (Útil se a tabela já existia antes)
UPDATE post_comments
SET updated_at = created_at
WHERE updated_at IS NULL OR updated_at < created_at;

-- 4.2. Remover notificações muito antigas (mais de 90 dias)
-- DELETE FROM notifications
-- WHERE created_at < NOW() - INTERVAL '90 days';

-- 4.3. Marcar todas as notificações antigas como lidas
-- (Para não sobrecarregar usuários com notificações antigas)
-- UPDATE notifications
-- SET read = TRUE
-- WHERE created_at < NOW() - INTERVAL '7 days' AND read = FALSE;


-- ============================================================================
-- RESUMO DE EXECUÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCRIPT DE CORREÇÃO EXECUTADO COM SUCESSO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Ações realizadas:';
  RAISE NOTICE '1. ✅ Emails normalizados para lowercase';
  RAISE NOTICE '2. ✅ Campo is_system_user adicionado';
  RAISE NOTICE '3. ✅ Campos skips_used e max_skips adicionados';
  RAISE NOTICE '4. ✅ Tabela post_comments criada';
  RAISE NOTICE '5. ✅ Tabela notifications criada';
  RAISE NOTICE '6. ✅ Índices de performance criados';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Verificar resultado das queries de verificação acima';
  RAISE NOTICE '2. Configurar RESEND_API_KEY no Vercel';
  RAISE NOTICE '3. Fazer redeploy da aplicação';
  RAISE NOTICE '4. Testar login e recuperação de senha';
  RAISE NOTICE '========================================';
END $$;


-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
--
-- Se houver erros:
-- - Verifique se alguma coluna/tabela já existe
-- - IF NOT EXISTS garante que não há erro de duplicação
-- - Consulte os logs de erro do Supabase para mais detalhes
--
-- Documentação completa em: CONFIGURAR_EMAIL_RECUPERACAO.md
-- ============================================================================
