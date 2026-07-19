import type { ImageMetadata } from 'astro';

export interface Photo {
  /** filename inside the album folder, e.g. "01-aurora.jpg" */
  file: string;
  image: ImageMetadata;
  caption?: string;
}

export interface Video {
  /** filename inside the album folder, e.g. "05-aurora-timelapse.mp4" */
  file: string;
  url: string;
  caption?: string;
}

export interface Album {
  /** folder name, used in the URL: /galleries/<slug>/ */
  slug: string;
  title: string;
  description?: string;
  /** featured albums get top billing on the Galleries page */
  featured: boolean;
  /** hidden albums never appear in the Galleries — their photos are used by dedicated pages */
  hidden: boolean;
  /** which Galleries section the album lives in: 'earlier' → Earlier Travels, otherwise The Good Camera */
  section?: string;
  cover: ImageMetadata;
  photos: Photo[];
  videos: Video[];
}

/*
 * Every image dropped into src/assets/photos/<album-folder>/ is picked up
 * here at build time — no code changes needed to add albums or photos.
 */
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

/* self-hosted videos, served as-is (keep them small MP4s) */
const videoModules = import.meta.glob<string>(
  '../assets/photos/*/*.{mp4,webm,MP4,WEBM}',
  { eager: true, query: '?url', import: 'default' },
);

/*
 * Optional metadata: a plain-text file named album.txt inside an album folder.
 * Lines are "key: value". Special keys: title, description, cover, featured,
 * hidden, section. Any key that matches a photo's or video's filename becomes
 * that item's caption.
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

function isYes(value: string | undefined): boolean {
  return ['yes', 'true', '1'].includes((value ?? '').toLowerCase());
}

function buildAlbums(): Album[] {
  const photosBySlug = new Map<string, Photo[]>();
  const videosBySlug = new Map<string, Video[]>();

  for (const [path, mod] of Object.entries(imageModules)) {
    const parts = path.split('/');
    const slug = parts[parts.length - 2]!;
    const file = parts[parts.length - 1]!;
    const photos = photosBySlug.get(slug) ?? [];
    photos.push({ file, image: mod.default });
    photosBySlug.set(slug, photos);
  }

  for (const [path, url] of Object.entries(videoModules)) {
    const parts = path.split('/');
    const slug = parts[parts.length - 2]!;
    const file = parts[parts.length - 1]!;
    const videos = videosBySlug.get(slug) ?? [];
    videos.push({ file, url });
    videosBySlug.set(slug, videos);
  }

  const albums: Album[] = [];
  const slugs = new Set([...photosBySlug.keys(), ...videosBySlug.keys()]);

  for (const slug of slugs) {
    const photos = photosBySlug.get(slug) ?? [];
    const videos = videosBySlug.get(slug) ?? [];
    if (photos.length === 0) continue; // an album needs at least one photo for its cover
    photos.sort((a, b) => a.file.localeCompare(b.file));
    videos.sort((a, b) => a.file.localeCompare(b.file));

    const textPath = Object.keys(textModules).find((p) => p.includes(`/${slug}/album.txt`));
    const meta = textPath ? parseAlbumText(textModules[textPath]!) : new Map<string, string>();

    for (const photo of photos) {
      const caption = meta.get(photo.file.toLowerCase());
      if (caption) photo.caption = caption;
    }
    for (const video of videos) {
      const caption = meta.get(video.file.toLowerCase());
      if (caption) video.caption = caption;
    }

    const coverFile = meta.get('cover')?.toLowerCase();
    const cover =
      photos.find((p) => p.file.toLowerCase() === coverFile)?.image ?? photos[0]!.image;

    albums.push({
      slug,
      title: meta.get('title') ?? titleFromSlug(slug),
      description: meta.get('description'),
      featured: isYes(meta.get('featured')),
      hidden: isYes(meta.get('hidden')),
      section: meta.get('section')?.toLowerCase(),
      cover,
      photos,
      videos,
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
  return albums.filter((a) => !a.hidden);
}

export function getAlbum(slug: string): Album | undefined {
  return albums.find((a) => a.slug === slug);
}
