# 🚀 Guia Completo de Deploy na Vercel

## 📝 Preparação (5 minutos)

### 1. Gerar NEXTAUTH_SECRET

No seu terminal local, execute:

```bash
openssl rand -base64 32
```

Copie o resultado (será usado na Vercel).

### 2. Escolher e Configurar Banco de Dados

**Opção Recomendada: Neon (Gratuito)**

1. Acesse: https://neon.tech
2. Crie conta (pode usar GitHub)
3. **New Project**:
   - Name: `jogo-adulto-gamificado`
   - PostgreSQL version: 16 (padrão)
   - Region: `US East (Ohio)` ou mais próxima
4. Após criar, vá em **Dashboard → Connection Details**
5. **Connection string** → Copie a URL completa:
   ```
   postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```

**Dica**: O Neon oferece 0.5GB gratuito, suficiente para começar!

---

## 🌐 Deploy na Vercel (10 minutos)

### Passo 1: Conectar GitHub

1. Acesse: https://vercel.com
2. **Sign Up** ou **Login** (use sua conta GitHub)
3. Autorize a Vercel a acessar seus repositórios

### Passo 2: Importar Projeto

1. No Dashboard da Vercel, clique em **Add New... → Project**
2. Encontre o repositório: `Joelalvesp8/apimentadas`
3. Clique em **Import**

### Passo 3: Configurar Projeto

**Configure Project:**

1. **Framework Preset**: Next.js (detectado automaticamente ✓)
2. **Root Directory**: `./` (padrão)
3. **Build Command**: `npm run build` (padrão)
4. **Output Directory**: `.next` (padrão)
5. **Install Command**: `npm install` (padrão)

**NÃO clique em Deploy ainda!** Primeiro configure as variáveis de ambiente ⬇️

### Passo 4: Adicionar Variáveis de Ambiente

Clique em **Environment Variables** e adicione:

#### Variável 1: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Cole a connection string do Neon (do Passo 2 da preparação)
- **Environments**: Production, Preview, Development (marcar todos)

#### Variável 2: NEXTAUTH_SECRET
- **Name**: `NEXTAUTH_SECRET`
- **Value**: Cole o secret gerado com openssl (do Passo 1 da preparação)
- **Environments**: Production, Preview, Development (marcar todos)

#### Variável 3: NEXTAUTH_URL (Temporária)
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://seu-app.vercel.app` (placeholder, vamos atualizar depois)
- **Environments**: Production

**Google OAuth (Opcional - pode adicionar depois):**
- `GOOGLE_CLIENT_ID` → (vazio por enquanto)
- `GOOGLE_CLIENT_SECRET` → (vazio por enquanto)

### Passo 5: Deploy!

1. Clique em **Deploy**
2. Aguarde o build (2-3 minutos)
3. 🎉 Quando terminar, você verá: **Congratulations!**

### Passo 6: Obter URL do Projeto

1. Após o deploy, clique em **Visit**
2. Sua URL será algo como: `https://apimentadas-xyz123.vercel.app`
3. **Copie essa URL!**

### Passo 7: Atualizar NEXTAUTH_URL

1. No Dashboard da Vercel, vá em **Settings → Environment Variables**
2. Encontre `NEXTAUTH_URL`
3. Clique em **Edit**
4. Atualize o valor para a URL real: `https://apimentadas-xyz123.vercel.app`
5. Clique em **Save**
6. Vá em **Deployments** → último deploy → **⋯ Menu** → **Redeploy**

---

## 🗄️ Executar Migrations e Seed

Agora que o app está no ar, precisamos criar as tabelas e popular o banco:

### Opção A: Via Terminal (Recomendado)

```bash
# 1. Adicionar DATABASE_URL de produção no .env local (temporário)
echo 'DATABASE_URL="sua-connection-string-do-neon"' > .env.production.local

# 2. Executar migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 3. Popular banco com as 80 cartas
npx prisma db seed

# 4. Remover o arquivo temporário
rm .env.production.local
```

### Opção B: Via Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link ao projeto
vercel link

# 4. Puxar env vars
vercel env pull .env.vercel

# 5. Executar migrations
npx prisma migrate deploy

# 6. Seed
npx prisma db seed
```

### Opção C: Via Prisma Data Platform

```bash
# 1. Acesse https://console.prisma.io
# 2. Conecte seu banco Neon
# 3. Execute migrations via interface
```

---

## ✅ Verificar Deploy

### 1. Testar Aplicação

Acesse: `https://seu-app.vercel.app`

**Checklist:**
- [ ] Landing page carrega corretamente
- [ ] Clicar em "Criar Conta"
- [ ] Registrar novo usuário
- [ ] Login funciona
- [ ] Redirecionado para Onboarding
- [ ] Criar perfil
- [ ] Dashboard carrega com estatísticas

### 2. Verificar Banco de Dados

**Via Prisma Studio:**
```bash
# Com DATABASE_URL de produção no .env
npx prisma studio
```

Ou via **Neon Console**:
1. Acesse https://console.neon.tech
2. Seu projeto → SQL Editor
3. Execute:
   ```sql
   SELECT COUNT(*) FROM cards;
   -- Deve retornar 80

   SELECT COUNT(*) FROM users;
   -- Deve ter os usuários que você criou
   ```

### 3. Verificar PWA

1. Abra no celular: `https://seu-app.vercel.app`
2. Chrome → Menu → "Adicionar à tela inicial"
3. Verifique instalação

**Nota**: Para PWA funcionar 100%, você precisa gerar os ícones primeiro (veja `scripts/generate-icons.md`).

---

## 🔧 Configurações Adicionais (Opcional)

### Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add: `meusite.com.br`
3. Siga instruções para configurar DNS
4. Atualizar `NEXTAUTH_URL` para novo domínio

### Google OAuth

1. Acesse: https://console.cloud.google.com
2. Criar projeto → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID:
   - Authorized redirect URIs: `https://seu-app.vercel.app/api/auth/callback/google`
4. Copie Client ID e Client Secret
5. Vercel → Settings → Environment Variables
6. Adicionar:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
7. Redeploy

### Continuous Deployment

A Vercel já configurou automaticamente:
- ✅ Push para `main` → Deploy automático em Production
- ✅ Push para outras branches → Deploy de Preview
- ✅ Pull Requests → Deploy de Preview

---

## 🚨 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
1. Verificar se DATABASE_URL está correta
2. Verificar se termina com `?sslmode=require` (Neon exige SSL)
3. Testar conexão localmente:
   ```bash
   npx prisma db push
   ```

### Erro: "NEXTAUTH_SECRET must be provided"

**Solução:**
1. Vercel → Settings → Environment Variables
2. Verificar se `NEXTAUTH_SECRET` existe
3. Se não existir, adicionar
4. Redeploy

### Erro: "Table does not exist"

**Solução:**
```bash
# Migrations não foram executadas
npx prisma migrate deploy
```

### Build Failed

**Solução:**
1. Ver logs: Vercel → Deployments → seu deploy → View Function Logs
2. Corrigir erros TypeScript/ESLint
3. Testar build localmente:
   ```bash
   npm run build
   ```

### PWA não funciona

**Solução:**
1. Gerar ícones (veja `scripts/generate-icons.md`)
2. Fazer build local e testar
3. Deploy na Vercel
4. HTTPS já configurado automaticamente ✓

---

## 📊 Monitoramento

### Analytics (Gratuito na Vercel)

1. Vercel Dashboard → Analytics
2. Ver métricas:
   - Page views
   - Visitors
   - Top pages
   - Real User Metrics (Core Web Vitals)

### Logs

1. Vercel Dashboard → Deployments → seu deploy
2. **View Function Logs** para ver logs de API routes
3. **Real-time** para ver requests em tempo real

### Database Monitoring (Neon)

1. Neon Console → seu projeto
2. **Monitoring**:
   - Storage usage
   - Compute time
   - Connection count

---

## 💰 Custos

### Vercel (Hobby - Gratuito)
- ✅ 100 GB bandwidth/mês
- ✅ Serverless Functions ilimitadas
- ✅ Deployments ilimitados
- ✅ HTTPS automático
- ✅ Preview deployments
- ✅ Analytics básico

**Suficiente para:** Até ~10k usuários/mês

### Neon (Free Tier)
- ✅ 0.5 GB storage
- ✅ 3 GB bandwidth/mês
- ✅ 1 branch (production)

**Suficiente para:** Milhares de usuários

### Quando fazer upgrade?

**Vercel Pro ($20/mês):**
- Se ultrapassar 100 GB bandwidth
- Se precisar de analytics avançado
- Se precisar de password protection

**Neon Scale ($19/mês):**
- Se ultrapassar 0.5 GB storage
- Se precisar de mais branches
- Se precisar de mais compute

---

## 🎯 Checklist Final

Antes de considerar o deploy completo:

### Pré-Deploy
- [x] Código no GitHub
- [ ] Banco PostgreSQL criado (Neon/Supabase/Railway)
- [ ] NEXTAUTH_SECRET gerado
- [ ] Variáveis de ambiente preparadas

### Deploy
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] URL do projeto obtida
- [ ] NEXTAUTH_URL atualizada

### Pós-Deploy
- [ ] Migrations executadas
- [ ] Seed executado (80 cartas)
- [ ] Teste de registro funcionando
- [ ] Teste de login funcionando
- [ ] Teste de criar sessão funcionando
- [ ] PWA testado (se ícones gerados)

### Opcional
- [ ] Custom domain configurado
- [ ] Google OAuth configurado
- [ ] Analytics habilitado
- [ ] Monitoring configurado

---

## 🚀 Deploy Rápido (TL;DR)

Para quem já tem experiência:

```bash
# 1. Banco
# Neon.tech → New Project → Copiar DATABASE_URL

# 2. Secret
openssl rand -base64 32

# 3. Vercel
# vercel.com → Import → apimentadas
# Env vars:
#   DATABASE_URL=...
#   NEXTAUTH_SECRET=...
#   NEXTAUTH_URL=https://seu-app.vercel.app
# → Deploy

# 4. Migrations
npx prisma migrate deploy
npx prisma db seed

# 5. Atualizar NEXTAUTH_URL com URL real
# 6. Redeploy

# ✅ Done!
```

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deploy](https://nextjs.org/docs/deployment)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Neon Docs](https://neon.tech/docs)

---

**Tempo Estimado Total:** 15-20 minutos

**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

**Status:** ✅ Pronto para Deploy!
