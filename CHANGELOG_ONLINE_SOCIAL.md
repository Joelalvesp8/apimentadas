# Changelog - Modo Online e Página Social

## 📅 Data: Janeiro 2026

Este documento detalha todas as funcionalidades implementadas nas features **Modo Online** e **Página Social** do Apimentadas.

---

## 🎮 MODO ONLINE

Sistema completo de jogo à distância onde jogadores remotos respondem simultaneamente às mesmas perguntas.

### Backend

#### Endpoints Criados

**1. `POST /api/sessions/online`** - Criar sessão online
- Validação: mínimo 1 participante adicional (criador + 1 = 2 total)
- Criador é automaticamente incluído nos participantes
- Determina tipo de sessão (casal/trisal/grupo) baseado na quantidade
- Retorna sessão com creator e participants completos

**2. `POST /api/sessions/:id/rounds/start`** - Iniciar nova rodada
- Valida se é sessão online
- Verifica se rodada anterior está completa (todos responderam)
- Sorteia carta aleatória do tipo "pergunta" (NUNCA "tarefa")
- Cria nova rodada com status "waiting"
- Atualiza currentRoundId da sessão

**3. `POST /api/sessions/:id/rounds/:roundId/answer`** - Enviar resposta
- Valida se usuário é participante
- Impede respostas duplicadas (constraint único: roundId + profileId)
- Marca rodada como "completed" quando todos respondem
- Incrementa cardsPlayed automaticamente

**4. `GET /api/sessions/:id/rounds/current`** - Buscar rodada atual
- Retorna rodada ativa com carta e respostas
- Inclui metadata: totalParticipants, totalAnswers, waitingProfiles
- Flag currentUserAnswered para UI condicional

**5. `GET /api/sessions/:id/status`** - Status da sessão
- Retorna progresso geral (rodadas, cartas jogadas)
- Flag canStartNext (se pode iniciar próxima rodada)
- Informações sobre rodada atual

### Frontend

#### Páginas

**`/game-online/[id]`** - Interface de jogo online
- Layout neon (preto + vermelho #dc2626)
- Header com badges "MODO ONLINE" e número da rodada
- Card de informações da sessão (participantes, rodadas, cartas)
- Exibição da pergunta atual com badges de dificuldade/categoria
- Formulário de resposta (textarea com contador de caracteres)
- Estados condicionais:
  - Sem rodada ativa: botão "Iniciar Primeira Rodada"
  - Rodada ativa + não respondeu: formulário de resposta
  - Rodada ativa + já respondeu: mensagem "Aguardando..."
  - Rodada completa: exibição de todas as respostas + botão próxima

#### Componentes

**`OnlineAnswerCounter`**
- Mostra progresso visual de respostas (X/Y participantes)
- Grid com avatares dos participantes
- Ícone check verde para quem já respondeu
- Ícone relógio amarelo pulsante para quem está esperando
- Barra de progresso percentual

**`OnlineAnswersDisplay`**
- Lista todas as respostas após rodada completa
- Ordenadas por timestamp (primeiro a responder aparece primeiro)
- Badge com número de ordem (#1, #2, #3...)
- Destaque visual para resposta do usuário atual
- Timestamp relativo em português (formatDistanceToNow)

#### Hooks

**`useCreateOnlineSession()`**
- Cria sessão online via API
- Invalidação automática da query de sessões

**`useStartRound(sessionId)`**
- Inicia nova rodada
- Invalidação de queries: session, current round, status

**`useSubmitAnswer(sessionId, roundId)`**
- Envia resposta do usuário
- Invalidação de queries: current round, status

**`useCurrentRound(sessionId)`**
- Busca rodada atual
- **Polling: 3 segundos** para sincronização em tempo real

**`useSessionStatus(sessionId)`**
- Busca status da sessão
- **Polling: 3 segundos** para atualização constante

### Banco de Dados

#### Tabelas Criadas

**`online_rounds`**
```sql
id              TEXT PRIMARY KEY
session_id      TEXT NOT NULL (FK -> game_sessions)
card_id         TEXT NOT NULL (FK -> cards)
round_number    INTEGER NOT NULL
status          TEXT DEFAULT 'waiting' ('waiting' | 'completed')
started_at      TIMESTAMP DEFAULT NOW()
completed_at    TIMESTAMP
```

**`online_answers`**
```sql
id              TEXT PRIMARY KEY
round_id        TEXT NOT NULL (FK -> online_rounds CASCADE)
profile_id      TEXT NOT NULL (FK -> profiles CASCADE)
answer          TEXT NOT NULL
answered_at     TIMESTAMP DEFAULT NOW()
UNIQUE(round_id, profile_id) -- Uma resposta por jogador por rodada
```

#### Campos Adicionados

**`game_sessions`**
- `mode` TEXT DEFAULT 'local' - Modo de jogo ('local' | 'online')
- `current_round_id` TEXT - ID da rodada atual (apenas online)

**`profiles`**
- `sessions_played` INTEGER DEFAULT 0 - Contador de sessões
- `average_rating` DOUBLE PRECISION - Avaliação média
- `last_active_at` TIMESTAMP DEFAULT NOW() - Última atividade

### Regras de Negócio

1. **Apenas perguntas**: Cartas tipo "tarefa" são filtradas (WHERE type = 'pergunta')
2. **Bloqueio de progresso**: Próxima rodada só inicia quando status = 'completed'
3. **Conclusão automática**: Rodada marca como completed quando últimoparticipante responde
4. **Respostas únicas**: Constraint impede múltiplas respostas do mesmo usuário
5. **Visibilidade total**: Todas as respostas são públicas após conclusão da rodada
6. **Sincronização**: Polling de 3s garante atualização em tempo real

---

## 👥 PÁGINA SOCIAL

Sistema de descoberta de usuários e visualização de perfis públicos, inspirado em redes sociais.

### Backend

#### Endpoints Criados

**1. `GET /api/users/explore`** - Listar usuários para descoberta
- Query params:
  - `search` (opcional): filtro por nickname (case-insensitive)
  - `sortBy` (opcional): 'activity' (default) ou 'rating'
- Ordenação:
  - activity: lastActiveAt DESC, sessionsPlayed DESC
  - rating: averageRating DESC, sessionsPlayed DESC
- Limite: 50 usuários
- Exclui o próprio usuário da lista
- Retorna: id, nickname, image, bio, orientation, stats

**2. `GET /api/users/[nickname]/profile`** - Perfil público por nickname
- Informações do usuário (sem dados sensíveis)
- Últimas 10 sessões concluídas (sem detalhes das cartas)
- Verifica se usuário atual está conectado (flag isConnected)
- Privacidade: não expõe email nem nome real

### Frontend

#### Páginas

**`/explore`** - Descoberta de usuários
- Header com título e descrição
- Campo de busca por @nickname
- Botões de ordenação (Atividade / Avaliação)
- Grid responsivo (1/2/3 colunas)
- Cards de usuários com:
  - Avatar grande
  - @nickname em destaque
  - Bio (limitada a 2 linhas)
  - Badge de orientação
  - Stats: sessões jogadas e avaliação média
  - Última atividade (tempo relativo)
- Estados: loading, erro, vazio, sucesso
- Hover effects com borda vermelha neon
- Click redireciona para perfil público

**`/users/[nickname]`** - Perfil público completo
- Botão voltar
- Header com avatar grande (border neon)
- @nickname em destaque (título principal)
- Badge "✓ Conectado" se houver conexão
- Bio completa
- Badge de orientação
- Data de membro desde
- 3 cards de estatísticas:
  - Sessões jogadas (ícone Users)
  - Avaliação média (ícone Star)
  - Última atividade (ícone Clock)
- Lista de sessões recentes:
  - Tipo e modo (Local/Online)
  - Avaliação da sessão
  - Participantes (avatares)
  - Data de conclusão
- Estado vazio se sem sessões
- Tratamento de erro 404

#### Hooks

**`useExploreUsers(search?, sortBy?)`**
- Busca usuários com filtros
- Re-fetch automático ao mudar parâmetros

**`usePublicProfile(nickname)`**
- Carrega perfil público por nickname
- Enabled condicional (só busca se nickname existe)

### Privacidade

#### Dados Públicos (visíveis para todos)
- ✅ @nickname
- ✅ Avatar (image)
- ✅ Bio
- ✅ Orientação
- ✅ Sessões jogadas (contador)
- ✅ Avaliação média
- ✅ Última atividade
- ✅ Data de cadastro
- ✅ Sessões concluídas (resumo sem cartas)

#### Dados Privados (apenas para o próprio usuário)
- ❌ Name (nome real) - **SIGILOSO**
- ❌ Email
- ❌ Detalhes das cartas jogadas
- ❌ Respostas de sessões anteriores
- ❌ Qualquer informação sensível

---

## 🧭 NAVEGAÇÃO

### Menu Principal Atualizado

Novos links adicionados ao header:

1. Dashboard
2. Pimentinhas (Marketplace)
3. Pedidos
4. Vendas (condicional - só para vendedores)
5. **Perfil** ← NOVO (ícone User)
6. Conexões
7. **Explorar** ← NOVO (ícone Compass)
8. Sair

### Rotas

**Modo Online:**
- `/new-session` - Seletor de modo (Local vs Online)
- `/game-online/[id]` - Interface de jogo online

**Social:**
- `/explore` - Descoberta de usuários
- `/users/[nickname]` - Perfil público

---

## 🔧 CORREÇÕES APLICADAS

### 1. Validação de Participantes
**Problema**: Exigia 2 participantes adicionais (total 3)
**Solução**: Criador já conta como 1, então só precisa adicionar 1+ pessoa
- Frontend: mínimo 1 participante selecionado
- Backend: validação .min(1) no schema
- Mensagens atualizadas: "você + 1 = 2 jogadores"
- Contador visual: "X selecionados + você = Y total"

### 2. Tipos TypeScript
**Problema**: GameSession não tinha campos mode e currentRoundId
**Solução**: Adicionados ao interface em hooks/useSessions.ts

### 3. Dependência date-fns
**Problema**: Build falhava por falta do pacote
**Solução**: npm install date-fns

### 4. Campo Creator
**Problema**: Endpoint de criação online não retornava creator
**Solução**: Adicionado include do creator na resposta

### 5. Privacidade do Nome
**Problema**: Nome real era exposto em APIs públicas
**Solução**: Removido campo name de explore e profile endpoints

---

## 📊 COMMITS REALIZADOS

```
47146a9 - fix: incluir campo creator ao criar sessão online
fa5b5d6 - fix: tornar nome privado e adicionar link Perfil no menu
3e43a74 - feat: adicionar link Explorar no menu de navegação
7f5d18c - fix: corrigir validação de participantes - criador já está incluído
fb4c51d - fix: adicionar campos mode e currentRoundId ao tipo GameSession
7503871 - feat: adicionar página social - explorar usuários e perfis públicos
4fad7bf - fix: adicionar dependência date-fns
070e095 - feat: adicionar seletor de modo local vs online em new-session
b3a0bd9 - feat: adicionar UI completa para modo online
0b18179 - feat: adicionar hooks React Query para modo online
b7a31c0 - feat: adicionar modo online - schema e APIs
```

---

## 🚀 COMO TESTAR

### Modo Online

1. Acesse `/new-session`
2. Selecione "Modo Online"
3. Adicione pelo menos 1 participante
4. Clique em "Iniciar Sessão Online"
5. Na página do jogo, clique em "Iniciar Primeira Rodada"
6. Cada participante responde a pergunta
7. Quando todos responderem, veja as respostas
8. Clique em "Próxima Pergunta" para continuar

### Página Social

1. Clique em "Explorar" no menu
2. Use a busca para filtrar por @nickname
3. Ordene por "Atividade" ou "Avaliação"
4. Clique em um card de usuário
5. Veja o perfil público completo
6. Explore as sessões recentes

---

## ✅ STATUS FINAL

- 🎮 **Modo Online**: 100% funcional
- 👥 **Página Social**: 100% funcional
- 🔒 **Privacidade**: 100% implementada
- 🧭 **Navegação**: 100% completa
- 🗄️ **Banco de Dados**: 100% migrado
- 📦 **Deploy**: Pronto para produção

---

## 📁 ARQUIVOS MODIFICADOS

### Novos (15 arquivos)
- `prisma/migrations/20260101_add_online_mode_and_social_features/migration.sql`
- `app/api/sessions/online/route.ts`
- `app/api/sessions/[id]/rounds/start/route.ts`
- `app/api/sessions/[id]/rounds/[roundId]/answer/route.ts`
- `app/api/sessions/[id]/rounds/current/route.ts`
- `app/api/sessions/[id]/status/route.ts`
- `app/api/users/explore/route.ts`
- `app/api/users/[nickname]/profile/route.ts`
- `app/(dashboard)/game-online/[id]/page.tsx`
- `app/(dashboard)/explore/page.tsx`
- `app/(dashboard)/users/[nickname]/page.tsx`
- `components/online/online-answer-counter.tsx`
- `components/online/online-answers-display.tsx`
- `hooks/useSocial.ts`
- `lib/validations/session.ts` (schemas online)

### Modificados (6 arquivos)
- `prisma/schema.prisma`
- `hooks/useSessions.ts`
- `app/(dashboard)/new-session/page.tsx`
- `app/(dashboard)/layout.tsx`
- `package.json`
- `package-lock.json`

---

**Desenvolvido por**: Claude AI
**Branch**: `claude/gamified-adult-game-app-1HYQI`
**Data**: Janeiro 2026
