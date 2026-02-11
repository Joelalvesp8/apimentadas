# 🌶️ Migration: Sistema de Mensagens Diretas

## Sobre a Feature
Sistema de **mensagens únicas** para usuários que não possuem conexão. Permite enviar uma mensagem direta a cada 24 horas para iniciar contato.

## Problema
A tabela `direct_messages` foi adicionada ao schema do Prisma, mas a migration não foi aplicada no banco de dados de produção (Supabase).

## Solução: Executar Migration Manualmente

### Passo 1: Acessar Supabase SQL Editor
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto **Apimentadas**
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar o SQL
1. Clique em **New Query**
2. Cole o SQL completo abaixo:

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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "direct_messages_receiver_id_idx" ON "direct_messages"("receiver_id");
CREATE INDEX IF NOT EXISTS "direct_messages_read_idx" ON "direct_messages"("read");
```

3. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### Passo 3: Verificar
Execute este SQL para confirmar que a tabela foi criada:

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'direct_messages'
ORDER BY ordinal_position;
```

Você deve ver 6 colunas:
```
table_name       | column_name  | data_type | is_nullable
direct_messages  | id           | text      | NO
direct_messages  | sender_id    | text      | NO
direct_messages  | receiver_id  | text      | NO
direct_messages  | message      | text      | NO
direct_messages  | read         | boolean   | NO
direct_messages  | created_at   | timestamp | NO
```

### Passo 4: Testar no App
1. Acesse a página **Explorar**
2. Veja usuários que você **não tem conexão**
3. Clique no **ícone azul de mensagem** (💬)
4. Digite uma mensagem e envie
5. Pronto! O usuário receberá sua mensagem

## Como Funciona

### Regras de Negócio
- ⏰ **1 mensagem a cada 24 horas** por destinatário
- 🔒 **Apenas para usuários sem conexão** (status: 'none')
- 📝 **Limite de 500 caracteres**
- 🚫 **Não pode enviar para si mesmo**
- ❌ **Não pode enviar se já são conectados** (use chat de conexões)

### Interface
- **Botão azul** com ícone de mensagem (MessageCircle)
- Só aparece para usuários **sem conexão**
- **Dialog modal** para digitar mensagem
- Info box explicando regra de 24h
- Contador de caracteres
- Loading state durante envio

### Endpoints API
```
POST /api/messages/direct
Body: { receiverId: string, message: string }
Response: { id, senderId, receiverId, message, read, createdAt, sender }

GET /api/messages/direct?type=received
GET /api/messages/direct?type=sent
Response: { messages: [...] }
```

## Estrutura da Tabela

```
direct_messages
├── id (TEXT, PK)
├── sender_id (TEXT, FK -> profiles.id)
├── receiver_id (TEXT, FK -> profiles.id)
├── message (TEXT)
├── read (BOOLEAN, default: false)
└── created_at (TIMESTAMP)
```

## Arquivo SQL
O arquivo completo está em: `prisma/migrations/add_direct_messages.sql`

## Próximos Passos (Opcional)
Futuramente, você pode criar:
- Página de inbox para ver mensagens recebidas
- Notificações de novas mensagens
- Marcar mensagens como lidas
- Responder mensagens (criando conexão)
