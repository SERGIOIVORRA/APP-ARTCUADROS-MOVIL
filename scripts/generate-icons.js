const sharp = require('sharp');
const path = require('path');

const source = path.join(__dirname, '../icons/logo-artcuadros.png');
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  for (const size of sizes) {
    await sharp(source)
      .resize(size, size, { fit: 'contain', background: white })
      .png()
      .toFile(path.join(__dirname, `../icons/icon-${size}.png`));
  }

  await sharp(source)
    .resize(180, 180, { fit: 'contain', background: white })
    .png()
    .toFile(path.join(__dirname, '../icons/apple-touch-icon.png'));

  await sharp(source)
    .resize(512, 512, { fit: 'contain', background: white })
    .png()
    .toFile(path.join(__dirname, '../icons/splash-logo.png'));

  console.log('Iconos y portada generados correctamente');
}

generate().catch(console.error);
