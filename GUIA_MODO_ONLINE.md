# 🎮 Guia Completo - Modo Online

## 📋 Índice
1. [Como Funciona](#como-funciona)
2. [Criar Sessão Online](#criar-sessão-online)
3. [Jogar Sessão Online](#jogar-sessão-online)
4. [Sair da Sessão](#sair-da-sessão)
5. [Diferenças: Local vs Online](#diferenças-local-vs-online)
6. [Resolução de Problemas](#resolução-de-problemas)

---

## 🎯 Como Funciona

O **Modo Online** permite que jogadores em **locais diferentes** (cada um em sua casa) joguem juntos remotamente.

### Características Principais

✅ **Apenas Perguntas** - Sem tarefas físicas (ideal para jogar à distância)
✅ **Todos Veem a Mesma Pergunta** - Simultaneamente
✅ **Todos Respondem** - Ninguém fica "de fora"
✅ **Bloqueio Automático** - Próxima pergunta só aparece quando TODOS responderem
✅ **Respostas Públicas** - Todos veem as respostas de todos
✅ **Sem Repetição** - Cartas já jogadas não aparecem novamente
✅ **Saída Individual** - Cada participante pode sair quando quiser

### Mínimo de Participantes
- **Mínimo**: 2 jogadores (você + 1 pessoa)
- **Máximo**: 10 jogadores

---

## 🚀 Criar Sessão Online

### Passo a Passo

1. **Acesse**: Menu → "Dashboard" → Botão "Nova Sessão"
   - Ou acesse diretamente: `/new-session`

2. **Escolha o Modo**: Clique no card **"Modo Online"**
   - Ícone: 🌐 (wifi)
   - Badge: "À DISTÂNCIA"
   - Cor: borda vermelha quando selecionado

3. **Leia o Aviso Azul**:
   ```
   ℹ️ Modo Online: Adicione pelo menos 1 pessoa para jogar com você
   (total mínimo: 2 jogadores). Todos precisam estar conectados
   simultaneamente. A rodada só avança quando todos responderem.
   ```

4. **Selecione Participantes**:
   - Clique nos cards das pessoas que vão jogar
   - Aparece badge "Selecionado" em vermelho
   - Contador mostra: "X selecionados + você = Y total"

5. **Clique em**: "Iniciar Sessão Online"
   - Botão vermelho grande
   - Aguarde alguns segundos

6. **Redirecionamento Automático**:
   - Você será levado para `/game-online/[id]`
   - A sessão aparecerá no dashboard com badge **🌐 Online**

---

## 🎲 Jogar Sessão Online

### Acesso à Sessão

**Pelo Dashboard**:
- Menu → "Dashboard"
- Procure pela sessão com badge **🌐 Online**
- Clique no card da sessão

**Link Direto**:
- Compartilhe com outros: `https://seusite.com/game-online/[id-da-sessao]`

### Interface do Jogo

#### 1️⃣ **Tela Inicial** (Primeira Rodada)

Você verá:
```
┌─────────────────────────────────────┐
│ 🔥 Pronto para começar?             │
│                                     │
│ Clique no botão abaixo para        │
│ sortear a primeira pergunta        │
│                                     │
│  [Iniciar Primeira Rodada] ←━━━━━  │
└─────────────────────────────────────┘
```

**Clique em**: "Iniciar Primeira Rodada"

#### 2️⃣ **Pergunta Aparece**

Todos os participantes veem:
```
┌─────────────────────────────────────┐
│ ❓ Pergunta da Rodada #1           │
│                                     │
│ "Qual foi o momento mais           │
│  constrangedor da sua vida?"       │
│                                     │
│ 🔥 dificil  👥 casal               │
└─────────────────────────────────────┘
```

#### 3️⃣ **Contador de Respostas**

Mostra quem já respondeu:
```
┌─────────────────────────────────────┐
│ ⏰ Aguardando respostas             │
│ 1/2 participantes                   │
│                                     │
│ ✅ João (@joao)       - Respondeu   │
│ ⏰ Maria (@maria)     - Esperando   │
│                                     │
│ ████████░░░░░░░░  50%              │
└─────────────────────────────────────┘
```

#### 4️⃣ **Formulário de Resposta**

```
┌─────────────────────────────────────┐
│ Sua Resposta                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Digite sua resposta aqui...     │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 0/1000 caracteres                   │
│                      [📤 Enviar]    │
└─────────────────────────────────────┘
```

**Digite sua resposta** e clique em "Enviar Resposta"

#### 5️⃣ **Aguardando Outros**

Após enviar, você vê:
```
┌─────────────────────────────────────┐
│ ✅ Resposta Enviada!                │
│                                     │
│ Aguardando os outros participantes  │
│ responderem...                      │
└─────────────────────────────────────┘
```

A tela **atualiza automaticamente** a cada 3 segundos.

#### 6️⃣ **Todas as Respostas**

Quando todos responderem, aparece:
```
┌─────────────────────────────────────┐
│ 💬 Respostas dos Participantes      │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ #1 João (@joao) - Você         │   │
│ │ há 2 minutos                   │   │
│ │                                │   │
│ │ "Quando tropecei no palco..."  │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ #2 Maria (@maria)              │   │
│ │ há 1 minuto                    │   │
│ │                                │   │
│ │ "Chamei a professora de mãe"   │   │
│ └───────────────────────────────┘   │
│                                     │
│         [▶️ Próxima Pergunta]       │
└─────────────────────────────────────┘
```

**Clique em**: "Próxima Pergunta" para continuar

#### 7️⃣ **Loop do Jogo**

O jogo continua repetindo:
1. Nova pergunta aparece (sem repetir)
2. Todos respondem
3. Veem as respostas
4. Clique em "Próxima Pergunta"
5. Repete...

---

## 🚪 Sair da Sessão

### Como Sair

No canto superior direito, você verá:
```
┌────────────────────────────────────┐
│ Sessão: Casal     [Sair da Sessão] │
└────────────────────────────────────┘
```

**Clique em**: "Sair da Sessão"

### Confirmação
```
⚠️ Tem certeza que deseja sair da sessão?
   Os outros participantes serão notificados.

   [Cancelar]  [Confirmar]
```

**Clique em**: "Confirmar"

### O que Acontece

✅ **Você**: É redirecionado para o Dashboard
✅ **Outros Participantes**: Continuam jogando normalmente
✅ **Se Sobrar Apenas 1**: Sessão finaliza automaticamente
✅ **Contador Atualiza**: "Participantes: 1" (era 2)

### Regra Importante

⚠️ **Modo Online requer mínimo 2 jogadores**
- Se você sair e restar apenas 1 pessoa → sessão **ENCERRA**
- Se você sair e restarem 2+ pessoas → sessão **CONTINUA**

---

## 🔄 Diferenças: Local vs Online

| Característica | 🌐 Modo Online | 📍 Modo Local |
|---------------|---------------|--------------|
| **Localização** | Cada um em sua casa | Mesmo ambiente físico |
| **Tipos de Carta** | Apenas "perguntas" | Perguntas + Tarefas |
| **Visibilidade** | Todos veem a carta | Só quem tem a vez vê |
| **Respostas** | Todos respondem | Só quem é escolhido |
| **Turnos** | Sem turnos | Sistema de turnos |
| **Avaliações** | Sem avaliações | Com avaliações |
| **Próxima Carta** | Quando todos respondem | Quando turno acaba |
| **Sincronização** | Automática (polling 3s) | Não necessária |
| **Badge Dashboard** | 🌐 Online (azul) | 📍 Local (cinza) |
| **URL** | `/game-online/[id]` | `/game/[id]` |

---

## 🛠️ Resolução de Problemas

### Problema 1: Tela Branca ao Criar Sessão

**Sintoma**: Após criar, tela fica branca com erro.

**Solução**:
1. Volte ao Dashboard (F5)
2. A sessão **foi criada** com sucesso
3. Clique no card com badge **🌐 Online**
4. Agora funcionará normalmente

**Causa**: Redirecionamento estava indo para página errada (corrigido em 5a9422e)

### Problema 2: "Não é a sua vez!"

**Sintoma**: Aparece mensagem de modo local.

**Solução**:
1. Verifique a URL: deve ser `/game-online/[id]`
2. Se for `/game/[id]` → você está na página ERRADA
3. Volte ao Dashboard
4. Clique no card com badge **🌐 Online**

**Causa**: Link errado no dashboard (corrigido em 5a9422e)

### Problema 3: Cartas Repetidas

**Sintoma**: Mesma pergunta aparece novamente.

**Solução**:
- Atualizado em 5a9422e
- Agora cartas já jogadas são filtradas
- Se ainda acontecer, reporte como bug

### Problema 4: Não Consigo Sair

**Sintoma**: Não vejo botão de sair.

**Solução**:
1. Procure no canto superior direito
2. Botão vermelho: "Sair da Sessão"
3. Se não aparecer, atualize a página (F5)

### Problema 5: Polling Não Funciona

**Sintoma**: Respostas não aparecem automaticamente.

**Solução**:
1. Aguarde 3 segundos
2. Sistema atualiza automaticamente
3. Se não funcionar, F5 (atualizar página)

### Problema 6: Sessão Não Aparece no Dashboard

**Sintoma**: Criei mas não vejo no dashboard.

**Solução**:
1. Atualize a página (F5)
2. Procure por card com badge **🌐 Online**
3. Verifique se está em "Sessões Ativas"

---

## 📊 Estatísticas da Sessão

Durante o jogo, você vê:

```
┌─────────────────────────────────────┐
│ Participantes: 2                    │
│ Rodadas: 5                          │
│ Cartas: 5                           │
└─────────────────────────────────────┘
```

**Participantes**: Total de jogadores
**Rodadas**: Perguntas completadas
**Cartas**: Total de cartas jogadas

---

## 🎨 Visual

### Badge no Dashboard
- **🌐 Online**: Azul claro com borda azul
- **📍 Local**: Cinza com borda cinza

### Cores do Modo Online
- **Fundo**: Preto (#000000)
- **Destaque**: Vermelho neon (#dc2626)
- **Bordas**: Vermelho semi-transparente
- **Sombras**: Brilho vermelho neon
- **Cards**: Gradiente zinc-900 → zinc-950

---

## 🔐 Privacidade

### O que os Outros Veem

✅ **Veem**:
- Suas respostas (durante a sessão)
- Seu nickname (@usuario)
- Seu avatar
- Tempo que você levou para responder

❌ **NÃO Veem**:
- Seu nome real
- Seu email
- Suas respostas de sessões ANTERIORES
- Detalhes de outras sessões suas

### Histórico

- Sessões concluídas aparecem no seu perfil público
- Mas **SEM** os detalhes das perguntas e respostas
- Apenas: tipo, modo, participantes, avaliação

---

## 🎯 Dicas para Melhor Experiência

1. **Combine com os Participantes**: Todos devem estar online ao mesmo tempo
2. **Internet Estável**: Para sincronização em tempo real
3. **Seja Sincero**: As respostas são mais divertidas quando honestas
4. **Não Demore Muito**: Outros estão esperando sua resposta
5. **Leia as Respostas dos Outros**: É a parte mais legal!
6. **Use o Botão Sair**: Não feche o navegador sem sair oficialmente

---

## 📱 Compatibilidade

✅ **Desktop**: Chrome, Firefox, Edge, Safari
✅ **Mobile**: Chrome Mobile, Safari iOS
✅ **Tablet**: Totalmente responsivo

---

## 🆘 Suporte

Se encontrar bugs ou problemas:

1. **Verifique este guia** primeiro
2. **Atualize a página** (F5)
3. **Limpe o cache** do navegador
4. **Tente outro navegador**
5. **Reporte o problema** com:
   - URL da página
   - O que você estava fazendo
   - Mensagem de erro (se houver)
   - Screenshot (se possível)

---

## 🚀 Atualizações Recentes

**Commit 5a9422e** (Mais Recente):
- ✅ Corrigido roteamento (dashboard → página correta)
- ✅ Adicionado badge visual (🌐 Online / 📍 Local)
- ✅ Cartas não se repetem mais
- ✅ Botão de sair individual
- ✅ Auto-finalizar se < 2 participantes

**Commit 47146a9**:
- ✅ Corrigido erro de tela branca (campo creator)

**Commit fa5b5d6**:
- ✅ Nome real agora é privado

---

## 📖 Documentação Técnica

Para desenvolvedores, veja:
- `CHANGELOG_ONLINE_SOCIAL.md` - Changelog completo
- `README.md` - Documentação geral

---

**Versão**: 1.0.0
**Última Atualização**: Janeiro 2026
**Branch**: `claude/gamified-adult-game-app-1HYQI`

Divirta-se! 🔥🌶️
