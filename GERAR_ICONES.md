# 🎨 Como Gerar os Ícones do PWA

Este guia explica como gerar todos os ícones necessários para o Progressive Web App (PWA) do APIMENTADAS usando a imagem da pimenta.

## 📋 Pré-requisitos

A biblioteca `sharp` já está instalada nas dependências de desenvolvimento.

## 🚀 Passos

### 1. Salvar a Imagem Fonte

Salve a imagem da pimenta (a que você enviou no chat) como:

```
public/app-icon-source.png
```

**Importante:**
- A imagem deve ser PNG
- Recomenda-se que seja quadrada (mesmo width e height)
- Tamanho mínimo recomendado: 512x512px
- Fundo transparente é ideal

### 2. Executar o Script

No terminal, execute:

```bash
node scripts/generate-icons.js
```

### 3. Resultado

O script irá gerar automaticamente:

**Ícones do PWA** (pasta `public/icons/`):
- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png
- ✅ icon-384x384.png
- ✅ icon-512x512.png

**Favicons e Apple Touch Icon** (pasta `public/`):
- ✅ favicon-16x16.png
- ✅ favicon-32x32.png
- ✅ apple-touch-icon.png (180x180)

### 4. Verificar

Após gerar os ícones:

1. **Commit e Push:**
   ```bash
   git add public/icons/ public/apple-touch-icon.png public/favicon-*.png
   git commit -m "feat: adicionar ícones do PWA com logo da pimenta"
   git push
   ```

2. **Testar PWA:**
   - Abra o app no celular
   - Vá em Configurações → "Adicionar à Tela Inicial"
   - O ícone da pimenta deve aparecer!

## 🎯 Arquivos já Configurados

Os seguintes arquivos já estão configurados para usar os novos ícones:

- ✅ `public/manifest.json` - Configurado com todos os tamanhos
- ✅ `app/layout.tsx` - Meta tags e favicons atualizados

## 🔧 Troubleshooting

**Erro: "Imagem fonte não encontrada"**
- Certifique-se de que salvou a imagem como `public/app-icon-source.png`
- Verifique se o arquivo existe: `ls -la public/app-icon-source.png`

**Ícones não aparecem no PWA:**
- Limpe o cache do navegador
- Desinstale e reinstale o PWA no celular
- Verifique se o deploy foi concluído com sucesso

## 📱 Testar no Celular

### Android
1. Abra o site no Chrome
2. Menu → "Adicionar à tela inicial"
3. Confirme
4. O ícone da pimenta aparecerá na tela inicial

### iOS (iPhone/iPad)
1. Abra o site no Safari
2. Toque no botão "Compartilhar" (quadrado com seta)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Confirme
5. O ícone da pimenta aparecerá na tela inicial

---

🌶️ **APIMENTADAS** - Cartas que aquecem!
