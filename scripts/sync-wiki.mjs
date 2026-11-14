// Copies the plugin's wiki/ Markdown into Starlight's content folder.
// The wiki folder stays the only source: this script reads it and never writes to it.
//
//   node scripts/sync-wiki.mjs               every wiki page
//   node scripts/sync-wiki.mjs --prototype   only Home, Getting Started and Timetable, for quick builds
//
// What it does to each page, so one Markdown file serves GitHub and the site:
// - frontmatter: title from the page name (as GitHub shows it), description from
//   the opening paragraph, last-updated date from the wiki file's git history
// - links: `[x](Timetable#anchor)` becomes `/Timetable/#anchor`; pages not synced
//   point at the GitHub wiki
// - images: `images/x.webp` becomes `/images/x.webp` and the file is copied
// - inline `style` attributes are dropped, as GitHub drops them; the site CSS styles
//   the same HTML instead
// - GitHub alerts (`> [!NOTE]`) become Starlight asides
// - a screenshot listed in MOCKUPS is replaced by a live HTML mockup
// - every page link, anchor and sidebar link is checked against the wiki's headings

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';
import { renderTimetableMockup } from '../mockups/timetable.mjs';
import { renderWelcomeMockup } from '../mockups/welcome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The plugin repo sits beside this folder; WIKI_DIR overrides it. PLUGIN_DIR is the plugin repo
// (manifest.json for the version label, the Welcome photo), by default the folder above WIKI_DIR.
// CI builds the published site from the live GitHub wiki repo, with PLUGIN_DIR on the plugin repo.
const WIKI_DIR = process.env.WIKI_DIR ?? path.resolve(ROOT, '../radial-timeline/wiki');
const PLUGIN_DIR = process.env.PLUGIN_DIR ?? path.resolve(WIKI_DIR, '..');
// Local builds may show unpublished wiki edits, so they carry a preview banner; CI builds don't.
const PUBLIC_BUILD = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
const WIKI_URL = 'https://github.com/EricRhysTaylor/radial-timeline/wiki';
const DOCS_DIR = path.join(ROOT, 'src/content/docs');
const IMAGES_OUT = path.join(ROOT, 'public/images');
const GENERATED = path.join(ROOT, 'src/generated');

const PROTOTYPE_PAGES = ['Home', 'Getting-Started', 'Timetable'];
const TITLES = { Home: 'Radial Timeline' };
// Screenshot file → live mockup. GitHub keeps showing the screenshot.
const MOCKUPS = {
	'images/timetable-sidebyside.webp': renderTimetableMockup,
	'images/welcome.webp': renderWelcomeMockup,
	// Imported in place, so these entries stay inside this map.
	'images/ui-commands.png': (await import('../mockups/commands.mjs')).renderCommandsMockup,
	'images/view-rt-mode-buttons.png': (await import('../mockups/titlebar.mjs')).renderModeButtonsMockup,
	'images/ui-tab-bar-actions.png': (await import('../mockups/titlebar.mjs')).renderTabBarMockup,
	'images/settings-core.png': (await import('../mockups/settings.mjs')).renderSettingsCoreMockup,
};
const ALERTS = { NOTE: 'note', TIP: 'tip', IMPORTANT: 'note', WARNING: 'caution', CAUTION: 'danger' };

const pageNames = fs.readdirSync(WIKI_DIR)
	.filter((f) => f.endsWith('.md') && !f.startsWith('_'))
	.map((f) => f.slice(0, -3));
const synced = new Set(process.argv.includes('--prototype') ? PROTOTYPE_PAGES : pageNames);
const problems = [];

const read = (name) => fs.readFileSync(path.join(WIKI_DIR, `${name}.md`), 'utf8');
const urlFor = (name) => (name === 'Home' ? '/' : `/${name}/`);
let wikiRev = '';
try {
	wikiRev = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: WIKI_DIR, encoding: 'utf8' }).trim();
} catch { /* outside a git checkout: no commit in the banner */ }
const pluginVersion = JSON.parse(fs.readFileSync(path.join(PLUGIN_DIR, 'manifest.json'), 'utf8')).version;

// Heading anchors as GitHub and Astro both build them (github-slugger).
const anchors = new Map(pageNames.map((name) => {
	const slugger = new GithubSlugger();
	const ids = new Set();
	let inFence = false;
	for (const line of read(name).split('\n')) {
		if (/^\s*```/.test(line)) inFence = !inFence;
		const m = !inFence && line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
		if (m) ids.add(slugger.slug(plainText(m[1])));
		for (const a of line.matchAll(/<a\s+(?:name|id)="([^"]+)"/g)) ids.add(a[1]);
	}
	return [name, ids];
}));

function plainText(md) {
	return md
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/[*_`]/g, '');
}

function resolveLink(target, from) {
	if (/^[a-z]+:|^\/\//i.test(target)) return target;
	const [page, anchor] = target.split('#');
	if (!page) {
		if (anchor && !anchors.get(from)?.has(anchor)) problems.push(`${from}: no heading for #${anchor}`);
		return target;
	}
	if (!pageNames.includes(page)) {
		problems.push(`${from}: link to missing page "${page}"`);
		return target;
	}
	if (anchor && !anchors.get(page).has(anchor)) problems.push(`${from}: ${page} has no heading for #${anchor}`);
	const hash = anchor ? `#${anchor}` : '';
	return synced.has(page) ? `${urlFor(page)}${hash}` : `${WIKI_URL}/${page}${hash}`;
}

function copyImage(rel, from) {
	const src = path.join(WIKI_DIR, rel);
	if (!fs.existsSync(src)) {
		problems.push(`${from}: missing image ${rel}`);
		return rel;
	}
	fs.mkdirSync(IMAGES_OUT, { recursive: true });
	fs.copyFileSync(src, path.join(IMAGES_OUT, path.basename(rel)));
	return `/images/${path.basename(rel)}`;
}

function convertAlerts(md) {
	return md.replace(/^> \[!(\w+)\]\s*\n((?:>.*(?:\n|$))*)/gm, (whole, kind, body) => {
		const variant = ALERTS[kind.toUpperCase()];
		if (!variant) return whole;
		const text = body.split('\n').map((l) => l.replace(/^> ?/, '')).join('\n').trim();
		const label = kind[0].toUpperCase() + kind.slice(1).toLowerCase();
		return `:::${variant}[${label}]\n${text}\n:::\n`;
	});
}

// A page whose sections are all ### (Home) gets them as ## on the site, so they take the
// display face. Anchors come from the heading text, so links are unaffected.
function promoteHeadings(md) {
	const levels = [...md.matchAll(/^(#{1,6})\s/gm)].map((m) => m[1].length);
	const shift = Math.min(...levels) - 2;
	if (!(shift > 0)) return md;
	return md.replace(/^(#{1,6})(\s)/gm, (_, hashes, space) => `${hashes.slice(shift)}${space}`);
}

// The Markdown block (paragraph or HTML block) holding a mockup's screenshot is replaced
// whole, keeping the screenshot's alt text and, for the wiki's captioned <div>s, its caption.
function swapMockups(md) {
	const blocks = md.split(/(\n[ \t]*\n)/);
	for (const [image, render] of Object.entries(MOCKUPS)) {
		const i = blocks.findIndex((b) => b.includes(`](${image})`) || b.includes(`src="${image}"`));
		if (i < 0) continue;
		const block = blocks[i];
		const alt = block.match(/!\[([^\]]*)\]/)?.[1] ?? block.match(/alt="([^"]*)"/)?.[1] ?? '';
		const caption = (block.match(/<img[^>]*>\s*<div>([^<]+)<\/div>/) ?? block.match(/<sub>([^<]+)<\/sub>/))?.[1]?.trim();
		blocks[i] = render({ alt, caption, pluginDir: PLUGIN_DIR, imagesOut: IMAGES_OUT });
	}
	return blocks.join('');
}

// The wiki's captions read “Narrative Mode — story beats…”: the part before the dash
// becomes the caption's bold lead, as in the design note.
function boldCaptionLeads(md) {
	return md.replace(/(<img[^>]*>\s*<div>)([^<—]+?) — /g, '$1<b>$2</b> — ');
}

// A numbered contents row under the opening paragraph, in place of Starlight's side rail.
// Section numbers on the h2s come from a CSS counter, so the two always agree.
function inlineToc(md) {
	const slugger = new GithubSlugger();
	const sections = [];
	let inFence = false;
	for (const line of md.split('\n')) {
		if (/^\s*```/.test(line)) inFence = !inFence;
		const m = !inFence && line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
		if (!m) continue;
		const text = plainText(m[2]).trim();
		const slug = slugger.slug(text);
		if (m[1].length === 2) sections.push({ text, slug });
	}
	if (sections.length < 2) return md;
	const links = sections.map((s, i) => `<a href="#${s.slug}"><b>${String(i + 1).padStart(2, '0')}</b>${s.text}</a>`).join('');
	const nav = `<nav class="rt-toc not-content" aria-label="On this page">${links}</nav>`;
	return md.replace(/^([A-Za-z*][^\n]*(?:\n(?!\s*\n)[^\n]*)*)\n\s*\n/m, `$1\n\n${nav}\n\n`);
}

function transform(name) {
	let md = read(name);
	md = promoteHeadings(md);
	md = convertAlerts(md);
	md = md.replace(/\s+style="[^"]*"/g, '');
	md = swapMockups(md);
	md = boldCaptionLeads(md);
	md = md.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, bang, text, target) => {
		if (target.startsWith('images/')) return `${bang}[${text}](${copyImage(target, name)})`;
		return `${bang}[${text}](${resolveLink(target, name)})`;
	});
	md = md.replace(/src="(images\/[^"]+)"/g, (_, rel) => `src="${copyImage(rel, name)}"`);
	md = md.replace(/href="([^"]+)"/g, (_, target) => `href="${resolveLink(target, name)}"`);
	md = inlineToc(md);
	return md;
}

function frontmatter(name, body) {
	const title = TITLES[name] ?? name.replace(/-/g, ' ');
	const lede = body.split(/\n\s*\n/).find((p) => /^[A-Za-z*]/.test(p.trim())) ?? '';
	let description = plainText(lede).replace(/\s+/g, ' ').trim();
	if (description.length > 180) description = `${description.slice(0, 177).replace(/\s+\S*$/, '')}…`;
	let updated = '';
	try {
		updated = execFileSync('git', ['log', '-1', '--format=%cs', '--', `${name}.md`], { cwd: WIKI_DIR, encoding: 'utf8' }).trim();
	} catch { /* outside a git checkout: no date */ }
	const lines = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`description: ${JSON.stringify(description)}`,
		`eyebrow: ${JSON.stringify(`Radial Timeline ${pluginVersion}`)}`,
		updated && `lastUpdated: ${updated}`,
		!PUBLIC_BUILD && 'banner:',
		!PUBLIC_BUILD && `  content: ${JSON.stringify(`Local preview of <code>${name}.md</code>${wikiRev ? ` at <code>${wikiRev}</code>` : ''}. It may include wiki edits that aren’t published yet.`)}`,
		'---',
	];
	return `${lines.filter(Boolean).join('\n')}\n\n`;
}

// _Sidebar.md: a nested list of links and bold group labels.
function parseSidebar() {
	const root = { children: [] };
	const stack = [{ indent: -1, node: root }];
	for (const line of fs.readFileSync(path.join(WIKI_DIR, '_Sidebar.md'), 'utf8').split('\n')) {
		const m = line.match(/^(\s*)\*\s+(.*)$/);
		if (!m) continue;
		const indent = m[1].length;
		const link = m[2].match(/^\[([^\]]+)\]\(([^)]+)\)/);
		const bold = m[2].match(/^\*\*(.+)\*\*/);
		const node = { label: link ? link[1] : bold ? bold[1] : m[2].trim(), target: link?.[2], children: [] };
		while (stack.at(-1).indent >= indent) stack.pop();
		stack.at(-1).node.children.push(node);
		stack.push({ indent, node });
	}
	const toItem = (node) => {
		const href = node.target && resolveLink(node.target, '_Sidebar');
		const external = href && /^https?:/.test(href);
		const linkItem = (label) => ({ label, link: href, ...(external && { attrs: { class: 'rt-wiki-link' } }) });
		if (!node.children.length) return linkItem(node.label);
		const items = node.children.map(toItem);
		if (href) items.unshift(linkItem('Overview'));
		return { label: node.label, collapsed: node.label !== 'Getting Started', items };
	};
	return root.children.map(toItem);
}

fs.rmSync(DOCS_DIR, { recursive: true, force: true });
fs.rmSync(IMAGES_OUT, { recursive: true, force: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });
fs.mkdirSync(GENERATED, { recursive: true });

for (const name of synced) {
	const body = transform(name);
	const file = name === 'Home' ? 'index.md' : `${name}.md`;
	fs.writeFileSync(path.join(DOCS_DIR, file), frontmatter(name, body) + body);
}
fs.writeFileSync(path.join(GENERATED, 'sidebar.json'), JSON.stringify(parseSidebar(), null, '\t'));

console.log(`Synced ${synced.size} of ${pageNames.length} wiki pages from ${WIKI_DIR}`);
if (problems.length) {
	console.log(`\n${problems.length} link problem(s) in the wiki source:`);
	for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
}
