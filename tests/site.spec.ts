import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sitePages } from './pages';

const viewports = {
  'narrow phone 320px': { width: 320, height: 640 },
  'iPhone 390px': { width: 390, height: 844 },
  'desktop 1280px': { width: 1280, height: 800 },
};

for (const url of sitePages()) {
  test.describe(url, () => {
    for (const [name, viewport] of Object.entries(viewports)) {
      test(`fits the screen and has no accessibility violations — ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(url);

        // Sideways panning on a phone is always a bug.
        const overflowPx = await page.evaluate(() => {
          const doc = document.scrollingElement!;
          return doc.scrollWidth - doc.clientWidth;
        });
        expect(overflowPx, `page is ${overflowPx}px wider than the screen (horizontal scrolling)`).toBeLessThanOrEqual(0);

        // WCAG 2.x level A and AA — zero tolerance.
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const summary = results.violations.map(
          (v) => `${v.id}: ${v.help} (${v.nodes.length} place${v.nodes.length === 1 ? '' : 's'})`,
        );
        expect(summary, 'accessibility violations found').toEqual([]);
      });
    }

    test('loads cleanly with a proper title and description', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(url, { waitUntil: 'networkidle' });

      expect(errors, 'browser console errors while loading').toEqual([]);
      await expect(page).toHaveTitle(/\S/);
      await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
        'content',
        /\S[\s\S]{19,}/,
      );
    });

    test('every link points somewhere valid', async ({ page, request, baseURL }) => {
      await page.goto(url);
      const hrefs = await page.$$eval('a[href]', (els) =>
        els.map((el) => el.getAttribute('href')!),
      );
      expect(hrefs.length).toBeGreaterThan(0);

      for (const href of new Set(hrefs)) {
        if (href.startsWith('mailto:')) continue;
        if (/^https?:\/\//.test(href)) {
          expect(href, `external link must use https: ${href}`).toMatch(/^https:\/\//);
          expect(() => new URL(href), `malformed external link: ${href}`).not.toThrow();
        } else {
          expect(href, `internal link must start with /: ${href}`).toMatch(/^\//);
          const res = await request.get(baseURL + href);
          expect(res.status(), `broken internal link: ${href}`).toBeLessThan(400);
        }
      }
    });
  });
}
