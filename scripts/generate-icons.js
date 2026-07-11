const sharp = require('sharp');
const path = require('path');

const source = path.join(__dirname, '../icons/logo-source.webp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  for (const size of sizes) {
    await sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 26, alpha: 1 } })
      .png()
      .toFile(path.join(__dirname, `../icons/icon-${size}.png`));
  }

  await sharp(source)
    .resize(180, 180, { fit: 'contain', background: { r: 26, g: 26, b: 26, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, '../icons/apple-touch-icon.png'));

  console.log('Iconos generados correctamente');
}

generate().catch(console.error);
