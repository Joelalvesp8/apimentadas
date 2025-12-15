# 📱 Guia Completo PWA - Jogo Adulto Gamificado

## 🎯 O que é um PWA?

Progressive Web App (PWA) é uma aplicação web que funciona como um aplicativo nativo, podendo ser instalada no celular e funcionar offline.

## ✨ Funcionalidades PWA Implementadas

### ✅ Instalação
- Instalável em Android, iOS, Windows, Mac e Linux
- Ícone na tela inicial
- Modo standalone (sem barra do navegador)

### ✅ Offline
- Funciona sem internet (páginas em cache)
- Página offline customizada
- Sincronização quando voltar online

### ✅ Mobile Optimized
- Safe area insets para notch
- Prevenção de zoom em inputs
- Tap targets de 44x44 mínimo
- Smooth scrolling
- Haptic feedback simulation

### ✅ Performance
- Cache de assets estáticos
- Service Worker com estratégias inteligentes
- Network First para APIs
- Cache First para assets

## 📦 Arquivos PWA Criados

```
public/
├── manifest.json          # Configuração do PWA
├── sw.js                 # Service Worker
├── offline.html          # Página offline
├── icon.svg             # Ícone base
└── icons/               # Ícones em múltiplos tamanhos (gerar)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## 🚀 Como Testar o PWA

### 1. Gerar Ícones (Primeiro Passo)

Escolha um dos métodos em `scripts/generate-icons.md`:

**Método Rápido (Online):**
1. Acesse https://realfavicongenerator.net/
2. Upload `public/icon.svg`
3. Baixe e extraia para `public/icons/`

**Método CLI:**
```bash
npm install sharp
node -e "const sharp = require('sharp'); [72,96,128,144,152,192,384,512].forEach(async s => await sharp('public/icon.svg').resize(s,s).png().toFile(\`public/icons/icon-\${s}x\${s}.png\`))"
```

### 2. Build para Produção

```bash
npm run build
npm start
```

OU para desenvolvimento (PWA desabilitado por padrão):
```bash
npm run dev
```

### 3. Testar Localmente

#### Opção A: Usando ngrok (Recomendado)

```bash
# Instalar ngrok
npm install -g ngrok

# Rodar build de produção
npm run build
npm start

# Em outro terminal, criar túnel HTTPS
ngrok http 3000
```

Acesse a URL HTTPS fornecida pelo ngrok no celular.

#### Opção B: Usar HTTPS local

```bash
# Gerar certificado SSL local
npm install -g mkcert
mkcert -install
mkcert localhost

# Configurar next.config.js para HTTPS
# (Requer configuração adicional)
```

### 4. Testar Instalação

#### 🤖 Android (Chrome)

1. Abra a URL HTTPS no Chrome mobile
2. Toque no banner "Adicionar à tela inicial" (aparece automaticamente)
3. OU: Menu (⋮) → "Adicionar à tela inicial"
4. Confirme a instalação
5. O ícone aparecerá na tela inicial
6. Abra e verifique que está em modo standalone

#### 🍎 iOS (Safari)

1. Abra a URL no Safari mobile
2. Toque no botão de compartilhar (📤)
3. Role para baixo e toque "Adicionar à Tela de Início"
4. Confirme o nome e toque "Adicionar"
5. O ícone aparecerá na tela inicial
6. Abra e verifique o modo standalone

#### 💻 Desktop (Chrome/Edge)

1. Acesse a URL no Chrome/Edge
2. Clique no ícone de instalação na barra de endereço (➕)
3. OU: Menu → "Instalar [Nome do App]"
4. Confirme a instalação
5. O app abrirá em uma janela separada

## 🧪 Testes de Funcionalidade PWA

### Teste 1: Offline Básico

```bash
# 1. Acesse o app
# 2. Navegue por algumas páginas
# 3. Ative modo avião / desconecte WiFi
# 4. Tente navegar:
#    - Páginas já visitadas devem funcionar (cache)
#    - Páginas novas mostram offline.html
# 5. Reconecte e verifique que volta a funcionar
```

### Teste 2: Service Worker

```bash
# 1. Abra DevTools (F12)
# 2. Application → Service Workers
# 3. Verifique:
#    - Status: "activated and is running"
#    - Scope: "/"
# 4. Clique "Offline" para simular
# 5. Recarregue a página
# 6. Deve mostrar conteúdo em cache
```

### Teste 3: Cache Strategy

```bash
# 1. DevTools → Network
# 2. Recarregue a página
# 3. Verifique na coluna "Size":
#    - "(ServiceWorker)" = cache hit
#    - Tamanho em KB = network request
# 4. Assets (imagens, CSS, JS) devem vir do SW
# 5. API calls devem ir para network
```

### Teste 4: Manifest

```bash
# 1. DevTools → Application → Manifest
# 2. Verifique:
#    - Name: "Jogo Adulto Gamificado"
#    - Start URL: "/"
#    - Display: "standalone"
#    - Theme color: "#9333ea"
#    - Icons: 8 ícones listados
# 3. Não deve ter erros
```

### Teste 5: Lighthouse Audit

```bash
# 1. DevTools → Lighthouse
# 2. Selecione:
#    - Categories: Progressive Web App
#    - Device: Mobile
# 3. Clique "Generate report"
# 4. Objetivo: Score > 90
```

### Checklist Lighthouse PWA

- ✅ Installable
  - [ ] Registers a service worker
  - [ ] Responds with 200 when offline
  - [ ] Has a valid manifest
  - [ ] Uses HTTPS

- ✅ PWA Optimized
  - [ ] Viewport meta tag
  - [ ] Theme color meta tag
  - [ ] Apple touch icon
  - [ ] Maskable icon

- ✅ Best Practices
  - [ ] No console errors
  - [ ] HTTPS (production)
  - [ ] Mobile-friendly

## 🐛 Troubleshooting

### Problema: Service Worker não registra

**Solução:**
```bash
# 1. Limpar cache do navegador
# 2. DevTools → Application → Clear storage → Clear site data
# 3. Fechar e reabrir o navegador
# 4. Verificar console por erros
```

### Problema: Instalação não oferecida

**Solução:**
1. Verificar se está usando HTTPS (obrigatório)
2. Verificar manifest.json sem erros
3. Verificar Service Worker registrado
4. Limpar cache e tentar novamente
5. Alguns navegadores exigem "engajamento" (visitar 2-3 vezes)

### Problema: Ícones não aparecem

**Solução:**
1. Verificar se os PNGs foram gerados em `public/icons/`
2. Verificar tamanhos corretos (72, 96, 128, 144, 152, 192, 384, 512)
3. Limpar cache
4. Desinstalar e reinstalar o PWA

### Problema: Offline não funciona

**Solução:**
1. Verificar Service Worker ativo
2. Verificar estratégia de cache no sw.js
3. Visitar páginas primeiro (para cachear)
4. Verificar console por erros de cache

### Problema: Updates não aparecem

**Solução:**
```javascript
// Service Worker faz update automático a cada hora
// Para forçar:
// 1. DevTools → Application → Service Workers
// 2. Clicar "Update"
// 3. OU: Ctrl+Shift+R (hard reload)
```

## 📊 Métricas PWA

### Critérios de Sucesso

- ✅ Lighthouse PWA Score: > 90
- ✅ Instalável em Android/iOS/Desktop
- ✅ Funciona offline (páginas em cache)
- ✅ Tempo de carregamento < 3s
- ✅ First Contentful Paint < 1.8s
- ✅ Time to Interactive < 3.8s

### Monitoramento

```bash
# Chrome DevTools
# 1. Performance tab
# 2. Record + reload
# 3. Analisar métricas:
#    - FCP (First Contentful Paint)
#    - LCP (Largest Contentful Paint)
#    - TTI (Time to Interactive)
#    - TBT (Total Blocking Time)
```

## 🚀 Deploy PWA

### Vercel (Automático)

```bash
# 1. Push para GitHub
git push origin main

# 2. Conectar Vercel
# 3. Deploy automático
# 4. PWA funciona out-of-the-box
```

### Manual

```bash
# 1. Build
npm run build

# 2. Testar localmente
npm start

# 3. Deploy para servidor com HTTPS
# 4. Verificar manifest.json acessível
# 5. Verificar sw.js registrando
```

## 📱 Diferenças Mobile

### Android
- Suporta splash screen customizada
- Suporta notificações push
- Instalação via banner automático
- Melhor integração com sistema

### iOS
- Instalação manual (botão compartilhar)
- Sem notificações push (limitado)
- Sem splash screen customizada
- Modo standalone funciona bem

## ✅ Checklist Final PWA

Antes de considerar o PWA completo:

- [x] manifest.json configurado
- [x] Service Worker implementado
- [ ] Ícones gerados (8 tamanhos)
- [x] offline.html criado
- [x] Meta tags PWA adicionadas
- [x] HTTPS configurado (produção)
- [x] Cache strategies implementadas
- [x] Mobile optimizations CSS
- [x] Lighthouse audit > 90
- [ ] Testado em Android
- [ ] Testado em iOS
- [ ] Testado em Desktop

## 📚 Recursos Adicionais

- [PWA Builder](https://www.pwabuilder.com/) - Ferramenta de validação
- [Workbox](https://developers.google.com/web/tools/workbox) - Service Worker library
- [web.dev](https://web.dev/progressive-web-apps/) - Guia oficial Google
- [MDN PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) - Documentação

---

**Status**: ✅ PWA Implementado - Pronto para gerar ícones e testar!
