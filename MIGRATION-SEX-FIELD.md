# 🌶️ Migration: Adicionar Campo Sexo ao Perfil

## Problema
O campo `sex` foi adicionado ao schema do Prisma, mas a migration não foi aplicada no banco de dados de produção (Supabase).

## Solução: Executar Migration Manualmente

### Passo 1: Acessar Supabase SQL Editor
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto **Apimentadas**
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar o SQL
1. Clique em **New Query**
2. Cole o seguinte SQL:

```sql
-- Add sex column to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "sex" TEXT;

-- Optional: Add comment to document the field
COMMENT ON COLUMN "profiles"."sex" IS 'User sex: male or female';
```

3. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### Passo 3: Verificar
Execute este SQL para confirmar que a coluna foi criada:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'sex';
```

Você deve ver:
```
column_name | data_type | is_nullable
sex         | text      | YES
```

### Passo 4: Testar no App
1. Faça logout do app
2. Faça login novamente
3. Agora o formulário de onboarding deve carregar seus dados existentes

## Valores Possíveis
- `male` - Homem
- `female` - Mulher
- `null` - Não informado

## Arquivo SQL
O arquivo completo está em: `prisma/manual-migration-add-sex.sql`
