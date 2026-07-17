# How the automated tests work (plain-language guide)

This site tests itself before every change is allowed in. You never have to
remember to run anything — it happens automatically.

## What gets checked

One command, `npm test`, builds the site exactly the way Cloudflare does and
then opens every page of the built site in a real browser and checks:

1. **It fits the screen** — on a narrow 320px phone, an iPhone-sized phone,
   and a 1280px desktop, no page may scroll sideways. Sideways panning on a
   phone is always a bug.
2. **It's accessible** — zero violations of the WCAG 2.x A and AA
   accessibility standards (checked with axe-core): readable color contrast,
   images with descriptions, labeled form fields, and so on. Checked at all
   three screen sizes.
3. **It loads cleanly** — no errors appear in the browser console, and every
   page has a proper title and search-engine description.
4. **No dead links** — every internal link leads to a real page, and any
   external link must be a well-formed `https://` address.

New albums and pages are discovered and tested automatically — nothing to
update when you add photos.

## When the tests run

- **Before every commit** (via a "pre-commit hook"): if any check fails, the
  commit is refused and the failure is printed. Nothing broken can be
  committed, pushed, or deployed. Do not bypass this with `--no-verify`.
- **On every push to GitHub** (via GitHub Actions): the same `npm test` runs
  again on GitHub's servers as a safety net — this catches changes made
  directly on github.com (like uploading photos from a phone), which skip the
  pre-commit hook.

## How to spot a failure on github.com

Next to each commit on the repository page you'll see a small **green ✓**
(all tests passed) or **red ✗** (something failed). Tap the ✗ → "Details" to
see which check failed. GitHub also emails you when a run fails on a commit
you made.

## When a commit is blocked

The printed failure names the page, the screen size, and the problem — for
example `color-contrast: Elements must meet minimum color contrast ratio
thresholds` means some text is too faint to read. **Fix the page until the
tests pass; never disable or weaken a test to get past it.** If you're stuck,
paste the failure output to Claude and ask for a fix.
