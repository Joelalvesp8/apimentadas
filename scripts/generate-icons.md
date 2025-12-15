# Geração de Ícones PWA

## Método 1: Online (Recomendado)

Use uma ferramenta online para converter o SVG em múltiplos tamanhos:

1. Acesse: https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
2. Upload o arquivo `public/icon.svg`
3. Baixe o pacote de ícones
4. Extraia para `public/icons/`

## Método 2: Usando ImageMagick (CLI)

```bash
# Instalar ImageMagick
sudo apt-get install imagemagick

# Converter SVG para PNG em múltiplos tamanhos
cd public
mkdir -p icons

convert icon.svg -resize 72x72 icons/icon-72x72.png
convert icon.svg -resize 96x96 icons/icon-96x96.png
convert icon.svg -resize 128x128 icons/icon-128x128.png
convert icon.svg -resize 144x144 icons/icon-144x144.png
convert icon.svg -resize 152x152 icons/icon-152x152.png
convert icon.svg -resize 192x192 icons/icon-192x192.png
convert icon.svg -resize 384x384 icons/icon-384x384.png
convert icon.svg -resize 512x512 icons/icon-512x512.png
```

## Método 3: Usando Sharp (Node.js)

```javascript
// scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

sizes.forEach(async (size) => {
  await sharp('public/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
});
```

Execute:
```bash
npm install sharp
node scripts/generate-icons.js
```

## Favicon

Para criar o favicon.ico:
```bash
convert public/icon.svg -resize 32x32 public/favicon.ico
```
