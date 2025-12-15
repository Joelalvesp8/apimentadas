# Jogo Adulto Gamificado - NextJS + TypeScript + PostgreSQL + Prisma + PWA

Aplicação web Progressive Web App (PWA) de jogo adulto gamificado para casais, trios e grupos.

## 🚀 Tecnologias

- **Frontend**: NextJS 14+ (App Router), React 18+, TypeScript
- **Estilização**: Tailwind CSS, shadcn/ui
- **Backend**: API Routes NextJS
- **Banco de Dados**: PostgreSQL 14+
- **ORM**: Prisma 5+
- **Autenticação**: NextAuth.js (Credentials + Google OAuth)
- **State Management**: React Query (@tanstack/react-query)
- **Validação**: Zod
- **Formulários**: React Hook Form
- **PWA**: next-pwa, Service Workers

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## ⚙️ Configuração do Projeto

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd apimentadas
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gamified_game?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configurar banco de dados PostgreSQL

#### Opção 1: PostgreSQL Local

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb gamified_game

# Criar usuário
sudo -u postgres psql
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gamified_game TO your_user;
\q
```

#### Opção 2: PostgreSQL com Docker

```bash
docker run --name gamified-postgres \
  -e POSTGRES_DB=gamified_game \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14
```

### 5. Executar migrations e seed

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Popular banco com 80 cartas iniciais
npm run db:seed
```

### 6. Executar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🗄️ Banco de Dados

O projeto utiliza 9 modelos Prisma:

- **User**: Autenticação e dados do usuário
- **Profile**: Perfil público do usuário
- **Connection**: Conexões entre usuários
- **Card**: Cartas oficiais do jogo
- **UserCard**: Cartas personalizadas criadas por usuários
- **CardLike**: Curtidas em cartas
- **GameSession**: Sessões de jogo
- **SessionParticipant**: Participantes das sessões
- **PlayedCard**: Cartas jogadas nas sessões

### Visualizar banco de dados

```bash
npm run db:studio
```

## 🎮 Funcionalidades

### ✅ Fases 1-5 (Implementadas - Aplicação Funcional!)

**Fase 1 & 2 - Fundação e Perfis:**
- [x] Autenticação segura (Credentials + Google OAuth)
- [x] Sistema de perfis com nickname único
- [x] Onboarding de usuários
- [x] 80+ cartas oficiais (perguntas e tarefas)
- [x] Seed do banco de dados
- [x] Landing page responsiva
- [x] Páginas de login e registro

**Fase 3 - Rede Social:**
- [x] Sistema completo de conexões entre usuários
- [x] Solicitações de conexão (enviar/aceitar/rejeitar)
- [x] Busca de perfis por nickname
- [x] Gerenciamento de conexões aceitas e pendentes

**Fase 4 - Sistema de Cartas:**
- [x] Busca de cartas aleatórias com filtros
- [x] Componente GameCard com animação flip
- [x] Componente RatingStars (0-5 estrelas)
- [x] Sistema de curtidas em cartas
- [x] Criação de cartas personalizadas
- [x] Listagem de cartas populares

**Fase 5 - Sessões de Jogo (Core Feature):**
- [x] Criação de sessões com múltiplos participantes
- [x] Determinação automática de tipo (casal/trisal/grupo)
- [x] Busca e revelação de cartas durante o jogo
- [x] Sistema de avaliação de experiências
- [x] Estatísticas em tempo real (cartas jogadas, rating médio)
- [x] Finalização de sessões
- [x] Histórico de sessões jogadas

**Páginas Implementadas:**
- [x] Dashboard com estatísticas
- [x] Página de Conexões (com tabs)
- [x] Página de Nova Sessão
- [x] Página de Jogo completa

**Fase 6 - PWA e Polimento Final:**
- [x] Progressive Web App completo
- [x] Service Worker com cache strategies
- [x] Manifest.json configurado
- [x] Página offline customizada
- [x] Meta tags PWA (iOS + Android)
- [x] Otimizações mobile (CSS)
- [x] Safe area insets para notch
- [x] Guia completo de instalação e testes
- [x] Instalável em todos os dispositivos
- [x] Funciona offline

### 🎉 Projeto 100% Completo!

Todas as 6 fases implementadas com sucesso!

## 📂 Estrutura do Projeto

```
apimentadas/
├── app/
│   ├── (auth)/              # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   ├── auth/            # NextAuth routes
│   │   └── profile/         # Profile API routes
│   ├── onboarding/          # Onboarding page
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── providers.tsx        # React Query + Session providers
├── hooks/                   # Custom React hooks
├── lib/
│   ├── utils/               # Utility functions
│   ├── validations/         # Zod schemas
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma client
│   └── api-client.ts        # API client
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seed
├── data/
│   └── cartas_iniciais.json # 80 initial cards
└── public/                  # Static files
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run lint         # Executar ESLint
npm run db:generate  # Gerar Prisma Client
npm run db:migrate   # Executar migrations
npm run db:push      # Push schema para database
npm run db:seed      # Popular banco com dados iniciais
npm run db:studio    # Abrir Prisma Studio
```

## 🔐 Autenticação

O projeto suporta dois métodos de autenticação:

1. **Credentials**: Email e senha
2. **Google OAuth**: Login com conta Google (requer configuração de credenciais)

### Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a Google+ API
4. Crie credenciais OAuth 2.0
5. Adicione as credenciais no `.env`:
   ```
   GOOGLE_CLIENT_ID="seu-client-id"
   GOOGLE_CLIENT_SECRET="seu-client-secret"
   ```

## 📱 PWA (Progressive Web App)

O projeto está configurado para ser um PWA (será implementado na Fase 6):

- Service Workers para cache
- Manifest.json para instalação
- Funciona offline
- Instalável em dispositivos móveis

## 🧪 Testando a Aplicação

### 1. Criar usuário

1. Acesse http://localhost:3000
2. Clique em "Criar Conta"
3. Preencha nome, email e senha
4. Faça login

### 2. Completar perfil

1. Após o login, será redirecionado para /onboarding
2. Escolha um nickname único
3. Adicione bio e orientação (opcional)
4. Clique em "Continuar"

### 3. Explorar cartas no banco

```bash
npm run db:studio
```

Navegue até a tabela `cards` para ver as 80 cartas iniciais.

## 🚀 Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Conecte o repositório no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Configure um banco PostgreSQL (ex: [Neon](https://neon.tech/), [Supabase](https://supabase.com/))
5. Deploy!

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## 📝 Notas de Desenvolvimento

- As migrations do Prisma devem ser executadas toda vez que o schema for alterado
- O seed pode ser re-executado sem problemas (ele limpa as cartas oficiais antes)
- O middleware de autenticação protege todas as rotas em `/dashboard/*` e `/api/*`
- React Query mantém cache de 1 minuto por padrão

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e não possui licença pública.

## 👥 Autores

- **DeepAgent (Abacus.AI)** - Concepção e desenvolvimento inicial
- **Data**: 13 de dezembro de 2025
- **Versão**: 1.0

## 🆘 Problemas Comuns

### Erro de conexão com banco

```
Error: P1001: Can't reach database server
```

**Solução**: Verifique se o PostgreSQL está rodando e se a `DATABASE_URL` está correta.

### Erro ao executar migrations

```
Error: The database 'gamified_game' does not exist
```

**Solução**: Crie o banco de dados primeiro (veja seção "Configurar banco de dados PostgreSQL").

### Erro de NEXTAUTH_SECRET

```
Error: Please define NEXTAUTH_SECRET environment variable
```

**Solução**: Adicione `NEXTAUTH_SECRET` no arquivo `.env`.

---

**Status do Projeto**: 🎉 **100% COMPLETO - PWA Pronto!** (Todas as 6 fases implementadas)

## 📱 PWA - Progressive Web App

O projeto agora é um PWA completo! Veja o guia detalhado em [PWA_GUIDE.md](./PWA_GUIDE.md).

**Para usar o PWA:**
1. Gere os ícones: siga `scripts/generate-icons.md`
2. Faça build: `npm run build && npm start`
3. Acesse via HTTPS (use ngrok para testar)
4. Instale no seu dispositivo!

**Funcionalidades PWA:**
- 📱 Instalável em Android, iOS e Desktop
- 🔄 Funciona offline
- ⚡ Cache inteligente
- 🎨 Ícone personalizado
- 📵 Modo standalone
