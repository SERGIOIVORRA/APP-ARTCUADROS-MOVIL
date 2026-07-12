const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const androidDir = path.join(root, 'android');
const keystore = path.join(androidDir, 'android.keystore');

if (!fs.existsSync(androidDir)) {
  console.error('No existe android/. Ejecuta primero: npm run android:init');
  process.exit(1);
}

if (!fs.existsSync(keystore)) {
  console.log('Generando keystore (guarda la contraseña en lugar seguro)...');
  execSync(
    `keytool -genkeypair -v -keystore "${keystore}" -alias artcuadros -keyalg RSA -keysize 2048 -validity 10000 -storepass artcuadros2026 -keypass artcuadros2026 -dname "CN=Art Cuadros, OU=Mobile, O=ArtCuadros, L=Alicante, ST=Alicante, C=ES"`,
    { stdio: 'inherit' }
  );
  console.log('\nIMPORTANTE: Cambia la contraseña del keystore en android/twa-manifest.json');
  console.log('Ejecuta: npm run android:fingerprint');
}

console.log('Compilando AAB para Play Store...');
execSync('npx --yes @bubblewrap/cli@latest build', { stdio: 'inherit', cwd: androidDir });

const aab = path.join(androidDir, 'app-release-bundle.aab');
if (fs.existsSync(aab)) {
  console.log('\nListo. Sube este archivo a Google Play Console:');
  console.log(aab);
} else {
  console.log('\nBusca el .aab en android/app/build/outputs/bundle/release/');
}
