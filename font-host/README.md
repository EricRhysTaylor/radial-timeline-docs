# Kalice font host (fonts.radialtimeline.com)

A Cloudflare Worker, `rt-font-host`, that serves the licensed Kalice web fonts to the docs site and nothing else. Deployed 13 Nov 2026 to Eric's Cloudflare account, on the custom domain `fonts.radialtimeline.com`. It has no workers.dev address and no preview URLs.

## Why it exists

The Claude Type EULA allows web fonts only "from domains owned or controlled by the License Owner, with reasonable protection against hotlinking and direct download". It also bars putting them in repositories. GitHub Pages serves every file to any site (`Access-Control-Allow-Origin: *`), so the docs can't ship Kalice themselves. They load it from here instead.

## What it serves

- **Files:** `/kalice/Kalice-Regular.woff2` and `/kalice/Kalice-Italic.woff2`.
- **To whom:** only requests whose `Origin` is in `ALLOWED_ORIGINS` (`wrangler.jsonc`), today `https://docs.radialtimeline.com`. The response carries that origin in `Access-Control-Allow-Origin`, with `Vary: Origin`, a 30-day cache, `Cross-Origin-Resource-Policy: same-site` and `noindex`.
- **Everything else gets 403:** other sites, a URL typed into a browser, curl without an allowed origin, and any other path. `run_worker_first` sends every request through the check in `src/index.js` before the assets are touched.

## The fonts never live here

`npm run deploy` (`scripts/deploy.mjs`) does four things:

1. Copies the two files from Eric's licensed folder (`~/Documents/FONTS/Claude Type - Kalice Regular + Italic/Web`, or `KALICE_SOURCE`) into `.staging/`.
2. Runs `wrangler deploy`.
3. Deletes `.staging/` again, even if the deploy failed.
4. Exits with wrangler's exit code.

`.staging/` and `.wrangler/` are git-ignored.

## Use

Needs Node 22.23.4 or later, and `npx wrangler login` once on this Mac (Eric's Cloudflare account).

```bash
npm install
npm run deploy
```

- **Local test:** `npm run dev -- --var ALLOWED_ORIGINS:http://127.0.0.1:4391` runs the Worker on port 8787. A docs build made with `KALICE_URL=http://127.0.0.1:8787/kalice/` and served on 4391 loads Kalice; served on any other port, it falls back to Newsreader. Run `npm run clean` afterwards.
- **Allowing another site** (for example, if radialtimeline.com ever moves off Framer): add its origin to `ALLOWED_ORIGINS`, separated by commas, and deploy again.
- **Removing it:** run `npx wrangler delete rt-font-host` and remove the `fonts` custom domain in the dashboard. The docs then fall back to Newsreader.

## Credit

Every docs build that uses Kalice shows "Headings set in Kalice, Claude Type, designed by Margot Lévêque" in its footer.
