import { readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

/*
 * Discovers every page of the built site by walking dist/ for index.html
 * files, so new albums and pages are tested automatically with no code
 * changes — same principle as the site itself.
 */
export function sitePages(): string[] {
  const dist = path.resolve('dist');
  if (!existsSync(dist)) {
    throw new Error('dist/ not found — run "npm test" (it builds first), not "playwright test" alone.');
  }
  const pages: string[] = [];
  (function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      if (entry === '_astro' || entry === '_worker.js') continue;
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry === 'index.html') {
        const rel = path.relative(dist, dir).split(path.sep).join('/');
        pages.push(rel === '' ? '/' : `/${rel}/`);
      }
    }
  })(dist);
  if (existsSync(path.join(dist, '404.html'))) pages.push('/404.html');
  return pages.sort();
}
