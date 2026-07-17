import type { ImageMetadata } from 'astro';

export interface Photo {
  /** filename inside the album folder, e.g. "01-aurora.jpg" */
  file: string;
  image: ImageMetadata;
  caption?: string;
}

export interface Album {
  /** folder name, used in the URL: /galleries/<slug>/ */
  slug: string;
  title: string;
  description?: string;
  /** featured albums get top billing on the Galleries page */
  featured: boolean;
  cover: ImageMetadata;
  photos: Photo[];
}

/*
 * Every image dropped into src/assets/photos/<album-folder>/ is picked up
 * here at build time — no code changes needed to add albums or photos.
 */
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

/*
 * Optional metadata: a plain-text file named album.txt inside an album folder.
 * Lines are "key: value". Special keys: title, description, cover, featured.
 * Any key that matches a photo's filename becomes that photo's caption.
 */
const textModules = import.meta.glob<string>('../assets/photos/*/album.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function parseAlbumText(raw: string): Map<string, string> {
  const entries = new Map<string, string>();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    entries.set(trimmed.slice(0, colon).trim().toLowerCase(), trimmed.slice(colon + 1).trim());
  }
  return entries;
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildAlbums(): Album[] {
  const bySlug = new Map<string, Photo[]>();

  for (const [path, mod] of Object.entries(imageModules)) {
    const parts = path.split('/');
    const slug = parts[parts.length - 2]!;
    const file = parts[parts.length - 1]!;
    const photos = bySlug.get(slug) ?? [];
    photos.push({ file, image: mod.default });
    bySlug.set(slug, photos);
  }

  const albums: Album[] = [];

  for (const [slug, photos] of bySlug) {
    photos.sort((a, b) => a.file.localeCompare(b.file));

    const textPath = Object.keys(textModules).find((p) => p.includes(`/${slug}/album.txt`));
    const meta = textPath ? parseAlbumText(textModules[textPath]!) : new Map<string, string>();

    for (const photo of photos) {
      const caption = meta.get(photo.file.toLowerCase());
      if (caption) photo.caption = caption;
    }

    const coverFile = meta.get('cover')?.toLowerCase();
    const cover =
      photos.find((p) => p.file.toLowerCase() === coverFile)?.image ?? photos[0]!.image;

    albums.push({
      slug,
      title: meta.get('title') ?? titleFromSlug(slug),
      description: meta.get('description'),
      featured: ['yes', 'true', '1'].includes((meta.get('featured') ?? '').toLowerCase()),
      cover,
      photos,
    });
  }

  albums.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return albums;
}

const albums = buildAlbums();

export function getAlbums(): Album[] {
  return albums;
}

export function getAlbum(slug: string): Album | undefined {
  return albums.find((a) => a.slug === slug);
}
