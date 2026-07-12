const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const androidDir = path.join(root, 'android');
const manifestUrl = 'https://sergioivorra.github.io/APP-ARTCUADROS-MOVIL/manifest.webmanifest';

console.log('Inicializando proyecto Android TWA con Bubblewrap...');

if (!fs.existsSync(androidDir)) fs.mkdirSync(androidDir, { recursive: true });

try {
  execSync(
    `npx --yes @bubblewrap/cli@latest init --manifest "${manifestUrl}" --directory "${androidDir}" --chromeosonly false --yes`,
    { stdio: 'inherit', cwd: root, env: { ...process.env, CI: 'true' } }
  );
} catch (err) {
  console.log('\nBubblewrap init requiere JDK 17. Instala Java y vuelve a ejecutar: npm run android:init');
  process.exit(1);
}

console.log('\nProyecto Android creado en android/');
