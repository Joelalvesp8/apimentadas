# 🔍 Checklist: Teste de Mensagens Diretas

## ⚠️ ANTES DE TESTAR - Migration Obrigatória

**IMPORTANTE:** A funcionalidade de mensagens diretas **NÃO VAI FUNCIONAR** até você executar a migration no banco de dados!

### 🔧 Execute a Migration (FAÇA ISSO PRIMEIRO!)

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto **Apimentadas**
3. Clique em **SQL Editor** no menu lateral
4. **Cole e execute** este SQL:

```sql
-- Create direct_messages table
CREATE TABLE IF NOT EXISTS "direct_messages" (
  "id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "receiver_id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_fkey"
  FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_receiver_id_fkey"
  FOREIGN KEY ("receiver_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "direct_messages_receiver_id_idx" ON "direct_messages"("receiver_id");
CREATE INDEX IF NOT EXISTS "direct_messages_read_idx" ON "direct_messages"("read");
```

5. Clique em **RUN** ✅

---

## ✅ Como Testar Depois da Migration

### Passo 1: Verifique no Explore
1. Acesse a página **Explorar**
2. Role pelos usuários
3. Procure usuários que você **NÃO tem conexão**
4. Você deve ver um **ícone azul 💬** ao lado dos botões

### Passo 2: Envie uma Mensagem
1. Clique no **ícone azul de mensagem** 💬
2. Um modal deve abrir com:
   - Título: "Enviar Mensagem"
   - Nome do destinatário
   - Info box explicando regra de 24h
   - Área de texto (máximo 500 caracteres)
   - Contador de caracteres

3. Digite uma mensagem (ex: "Oi! Vamos jogar?")
4. Clique em **Enviar Mensagem**

### Passo 3: Verifique o Feedback

**✅ Se deu CERTO:**
- O modal fecha automaticamente
- Aparece um **toast verde** no canto da tela:
  ```
  ✅ Mensagem enviada!
  Sua mensagem foi enviada com sucesso. O usuário receberá sua mensagem.
  ```
- O toast fica visível por 5 segundos

**❌ Se deu ERRO:**
- O modal continua aberto
- Aparece uma **caixa vermelha** dentro do modal mostrando o erro
- Exemplos de erros:
  - "Você já enviou uma mensagem para este usuário. Aguarde 24 horas."
  - "Vocês já são conectados. Use o chat de conexões."
  - "Erro ao enviar mensagem" (se a migration não foi aplicada)

---

## 🐛 Problemas Comuns

### 1. "Não vejo o ícone azul de mensagem"
**Causa:** O ícone só aparece para usuários com `connectionStatus === 'none'`
**Solução:**
- Certifique-se de estar vendo usuários que você **não tem conexão**
- Se todos os usuários já são seus conectados, o ícone não aparece

### 2. "Cliquei em Enviar mas nada acontece"
**Causa:** Migration não foi executada
**Solução:**
- Execute a migration no Supabase (passo 1 acima)
- Você verá uma mensagem de erro no modal dizendo para executar a migration

### 3. "Erro: 'direct_messages' relation does not exist"
**Causa:** Tabela não foi criada no banco
**Solução:**
- Execute a migration SQL no Supabase
- Verifique se a query foi executada com sucesso

### 4. "Erro 429: Aguarde 24 horas"
**Causa:** Você já enviou uma mensagem para este usuário nas últimas 24 horas
**Solução:**
- Esta é uma regra de negócio (1 mensagem por dia)
- Aguarde 24 horas ou tente com outro usuário

### 5. "Erro: Vocês já são conectados"
**Causa:** Você tentou enviar mensagem para alguém que já é seu contato
**Solução:**
- Use o chat de conexões ao invés de mensagem única
- Mensagem única é apenas para usuários **sem conexão**

---

## 📊 Como Verificar se a Migration Foi Aplicada

No Supabase SQL Editor, execute:

```sql
SELECT COUNT(*) FROM information_schema.tables
WHERE table_name = 'direct_messages';
```

- **Resultado 1:** Tabela existe ✅
- **Resultado 0:** Tabela NÃO existe ❌ (execute a migration!)

---

## 🎯 Resumo do Fluxo

1. ✅ Executar migration no Supabase
2. 🔄 Recarregar a página do app
3. 🔍 Acessar página Explorar
4. 👤 Encontrar usuário sem conexão
5. 💬 Clicar no ícone azul
6. ✍️ Digitar mensagem
7. 📤 Clicar em "Enviar Mensagem"
8. ✅ Ver toast de confirmação

---

**Arquivos de Referência:**
- Migration SQL: `prisma/migrations/add_direct_messages.sql`
- Documentação completa: `MIGRATION-DIRECT-MESSAGES.md`

**Commit Atual:** `680ac13` - fix: melhorar feedback visual ao enviar mensagens diretas
