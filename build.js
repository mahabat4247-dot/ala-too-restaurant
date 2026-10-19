/* Builds the static site into dist/.
   - Copies index.html and favicon.svg.
   - Copies styles.css and script.js with a content hash in the file name
     (for long-lived caching) and rewrites the references in index.html.
   - Fails loudly if anything expected is missing. */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = import.meta.dirname;
const dist = join(root, 'dist');

const hashedAssets = ['styles.css', 'script.js'];
const plainAssets = ['favicon.svg'];

function fail(message) {
  console.error(`Build failed: ${message}`);
  process.exit(1);
}

for (const file of ['index.html', ...hashedAssets, ...plainAssets]) {
  if (!existsSync(join(root, file))) {
    fail(`missing source file ${file}`);
  }
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

let html = readFileSync(join(root, 'index.html'), 'utf8');

for (const file of hashedAssets) {
  const content = readFileSync(join(root, file));
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 10);
  const dot = file.lastIndexOf('.');
  const hashedName = `${file.slice(0, dot)}.${hash}${file.slice(dot)}`;
  writeFileSync(join(dist, hashedName), content);

  const reference = `"${file}"`;
  if (!html.includes(reference)) {
    fail(`index.html does not reference ${file}`);
  }
  html = html.replaceAll(reference, `"${hashedName}"`);
}

for (const file of plainAssets) {
  cpSync(join(root, file), join(dist, file));
}

writeFileSync(join(dist, 'index.html'), html);

for (const file of ['index.html', ...plainAssets]) {
  if (!existsSync(join(dist, file))) {
    fail(`dist/${file} was not created`);
  }
}

console.log('Build complete: dist/');
