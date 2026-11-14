# Radial Timeline Docs

The styled docs site for [Radial Timeline](https://github.com/EricRhysTaylor/radial-timeline), the manuscript timeline for Obsidian, at **https://docs.radialtimeline.com**. Built with Astro Starlight from the same Markdown as the [GitHub wiki](https://github.com/EricRhysTaylor/radial-timeline/wiki).

The wiki stays the only source. Pages are written in the plugin repo's `wiki/` folder and published to the GitHub wiki; this repo only reads them.

## Deploys

`.github/workflows/deploy.yml` builds the site and deploys it to GitHub Pages. The workflow:

- runs on a push to `main`, and after every wiki publish: the plugin's `npm run publish-wiki` (also run by its backup step) starts it with `gh`;
- can be started by hand:
  ```bash
  gh workflow run deploy.yml -R EricRhysTaylor/radial-timeline-docs
  ```
- reads the pages from the **published** wiki (`radial-timeline.wiki`), so the site shows exactly what the wiki shows;
- takes the version label and the Welcome photo from the plugin repo.

## Run it locally

Needs Node 22.23.4 or later.

```bash
npm install
npm run build
npm run preview
```

`npm run dev` serves with live reload, but search only works in a build.

- **Source:** a local build reads `../radial-timeline/wiki/` beside this folder, or `WIKI_DIR` (and `PLUGIN_DIR`) if set.
- **Banner:** it shows a preview banner, because the plugin's `wiki/` folder can be ahead of the published wiki.

## Looks and fonts

- **paper** (the default): matches radialtimeline.com and the newsletter. Dark top bar with its zigzag edge, paper texture, Satoshi text, Geist Mono labels and sage accents, styled in `src/styles/theme-paper.css`.
- **note** (`DOCS_THEME=note npm run build`): the earlier Timetable-design-note look, with IBM Plex text, Newsreader titles and a violet accent.
- **Paper headings: Kalice only where its Claude Type licence allows.** The build prints which font it chose (`[docs] look: …; headings: …`):
  - **Local build:** Kalice, bundled from `src/fonts/kalice/`. The folder is git-ignored; never commit it to any repo.
  - **CI build** (`CI` or `GITHUB_ACTIONS` set): Kalice, loaded from **fonts.radialtimeline.com**. That's our font host (`font-host/`, a Cloudflare Worker), which serves the files only to `https://docs.radialtimeline.com`. The build ships no font files. On any other origin the fonts are refused and the headings fall back to Newsreader.
  - **`KALICE_URL=…`:** points a build at a different font host.
  - **`DOCS_HEADINGS=newsreader`:** forces Newsreader.
- **Credit:** a build that uses Kalice adds "Headings set in Kalice, Claude Type, designed by Margot Lévêque" to the footer (`src/components/Footer.astro`), as the licence asks.
- **Weights:** only Regular and Italic are licensed, so never set Kalice bold.

## How it fits together

- `scripts/sync-wiki.mjs` copies wiki pages into `src/content/docs/`, adds titles and descriptions, rewrites links and images, drops the inline styles GitHub ignores, converts `> [!NOTE]` alerts, parses `_Sidebar.md` into the sidebar, and reports broken links or anchors. It syncs every page; `node scripts/sync-wiki.mjs --prototype` syncs only Home, Getting Started and Timetable, for quick builds.
- `mockups/` renders the live mockups that replace screenshots on the site (the wiki keeps the screenshots): Timetable beside the wheel, Welcome screen, command palette, title bar (twice) and Settings → Core. Each is registered in the `MOCKUPS` map in `scripts/sync-wiki.mjs` and styled in `src/styles/mockups.css` or `mockups-panels.css`.
- `src/styles/docs.css` maps the base tokens onto Starlight, `src/styles/theme-paper.css` layers the paper look over them, `src/styles/kalice.css` adds local Kalice, and `src/styles/mockups.css` styles the mockups.
- `src/components/PageTitle.astro` adds the mono label above each title; `src/components/Footer.astro` adds the Kalice credit when Kalice is in the build.

Generated folders (`src/content/docs/`, `src/generated/`, `public/images/`) are rebuilt on every sync and are git-ignored.

## Previewing wiki changes

To preview wiki edits before they're published, build from a copy of the plugin repo:

```bash
WIKI_DIR=/path/to/copy/wiki npm run build
```
