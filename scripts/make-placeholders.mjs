/*
 * One-off helper that generated the placeholder images in src/assets/photos/.
 * Safe to delete once real photographs replace them.
 *
 * Usage: node scripts/make-placeholders.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'src/assets/photos';

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function stars(w, h, count, seed, { maxR = 1.6, minY = 0, maxY = h } = {}) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = minY + rand() * (maxY - minY);
    const r = 0.4 + rand() * maxR;
    const o = 0.3 + rand() * 0.7;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="white" opacity="${o.toFixed(2)}"/>`;
  }
  return out;
}

function ridge(w, h, baseY, jag, seed, fill) {
  const rand = rng(seed);
  const pts = [`0,${h}`];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i;
    const y = baseY + (rand() - 0.5) * 2 * jag;
    pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
  }
  pts.push(`${w},${h}`);
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}

function svg(w, h, body) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
}

const scenes = [
  // ——— Antarctica astrophotography ———
  {
    album: 'antarctica-astro',
    file: '01-aurora-over-the-ice.jpg',
    w: 2400, h: 1600,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#020308"/><stop offset="1" stop-color="#071018"/>
        </linearGradient>
        <linearGradient id="aur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#39ff9e" stop-opacity="0"/>
          <stop offset="0.55" stop-color="#2be08a" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#0a5f4a" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      ${stars(w, h, 340, 7, { maxY: h * 0.78 })}
      <path d="M-100 200 C 500 80, 900 480, 1400 300 S 2300 120, 2600 360 L 2600 900 C 1900 700, 1300 980, 600 820 S -50 700, -100 760 Z" fill="url(#aur)"/>
      <path d="M-100 420 C 600 300, 1100 620, 1700 480 S 2400 320, 2600 520 L 2600 980 C 1800 840, 1200 1060, 500 940 S -50 860, -100 900 Z" fill="url(#aur)" opacity="0.6"/>
      ${ridge(w, h, h * 0.84, 30, 11, '#dfe6ec')}
      <rect y="${h * 0.9}" width="${w}" height="${h * 0.1}" fill="#e7edf2"/>
    `,
  },
  {
    album: 'antarctica-astro',
    file: '02-milky-way-south.jpg',
    w: 1600, h: 2400,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#03040a"/><stop offset="1" stop-color="#0a0d1a"/>
        </linearGradient>
        <linearGradient id="mw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#c9d4ff" stop-opacity="0"/>
          <stop offset="0.5" stop-color="#dfe4ff" stop-opacity="0.28"/>
          <stop offset="1" stop-color="#c9d4ff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      <polygon points="200,-100 800,-100 1700,2100 1100,2100" fill="url(#mw)"/>
      ${stars(w, h, 700, 23, { maxY: h * 0.86 })}
      ${stars(w, h, 250, 41, { maxR: 2.4, maxY: h * 0.86 })}
      ${ridge(w, h, h * 0.9, 40, 5, '#0e1116')}
    `,
  },
  {
    album: 'antarctica-astro',
    file: '03-star-trails.jpg',
    w: 2400, h: 1600,
    body: (w, h) => {
      const cx = w * 0.5, cy = h * 0.42, rand = rng(77);
      let arcs = '';
      for (let i = 0; i < 90; i++) {
        const r = 30 + rand() * 900;
        const start = rand() * 360;
        const sweep = 24 + rand() * 30;
        const a1 = (start * Math.PI) / 180, a2 = ((start + sweep) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
        const o = 0.25 + rand() * 0.6;
        arcs += `<path d="M ${x1.toFixed(0)} ${y1.toFixed(0)} A ${r.toFixed(0)} ${r.toFixed(0)} 0 0 1 ${x2.toFixed(0)} ${y2.toFixed(0)}" stroke="white" stroke-width="1.6" fill="none" opacity="${o.toFixed(2)}"/>`;
      }
      return `
        <rect width="${w}" height="${h}" fill="#04050a"/>
        ${arcs}
        ${ridge(w, h, h * 0.86, 26, 31, '#dde4ea')}
        <rect y="${h * 0.92}" width="${w}" height="${h * 0.08}" fill="#e5ebf0"/>
      `;
    },
  },
  {
    album: 'antarctica-astro',
    file: '04-iceberg-night.jpg',
    w: 2400, h: 1600,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#04060e"/><stop offset="1" stop-color="#0c1626"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      ${stars(w, h, 300, 13, { maxY: h * 0.6 })}
      <circle cx="${w * 0.78}" cy="${h * 0.22}" r="46" fill="#eef2f6" opacity="0.95"/>
      <polygon points="500,1120 700,760 860,900 1000,700 1180,1120" fill="#9fb4c8" opacity="0.9"/>
      <polygon points="1500,1120 1680,880 1840,1000 1980,860 2120,1120" fill="#7e94a8" opacity="0.8"/>
      <rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="#060b14"/>
      <rect y="${h * 0.7}" width="${w}" height="8" fill="#31465c"/>
      <polygon points="500,1120 700,1480 1000,1120" fill="#22303e" opacity="0.5"/>
      <polygon points="1500,1120 1760,1420 2120,1120" fill="#1b2733" opacity="0.5"/>
    `,
  },

  // ——— Patagonia ———
  {
    album: 'patagonia',
    file: '01-towers-at-dawn.jpg',
    w: 2400, h: 1600,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2b1d3a"/><stop offset="0.6" stop-color="#c4553a"/><stop offset="1" stop-color="#e8a05c"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      <polygon points="760,1100 900,300 990,1100" fill="#3a2b33"/>
      <polygon points="960,1100 1120,180 1250,1100" fill="#46333a"/>
      <polygon points="1230,1100 1380,340 1500,1100" fill="#3a2b33"/>
      ${ridge(w, h, h * 0.68, 60, 9, '#241a24')}
      ${ridge(w, h, h * 0.82, 40, 17, '#150f16')}
    `,
  },
  {
    album: 'patagonia',
    file: '02-glacier-lake.jpg',
    w: 2400, h: 1600,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8fa8bd"/><stop offset="1" stop-color="#d8e2ea"/>
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3e7f96"/><stop offset="1" stop-color="#1e4552"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      ${ridge(w, h * 0.66, h * 0.34, 110, 3, '#5a6a7a')}
      ${ridge(w, h * 0.66, h * 0.52, 60, 29, '#39434f')}
      <rect y="${h * 0.66}" width="${w}" height="${h * 0.34}" fill="url(#lake)"/>
      ${ridge(w, h, h * 0.94, 18, 37, '#122028')}
    `,
  },
  {
    album: 'patagonia',
    file: '03-cuernos-storm.jpg',
    w: 1600, h: 2400,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#232b36"/><stop offset="1" stop-color="#5d6b7a"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      <ellipse cx="${w * 0.3}" cy="${h * 0.2}" rx="500" ry="140" fill="#161d26" opacity="0.7"/>
      <ellipse cx="${w * 0.75}" cy="${h * 0.3}" rx="420" ry="120" fill="#10161e" opacity="0.7"/>
      <polygon points="300,1700 620,700 780,1050 900,850 1250,1700" fill="#2c333c"/>
      ${ridge(w, h, h * 0.74, 70, 19, '#1c222a')}
      ${ridge(w, h, h * 0.88, 40, 43, '#0f1319')}
    `,
  },
  {
    album: 'patagonia',
    file: '04-last-light.jpg',
    w: 2400, h: 1600,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1a1430"/><stop offset="0.7" stop-color="#7a3048"/><stop offset="1" stop-color="#d4694e"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      <circle cx="${w * 0.62}" cy="${h * 0.6}" r="90" fill="#f3b06a" opacity="0.9"/>
      ${ridge(w, h, h * 0.62, 90, 51, '#301c2c')}
      ${ridge(w, h, h * 0.78, 60, 53, '#1f1220')}
      ${ridge(w, h, h * 0.9, 30, 55, '#120a14')}
    `,
  },

  // ——— Nepal ———
  {
    album: 'nepal',
    file: '01-gold-on-the-summit.jpg',
    w: 2400, h: 1600,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#16233c"/><stop offset="1" stop-color="#7f97b8"/>
        </linearGradient>
        <linearGradient id="peak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f0c069"/><stop offset="0.4" stop-color="#d8dde6"/><stop offset="1" stop-color="#8b98a8"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      <polygon points="500,1250 1200,220 1900,1250" fill="url(#peak)"/>
      <polygon points="900,1250 1200,220 1350,1250" fill="#6d7b8c" opacity="0.45"/>
      ${ridge(w, h, h * 0.8, 60, 61, '#2a3648')}
      ${ridge(w, h, h * 0.92, 30, 67, '#161e2b')}
    `,
  },
  {
    album: 'nepal',
    file: '02-high-pass.jpg',
    w: 2400, h: 1600,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a5678"/><stop offset="1" stop-color="#b9c9d9"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      ${ridge(w, h, h * 0.4, 130, 71, '#8fa1b4')}
      ${ridge(w, h, h * 0.58, 90, 73, '#5f7288')}
      ${ridge(w, h, h * 0.74, 60, 79, '#3c4c60')}
      ${ridge(w, h, h * 0.88, 30, 83, '#222d3c')}
    `,
  },
  {
    album: 'nepal',
    file: '03-moonrise-himalaya.jpg',
    w: 1600, h: 2400,
    body: (w, h) => `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#060a16"/><stop offset="1" stop-color="#1d2c48"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      ${stars(w, h, 320, 89, { maxY: h * 0.6 })}
      <circle cx="${w * 0.66}" cy="${h * 0.24}" r="70" fill="#eef1f5"/>
      <polygon points="200,1900 800,700 1400,1900" fill="#aebccb"/>
      <polygon points="620,1900 800,700 930,1900" fill="#7a8a9c" opacity="0.5"/>
      ${ridge(w, h, h * 0.85, 50, 97, '#0d1420')}
    `,
  },
];

for (const scene of scenes) {
  const dir = path.join(OUT, scene.album);
  await mkdir(dir, { recursive: true });
  const buffer = svg(scene.w, scene.h, scene.body(scene.w, scene.h));
  await sharp(buffer)
    .jpeg({ quality: 74, mozjpeg: true })
    .toFile(path.join(dir, scene.file));
  console.log('wrote', path.join(dir, scene.file));
}
