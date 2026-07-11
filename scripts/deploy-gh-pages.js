const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const docs = path.join(root, 'docs');
const temp = path.join(root, '.gh-pages-deploy');

require('./prepare-deploy.js');

if (fs.existsSync(temp)) fs.rmSync(temp, { recursive: true, force: true });
fs.mkdirSync(temp, { recursive: true });

for (const entry of fs.readdirSync(docs)) {
  const src = path.join(docs, entry);
  const dest = path.join(temp, entry);
  fs.cpSync(src, dest, { recursive: true });
}

process.chdir(temp);
execSync('git init -b gh-pages', { stdio: 'inherit' });
execSync('git add -A', { stdio: 'inherit' });
execSync('git commit -m "Deploy GitHub Pages app movil Art Cuadros"', { stdio: 'inherit' });
execSync('git remote add origin https://github.com/SERGIOIVORRA/APP-ARTCUADROS-MOVIL.git', { stdio: 'inherit' });
execSync('git push -f origin gh-pages', { stdio: 'inherit' });

fs.rmSync(temp, { recursive: true, force: true });
console.log('GitHub Pages publicado en rama gh-pages');
