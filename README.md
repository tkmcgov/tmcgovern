# tmcgovern.me — photography portfolio

Landscape & astrophotography portfolio for Terrance McGovern. Built with
[Astro 5](https://astro.build), Tailwind CSS 4, and deployed to Cloudflare Workers.

## For Terrance — how to run the site

### Adding a new album

Albums are just folders. To add one:

1. Create a folder under `src/assets/photos/` — the folder name becomes the web
   address, so `src/assets/photos/iceland/` becomes `tmcgovern.me/galleries/iceland/`.
   Use lowercase letters and dashes (e.g. `new-zealand`).
2. Drop your JPEG photos into the folder. That's it — the gallery page, the
   thumbnails, and the lightbox are all generated automatically on the next deploy.
   Photos appear in alphabetical order by filename, so name them `01-...jpg`,
   `02-...jpg` if you care about the order.

### The optional `album.txt` file

Each album folder can contain a plain text file named `album.txt` with one
`key: value` per line:

```
title: Iceland
description: A week chasing waterfalls and black-sand beaches.
featured: yes
cover: 03-skogafoss.jpg

01-gullfoss.jpg: Gullfoss in morning mist.
```

- `title:` — the display name (otherwise the folder name is prettified, e.g.
  `new-zealand` → "New Zealand").
- `description:` — a sentence or two shown on the gallery pages.
- `featured: yes` — gives the album top billing on the Galleries page.
- `section: earlier` — puts the album in the "Earlier Travels" section of the
  Galleries page; without it, albums appear under "The Good Camera".
- `hidden: yes` — keeps the album out of the Galleries entirely (used by the
  Trigger and Foster Dogs photo sets, which have their own page).
- `cover:` — which photo to use as the album's cover (otherwise the first one).
- `some-photo.jpg: A caption.` — sets the caption shown under that photo (or
  video).

Everything is optional; an album works fine with no `album.txt` at all.

### Videos

Albums can also contain short self-hosted videos: upload `.mp4` files (H.264,
the normal phone export format) into the album folder alongside the photos.
They play right in the gallery grid, ordered with the photos by filename, and
can be captioned in `album.txt` the same way. Keep each video **under 25 MB**
— that's a hard limit of both GitHub's uploader and Cloudflare's hosting —
which in practice means trimming clips short and exporting at 1080p.

### Photo sizes — important

Upload **web-sized JPEGs, roughly 3000 px on the long edge**, not RAW files or
full-resolution exports. The site automatically generates all the smaller
responsive sizes and modern formats (AVIF/WebP) from what you upload, so
3000 px is plenty for crisp full-screen viewing — while keeping builds fast and
the repository small. In most photo apps this is an "Export for web" or
"resize on export" option (JPEG, quality ~80, long edge 3000).

### The print-interest form

The form on the Prints page is powered by [Web3Forms](https://web3forms.com) —
a free service that emails form submissions to you. It needs a one-time setup:

1. Go to **web3forms.com** and enter your email address — no account or
   password needed.
2. They email you an **Access Key** (a long code like `a1b2c3d4-...`).
3. Open `src/pages/prints.astro` and replace `YOUR_ACCESS_KEY_HERE` with that key.

Until the key is in place the form will show an error when submitted. The key
is safe to have in public code — it only lets people send you form emails.

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # build + serve locally via wrangler
npm run deploy   # build + deploy to Cloudflare Workers
```

Requires Node 22 (see `.nvmrc`).
