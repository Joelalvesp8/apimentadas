# 🌶️ APIMENTADAS — Guia de Identidade Visual

> **Filosofia de Design:**
> *"A landing page não deve explicar o jogo. Ela deve fazer o visitante querer descobrir."*

---

## 🎨 Paleta de Cores

### Cores Principais

| Nome | Hex | Tailwind | Uso |
|------|-----|----------|-----|
| **Preto Absoluto** | `#000000` | `bg-black` | Background principal de todas páginas públicas |
| **Vermelho Primário** | `#dc2626` | `red-600` | CTAs, theme color, destaques principais |
| **Vermelho Escuro** | `#b91c1c` | `red-700` | Gradientes, hover states |
| **Vermelho Profundo** | `#991b1b` | `red-800` | Borders, shadows |
| **Vermelho Muito Escuro** | `#7f1d1d` | `red-900` | Cards background, glow effects |
| **Vermelho Ultra Escuro** | `#450a0a` | `red-950` | Overlays translúcidos |

### Cores de Texto

| Nome | Hex | Tailwind | Uso |
|------|-----|----------|-----|
| **Branco Principal** | `#ffffff` | `text-white` | Títulos e texto principal |
| **Cinza Claro** | `#d1d5db` | `gray-300` | Labels de formulário |
| **Cinza Médio** | `#9ca3af` | `gray-400` | Descrições e subtítulos |
| **Cinza Escuro** | `#6b7280` | `gray-500` | Texto secundário |
| **Cinza Muito Escuro** | `#4b5563` | `gray-600` | Placeholders |

### ⛔ Cores Proibidas

**NUNCA use:**
- Rosa (`pink-*`)
- Lilás/Roxo (`purple-*`)
- Tons pastéis
- Gradientes claros

**Exceção:** Roxo pode ser usado apenas em gradientes de transição preto→vermelho em casos específicos.

---

## 🖼️ Background Patterns

### 1. **Film Grain Texture** (Todas páginas públicas)

```tsx
<div
  className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulature type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  }}
/>
```

**Características:**
- Opacidade: `0.08`
- Blend mode: `overlay`
- Frequência: `0.95`
- Sempre `pointer-events-none`

### 2. **Red Halo Glow** (Ambient lighting)

```tsx
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[500px] h-[500px] bg-red-900/20 rounded-full
                blur-[100px] animate-pulse-slow" />
```

**Características:**
- Tamanho: `500px` ou `600px`
- Cor: `bg-red-900/20` a `bg-red-900/30`
- Blur: `blur-[100px]` ou `blur-[120px]`
- Animação: `pulse-slow` (4s)

---

## 🎭 Componentes Reutilizáveis

### **Dark Card Pattern**

```tsx
className="bg-gradient-to-br from-black/90 via-red-950/30 to-black/90
           border-red-900/40 backdrop-blur-sm
           shadow-[0_0_50px_rgba(220,38,38,0.2)]"
```

**Uso:** Login, Registro, Onboarding, modais

**Variações:**
- Hover: `hover:border-red-700/60 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]`
- Com glow lateral: Adicionar `<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100" />`

---

### **Red Button (Primary CTA)**

```tsx
className="bg-gradient-to-r from-red-600 to-red-700
           hover:from-red-500 hover:to-red-600
           text-white font-semibold
           shadow-[0_0_20px_rgba(220,38,38,0.4)]
           hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]
           transition-all duration-500"
```

**Características:**
- Gradient horizontal: `red-600` → `red-700`
- Hover intensifica: `red-500` → `red-600`
- Glow shadow cresce no hover
- Transition: `500ms` ou `700ms`
- Font: `font-semibold` ou `font-bold`

**Com shimmer effect:**

```tsx
<Button className="relative overflow-hidden group">
  <span className="relative z-10">Texto do Botão</span>
  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent
                  translate-y-full group-hover:translate-y-[-100%]
                  transition-transform duration-1000" />
</Button>
```

---

### **Dark Input Pattern**

```tsx
className="bg-black/50 border-red-900/30
           text-white placeholder:text-gray-600
           focus:border-red-700/50 focus:ring-red-900/30"
```

**Para Textarea:**
```tsx
className="bg-black/50 border-red-900/30
           text-white placeholder:text-gray-600
           focus:border-red-700/50 focus:ring-red-900/30
           min-h-[100px]"
```

**Para Select:**
```tsx
className="border border-red-900/30 bg-black/50
           text-white
           focus-visible:border-red-700/50
           focus-visible:ring-2 focus-visible:ring-red-900/30"
```

```tsx
<option className="bg-black text-white">Texto</option>
```

---

### **Error/Alert Box**

```tsx
<div className="p-3 text-sm text-red-200
                bg-red-950/50 border border-red-800/50
                rounded-md">
  {errorMessage}
</div>
```

---

## ✨ Animações

### 1. **Breathing Effect** (CTAs principais)

```css
@keyframes breathe-slow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

.animate-breathe-slow {
  animation: breathe-slow 4s ease-in-out infinite;
}
```

**Uso:** Botões principais da landing page

---

### 2. **Glow Pulse** (Halos de fundo)

```css
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}
```

**Uso:** Red halo backgrounds

---

### 3. **Heat Shimmer** (Pepper icon)

```css
@keyframes heat-shimmer {
  0%, 100% {
    filter: drop-shadow(0 0 25px rgba(220, 38, 38, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(239, 68, 68, 1));
  }
}

.animate-heat-shimmer {
  animation: heat-shimmer 2s ease-in-out infinite;
}
```

**Uso:** Logo/ícone principal

---

### 4. **Drip Effect** (Stars, referência às gotas do logo)

```css
@keyframes drip {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}
```

**Uso:**
```tsx
{[1, 2, 3, 4, 5].map((star, i) => (
  <span
    key={star}
    style={{ animation: `drip 3s ease-in-out infinite ${i * 0.2}s` }}
  >
    ★
  </span>
))}
```

---

### 5. **Breathe Glow** (Halo do pepper)

```css
@keyframes breathe-glow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.animate-breathe-glow {
  animation: breathe-glow 3s ease-in-out infinite;
}
```

---

## 🔤 Tipografia

### Títulos (Headings)

| Nível | Classes | Uso |
|-------|---------|-----|
| **H1 Hero** | `text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white` | Headline principal da landing |
| **H1 Card** | `text-2xl md:text-3xl text-white font-bold tracking-wide` | Títulos de cards/modais |
| **H2** | `text-xl md:text-2xl text-white font-bold` | Subtítulos |

### Body Text

| Tipo | Classes | Uso |
|------|---------|-----|
| **Primary** | `text-base md:text-lg text-gray-400 font-normal` | Texto principal |
| **Secondary** | `text-sm md:text-base text-gray-500 font-light` | Descrições |
| **Labels** | `text-gray-300` | Labels de formulário |
| **Placeholders** | `placeholder:text-gray-600` | Inputs |

### Copy Provocativo

**Características:**
- Curto (máximo 2 frases)
- Sensorial ("aquecem", "clima")
- Sugestivo, não explícito
- Sem emojis (exceto pimenta do logo)
- Evitar superlativos ("incrível", "fantástico")

**Exemplos:**

✅ **BOM:**
- "Nem todo limite precisa ser explicado"
- "Cartas que aquecem. Decisões que mudam o clima."
- "Você decide até onde vai"
- "Virar a Primeira Carta"

❌ **RUIM:**
- "Crie sua conta grátis agora!"
- "O jogo mais incrível para casais!"
- "80+ cartas divertidas"
- "Cadastre-se"

---

## 🌶️ Logo & Ícones

### Pepper Icon (Temporário - Emoji)

```tsx
<span className="text-5xl drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">
  🌶️
</span>
```

**Com animação:**
```tsx
<div className="relative">
  {/* Outer glow */}
  <div className="absolute inset-0 -m-12">
    <div className="w-full h-full rounded-full bg-red-600/40 blur-3xl animate-breathe-glow" />
  </div>

  {/* Inner pulse */}
  <div className="absolute inset-0 animate-pulse">
    <span className="text-7xl opacity-30 blur-2xl">🌶️</span>
  </div>

  {/* Main icon */}
  <span className="relative text-7xl animate-heat-shimmer">🌶️</span>
</div>
```

### PWA Icon

**Localização:** `/public/icon.svg`

**Configuração no manifest:**
```json
{
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ]
}
```

---

## 📐 Spacing & Layout

### Containers

```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 lg:py-28">
```

**Características:**
- Max width: `6xl` (1152px)
- Padding horizontal: `4` mobile → `6` desktop
- Padding vertical: `12` mobile → `20` tablet → `28` desktop

### Section Spacing

| Elemento | Classes | Gap |
|----------|---------|-----|
| **Hero → Features** | `mb-16 md:mb-24 lg:mb-32` | 64→96→128px |
| **Features → Social Proof** | `mb-16 md:mb-24` | 64→96px |
| **Entre Cards** | `gap-6 md:gap-8 lg:gap-10` | 24→32→40px |

### Card Padding

```tsx
<CardHeader className="space-y-4 pb-4">
<CardContent className="pb-10">
```

---

## 🎯 Hierarquia Visual

### Ordem de Atenção (Landing Page)

1. **Pepper icon** com glow (maior destaque visual)
2. **Headline** em branco bold
3. **CTA principal** com breathing effect
4. **Features** em grid
5. **Social proof** discreto
6. **CTA final** reforço

### Contrast Ratios

- **Branco sobre preto:** WCAG AAA ✅
- **Gray-400 sobre preto:** WCAG AA ✅
- **Red-600 buttons:** Alto contraste ✅

---

## 📱 Responsividade

### Breakpoints

| Breakpoint | Tailwind | Largura |
|------------|----------|---------|
| **Mobile** | (default) | < 640px |
| **Tablet** | `sm:` | ≥ 640px |
| **Desktop** | `md:` | ≥ 768px |
| **Large** | `lg:` | ≥ 1024px |

### Padrões Responsivos

**Text:**
```tsx
className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
```

**Spacing:**
```tsx
className="mb-16 md:mb-24 lg:mb-32"
```

**Layout:**
```tsx
className="grid grid-cols-1 md:grid-cols-3"
```

**Button:**
```tsx
className="flex flex-col sm:flex-row gap-4 md:gap-6"
```

---

## 🚫 Anti-Patterns (O que NÃO fazer)

### ❌ Cores
- Usar pink, purple, ou tons pastéis
- Background branco ou claro
- Gradientes rainbow ou multicoloridos

### ❌ Tipografia
- Usar emojis além da pimenta 🌶️
- Comic Sans ou fontes decorativas
- ALL CAPS em parágrafos
- Textos muito longos (máx 2-3 linhas)

### ❌ Copy
- Explicar demais ("80+ cartas com perguntas...")
- Usar "grátis", "incrível", "fantástico"
- CTAs genéricos ("Cadastre-se", "Saiba mais")
- Tom infantil ou muito descontraído

### ❌ Layout
- Cards muito próximos (mín 24px gap)
- Elementos sem breathing room
- Muitos elementos competindo por atenção
- Animações rápidas ou agressivas

### ❌ Interações
- Transições < 300ms (muito rápido)
- Animações que distraem da leitura
- Hover states muito sutis (devem ser perceptíveis)
- Loading states sem feedback visual

---

## ✅ Checklist de Qualidade

Antes de commitar mudanças visuais, verificar:

- [ ] Background é preto absoluto (`bg-black`)
- [ ] Film grain texture aplicado
- [ ] Red halo glow presente
- [ ] Sem uso de pink/purple
- [ ] Inputs dark com border vermelho
- [ ] Botões com glow shadow
- [ ] Copy provocativo e curto
- [ ] Animações lentas (≥ 500ms)
- [ ] Responsive em mobile/tablet/desktop
- [ ] Alto contraste (WCAG AA mínimo)

---

## 📦 Componentes Futuros

**To-do:**
- [ ] Criar `<Logo />` component reutilizável
- [ ] Criar `<DarkCard />` component
- [ ] Criar `<RedButton />` component
- [ ] Adicionar logo PNG/SVG real (substituir emoji)
- [ ] Criar página 404 com dark theme
- [ ] Aplicar theme no dashboard (opcional)

---

## 🔄 Versionamento

| Versão | Data | Mudanças |
|--------|------|----------|
| **1.0** | 2024-12 | Identidade inicial dark/red baseada no logo |

---

**Última atualização:** 2024-12
**Mantido por:** Claude Code
**Status:** ✅ Produção
