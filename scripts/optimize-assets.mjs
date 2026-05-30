import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');

async function optimizeLogo() {
  const input = path.join(root, 'src/assets/dhyaan-logo.png');
  const output = path.join(root, 'public/brand-logo.webp');
  await sharp(input)
    .resize(128, 128, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(output);
  const stat = await fs.stat(output);
  console.log(`brand-logo.webp -> ${Math.round(stat.size / 1024)} KB`);
}

async function optimizeDeities() {
  const dir = path.join(root, 'src/assets/deities');
  const files = (await fs.readdir(dir)).filter((name) => name.endsWith('.png'));

  for (const file of files) {
    const input = path.join(dir, file);
    const output = path.join(dir, file.replace(/\.png$/i, '.webp'));
    await sharp(input)
      .resize(480, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(output);
    const stat = await fs.stat(output);
    console.log(`${path.basename(output)} -> ${Math.round(stat.size / 1024)} KB`);
  }
}

await optimizeLogo();
await optimizeDeities();
console.log('Asset optimization complete.');
