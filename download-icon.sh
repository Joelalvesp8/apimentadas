#!/bin/bash
# Script para baixar a imagem do ícone

# Exemplo de uso:
# ./download-icon.sh "https://url-da-imagem.png"

if [ -z "$1" ]; then
  echo "❌ Erro: Forneça a URL da imagem"
  echo "Uso: ./download-icon.sh 'https://url-da-imagem.png'"
  exit 1
fi

URL="$1"
OUTPUT="public/app-icon-source.png"

echo "📥 Baixando imagem de: $URL"
curl -L "$URL" -o "$OUTPUT"

if [ -f "$OUTPUT" ]; then
  echo "✅ Imagem salva em: $OUTPUT"
  echo ""
  echo "🎨 Gerando ícones do PWA..."
  node scripts/generate-icons.js
else
  echo "❌ Erro ao baixar imagem"
  exit 1
fi
