const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const keystore = path.join(__dirname, '../android/android.keystore');
const assetlinks = path.join(__dirname, '../.well-known/assetlinks.json');

if (!fs.existsSync(keystore)) {
  console.error('No existe android/android.keystore. Ejecuta: npm run android:build');
  process.exit(1);
}

const out = execSync(
  'keytool -list -v -keystore android/android.keystore -alias artcuadros -storepass artcuadros2026 -keypass artcuadros2026',
  { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
);

const match = out.match(/SHA256:\s*([^\n]+)/);
if (!match) {
  console.error('No se encontró SHA256 en el keystore');
  process.exit(1);
}

const sha256 = match[1].trim();
console.log('\nSHA256 del certificado (copia esto):\n');
console.log(sha256);

const json = JSON.parse(fs.readFileSync(assetlinks, 'utf8'));
json[0].target.sha256_cert_fingerprints = [sha256];
fs.writeFileSync(assetlinks, JSON.stringify(json, null, 2) + '\n');
console.log('\nActualizado .well-known/assetlinks.json');
console.log('Ahora ejecuta: npm run deploy:github');
