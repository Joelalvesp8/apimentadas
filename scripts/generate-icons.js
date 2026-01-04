const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_SVG = path.join(__dirname, '../public/app-icon-source.svg');
const SOURCE_PNG = path.join(__dirname, '../public/app-icon-source.png');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Determine which source to use
let SOURCE_IMAGE;
if (fs.existsSync(SOURCE_SVG)) {
  SOURCE_IMAGE = SOURCE_SVG;
  console.log('📌 Usando SVG como fonte');
} else if (fs.existsSync(SOURCE_PNG)) {
  SOURCE_IMAGE = SOURCE_PNG;
  console.log('📌 Usando PNG como fonte');
} else {
  SOURCE_IMAGE = null;
}

// Icon sizes needed for PWA
const SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Additional icons
const ADDITIONAL_ICONS = [
  { size: 180, name: 'apple-touch-icon.png', dir: '../public' }, // Apple touch icon
  { size: 32, name: 'favicon-32x32.png', dir: '../public' },
  { size: 16, name: 'favicon-16x16.png', dir: '../public' },
];

async function generateIcons() {
  try {
    // Check if source image exists
    if (!SOURCE_IMAGE) {
      console.error('❌ Imagem fonte não encontrada!');
      console.log('📋 Por favor, salve a imagem da pimenta como:');
      console.log('   public/app-icon-source.png (PNG)');
      console.log('   OU');
      console.log('   public/app-icon-source.svg (SVG)');
      process.exit(1);
    }

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(ICONS_DIR)) {
      fs.mkdirSync(ICONS_DIR, { recursive: true });
    }

    console.log('🎨 Gerando ícones do PWA...\n');

    // Generate PWA icons
    for (const { size, name } of SIZES) {
      const outputPath = path.join(ICONS_DIR, name);
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'cover', // Use 'cover' to fill entire area
          position: 'center',
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ Gerado: ${name} (${size}x${size})`);
    }

    // Generate additional icons
    for (const { size, name, dir } of ADDITIONAL_ICONS) {
      const outputPath = path.join(__dirname, dir, name);
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'cover', // Use 'cover' to fill entire area
          position: 'center',
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ Gerado: ${name} (${size}x${size})`);
    }

    console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
    console.log('📁 Ícones salvos em: public/icons/');
    console.log('🍎 Apple touch icon: public/apple-touch-icon.png');
    console.log('⭐ Favicons: public/favicon-*.png');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    process.exit(1);
  }
}

generateIcons();
