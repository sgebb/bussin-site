// Generates WebP variants of the large screenshots, the social share card,
// and PNG icons. Run from the repo root:  node scripts/build-images.mjs
// Requires `sharp` (npm install --no-save sharp).
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const media = 'assets/media';
const screens = [
  'single-blade-view-bussin-auto-forwarding',
  'advancedPeek',
  'confirmPurge',
  'deadLetterInspect',
];

for (const name of screens) {
  for (const width of [1600, 900]) {
    await sharp(`${media}/${name}.jpg`)
      .resize({ width })
      .webp({ quality: 80 })
      .toFile(`${media}/${name}-${width}.webp`);
  }
}

// Icons: the logo is a single-colour SVG drawn with currentColor.
const logo = readFileSync('assets/favicon.svg', 'utf8')
  .replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g, '')
  .replace('fill="currentColor"', 'fill="#22c2b7"');

const iconSvg = (size, pad) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#070b14"/>
</svg>`);

for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-512.png', 512]]) {
  const inner = Math.round(size * 0.68);
  const mark = await sharp(Buffer.from(logo)).resize(inner, inner).png().toBuffer();
  await sharp(iconSvg(size))
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(`assets/${file}`);
}

// Social card, 1200x630.
const W = 1200, H = 630;
const bg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="0.85" cy="0.1" r="0.9">
      <stop offset="0" stop-color="#22c2b7" stop-opacity="0.35"/>
      <stop offset="0.6" stop-color="#22c2b7" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#070b14"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="72" y="150" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-size="22" letter-spacing="3" fill="#22c2b7">BUSSIN.DEV</text>
  <text font-family="'Segoe UI', 'DejaVu Sans', Arial, sans-serif" font-weight="700" font-size="60" fill="#f4f8fb" letter-spacing="-1">
    <tspan x="72" y="235">Azure Service Bus</tspan>
    <tspan x="72" y="305">Explorer, right in</tspan>
    <tspan x="72" y="375" fill="#2fe0d2">your browser.</tspan>
  </text>
  <text font-family="'Segoe UI', 'DejaVu Sans', Arial, sans-serif" font-size="25" fill="#a9bccd">
    <tspan x="72" y="450">Peek, search, resubmit and purge messages.</tspan>
    <tspan x="72" y="488">No install. No backend. Free.</tspan>
  </text>
</svg>`);

const shotW = 560;
const shot = await sharp(`${media}/single-blade-view-bussin-auto-forwarding.jpg`)
  .resize({ width: shotW })
  .toBuffer();
const shotH = Math.round(shotW * 1500 / 2400);
const mask = Buffer.from(`<svg width="${shotW}" height="${shotH}"><rect width="${shotW}" height="${shotH}" rx="14" fill="#fff"/></svg>`);
const rounded = await sharp(shot).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${shotW + 2}" height="${shotH + 2}"><rect x="0.5" y="0.5" width="${shotW + 1}" height="${shotH + 1}" rx="15" fill="none" stroke="#22c2b7" stroke-opacity="0.5"/></svg>`);

await sharp(bg)
  .composite([
    { input: rounded, left: W - shotW - 40, top: Math.round((H - shotH) / 2) + 30 },
    { input: frame, left: W - shotW - 41, top: Math.round((H - shotH) / 2) + 29 },
  ])
  .jpeg({ quality: 86 })
  .toFile(`${media}/og-card.jpg`);

console.log('done');
