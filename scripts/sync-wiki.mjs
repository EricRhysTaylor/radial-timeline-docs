// Copies each product's wiki/ Markdown into Starlight's content folder: Radial Timeline at the
// site root, Editorialist under /editorialist/. Each wiki folder stays the only source: this script
// reads it and never writes to it.
//
//   node scripts/sync-wiki.mjs               every wiki page
//   node scripts/sync-wiki.mjs --prototype   a few pages per product, for quick builds
//
// What it does to each page, so one Markdown file serves GitHub and the site:
// - frontmatter: title from the page name (as GitHub shows it), description from
//   the opening paragraph, last-updated date from the wiki file's git history
// - links: `[x](Timetable#anchor)` becomes `/Timetable/#anchor` (or `/editorialist/…`); a link to
//   the other product's GitHub wiki becomes a link inside the site; pages not synced point at the
//   GitHub wiki
// - images: `images/x.webp` becomes `/images/x.webp` (`/images/editorialist/…`) and the file is copied
// - each page gets `topic:` frontmatter, so the sidebar shows its product's navigation
// - inline `style` attributes are dropped, as GitHub drops them; the site CSS styles
//   the same HTML instead
// - GitHub alerts (`> [!NOTE]`) become Starlight asides
// - a screenshot listed in MOCKUPS is replaced by a live HTML mockup; one in SITE_HIDDEN is left out
// - every page link, anchor and sidebar link is checked against the wiki's headings

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';
import { renderTimetableMockup } from '../mockups/timetable.mjs';
import { renderWelcomeMockup } from '../mockups/welcome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Local builds may show unpublished wiki edits, so they carry a preview banner; CI builds don't.
const PUBLIC_BUILD = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
const DOCS_DIR = path.join(ROOT, 'src/content/docs');
const IMAGES_DIR = path.join(ROOT, 'public/images');
const GENERATED = path.join(ROOT, 'src/generated');

// Screenshot file → live mockup. GitHub keeps showing the screenshot.
const RT_MOCKUPS = {
	'images/timetable-sidebyside.webp': renderTimetableMockup,
	'images/welcome.webp': renderWelcomeMockup,
	// Imported in place, so these entries stay inside this map.
	'images/ui-commands.png': (await import('../mockups/commands.mjs')).renderCommandsMockup,
	'images/view-rt-mode-buttons.png': (await import('../mockups/titlebar.mjs')).renderModeButtonsMockup,
	'images/ui-tab-bar-actions.png': (await import('../mockups/titlebar.mjs')).renderTabBarMockup,
	'images/settings-core.png': (await import('../mockups/settings.mjs')).renderSettingsCoreMockup,
};

// One entry per product. WIKI_DIR / PLUGIN_DIR (and ED_WIKI_DIR / ED_PLUGIN_DIR) override where
// each wiki and plugin repo are read from; by default the plugin repos sit beside this folder and
// PLUGIN_DIR is the folder above the wiki. CI points them at the live GitHub wiki repos.
const PRODUCTS = [
	{
		id: 'rt',
		label: 'Radial Timeline',
		prefix: '',
		wikiDir: process.env.WIKI_DIR ?? path.resolve(ROOT, '../radial-timeline/wiki'),
		pluginDir: process.env.PLUGIN_DIR,
		wikiUrl: 'https://github.com/EricRhysTaylor/radial-timeline/wiki',
		titles: { Home: 'Radial Timeline' },
		prototype: ['Home', 'Getting-Started', 'Timetable'],
		openGroups: ['Getting Started'],
		mockups: RT_MOCKUPS,
		// Screenshots the site leaves out because a live mockup on the same page already shows them.
		// The GitHub wiki keeps them: there they are the only picture of those controls.
		hidden: ['images/timetable-row-panel.webp', 'images/homepage-timetable-full.webp'],
	},
	{
		id: 'editorialist',
		label: 'Editorialist',
		prefix: 'editorialist',
		wikiDir: process.env.ED_WIKI_DIR ?? path.resolve(ROOT, '../editorialist/wiki'),
		pluginDir: process.env.ED_PLUGIN_DIR,
		wikiUrl: 'https://github.com/EricRhysTaylor/editorialist/wiki',
		titles: { Home: 'Editorialist' },
		prototype: ['Home', 'Getting-Started'],
		openGroups: null, // every group open: the sidebar is short
		mockups: {},
		hidden: [],
	},
].filter((product) => {
	if (fs.existsSync(product.wikiDir)) return true;
	console.warn(`Skipping ${product.label}: no wiki at ${product.wikiDir}`);
	return false;
});
const prototypeBuild = process.argv.includes('--prototype');
for (const product of PRODUCTS) {
	product.pluginDir ??= path.resolve(product.wikiDir, '..');
	product.pageNames = fs.readdirSync(product.wikiDir)
		.filter((f) => f.endsWith('.md') && !f.startsWith('_'))
		.map((f) => f.slice(0, -3));
	product.synced = new Set(prototypeBuild ? product.prototype.filter((n) => product.pageNames.includes(n)) : product.pageNames);
	product.imagesOut = path.join(IMAGES_DIR, product.prefix);
	product.version = JSON.parse(fs.readFileSync(path.join(product.pluginDir, 'manifest.json'), 'utf8')).version;
	try {
		product.wikiRev = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: product.wikiDir, encoding: 'utf8' }).trim();
	} catch { product.wikiRev = ''; /* outside a git checkout: no commit in the banner */ }
}
const ALERTS = { NOTE: 'note', TIP: 'tip', IMPORTANT: 'note', WARNING: 'caution', CAUTION: 'danger' };

const problems = [];
const read = (product, name) => fs.readFileSync(path.join(product.wikiDir, `${name}.md`), 'utf8');
const urlFor = (product, name) => {
	const base = product.prefix ? `/${product.prefix}/` : '/';
	return name === 'Home' ? base : `${base}${name}/`;
};

// Heading anchors as GitHub and Astro both build them (github-slugger).
for (const product of PRODUCTS) {
	product.anchors = new Map(product.pageNames.map((name) => {
		const slugger = new GithubSlugger();
		const ids = new Set();
		let inFence = false;
		for (const line of read(product, name).split('\n')) {
			if (/^\s*```/.test(line)) inFence = !inFence;
			const m = !inFence && line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
			if (m) ids.add(slugger.slug(plainText(m[1])));
			for (const a of line.matchAll(/<a\s+(?:name|id)="([^"]+)"/g)) ids.add(a[1]);
		}
		return [name, ids];
	}));
}

function plainText(md) {
	return md
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/[*_`]/g, '');
}

// A page link inside one product's wiki, checked against that wiki's pages and headings.
function pageLink(product, page, anchor, from) {
	if (!product.pageNames.includes(page)) {
		problems.push(`${from}: link to missing ${product.label} page "${page}"`);
		return null;
	}
	if (anchor && !product.anchors.get(page).has(anchor)) problems.push(`${from}: ${product.label} ${page} has no heading for #${anchor}`);
	const hash = anchor ? `#${anchor}` : '';
	return product.synced.has(page) ? `${urlFor(product, page)}${hash}` : `${product.wikiUrl}/${page}${hash}`;
}

function resolveLink(target, from, product) {
	const where = `${product.label} ${from}`;
	if (/^[a-z]+:|^\/\//i.test(target)) {
		// A link to any product's GitHub wiki stays inside the site.
		for (const other of PRODUCTS) {
			const base = other.wikiUrl.toLowerCase();
			const lower = target.toLowerCase();
			if (lower !== base && !lower.startsWith(`${base}/`) && !lower.startsWith(`${base}#`)) continue;
			const rest = target.slice(other.wikiUrl.length).replace(/^\//, '');
			const [page, anchor] = rest.split('#');
			return pageLink(other, page || 'Home', anchor, where) ?? target;
		}
		return target;
	}
	const [page, anchor] = target.split('#');
	if (!page) {
		if (anchor && !product.anchors.get(from)?.has(anchor)) problems.push(`${where}: no heading for #${anchor}`);
		return target;
	}
	return pageLink(product, page, anchor, where) ?? target;
}

function copyImage(rel, from, product) {
	const src = path.join(product.wikiDir, rel);
	if (!fs.existsSync(src)) {
		problems.push(`${product.label} ${from}: missing image ${rel}`);
		return rel;
	}
	fs.mkdirSync(product.imagesOut, { recursive: true });
	fs.copyFileSync(src, path.join(product.imagesOut, path.basename(rel)));
	return `/images/${product.prefix ? `${product.prefix}/` : ''}${path.basename(rel)}`;
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
function swapMockups(md, product) {
	const blocks = md.split(/(\n[ \t]*\n)/);
	for (const [image, render] of Object.entries(product.mockups)) {
		const i = blocks.findIndex((b) => b.includes(`](${image})`) || b.includes(`src="${image}"`));
		if (i < 0) continue;
		const block = blocks[i];
		const alt = block.match(/!\[([^\]]*)\]/)?.[1] ?? block.match(/alt="([^"]*)"/)?.[1] ?? '';
		const caption = (block.match(/<img[^>]*>\s*<div>([^<]+)<\/div>/) ?? block.match(/<sub>([^<]+)<\/sub>/))?.[1]?.trim();
		blocks[i] = render({ alt, caption, pluginDir: product.pluginDir, imagesOut: product.imagesOut });
	}
	for (const image of product.hidden) {
		const i = blocks.findIndex((b) => b.includes(`](${image})`) || b.includes(`src="${image}"`));
		if (i >= 0) blocks[i] = '';
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

function transform(product, name) {
	let md = read(product, name);
	md = promoteHeadings(md);
	md = convertAlerts(md);
	md = md.replace(/\s+style="[^"]*"/g, '');
	md = swapMockups(md, product);
	md = boldCaptionLeads(md);
	md = md.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, bang, text, target) => {
		if (target.startsWith('images/')) return `${bang}[${text}](${copyImage(target, name, product)})`;
		return `${bang}[${text}](${resolveLink(target, name, product)})`;
	});
	md = md.replace(/src="(images\/[^"]+)"/g, (_, rel) => `src="${copyImage(rel, name, product)}"`);
	md = md.replace(/href="([^"]+)"/g, (_, target) => `href="${resolveLink(target, name, product)}"`);
	md = inlineToc(md);
	return md;
}

function frontmatter(product, name, body) {
	const title = product.titles[name] ?? name.replace(/-/g, ' ');
	const lede = body.split(/\n\s*\n/).find((p) => /^[A-Za-z*]/.test(p.trim())) ?? '';
	let description = plainText(lede).replace(/\s+/g, ' ').trim();
	if (description.length > 180) description = `${description.slice(0, 177).replace(/\s+\S*$/, '')}…`;
	let updated = '';
	try {
		updated = execFileSync('git', ['log', '-1', '--format=%cs', '--', `${name}.md`], { cwd: product.wikiDir, encoding: 'utf8' }).trim();
	} catch { /* outside a git checkout: no date */ }
	const lines = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`description: ${JSON.stringify(description)}`,
		`eyebrow: ${JSON.stringify(`${product.label} ${product.version}`)}`,
		`topic: ${product.id}`,
		updated && `lastUpdated: ${updated}`,
		!PUBLIC_BUILD && 'banner:',
		!PUBLIC_BUILD && `  content: ${JSON.stringify(`Local preview of ${product.label}’s <code>${name}.md</code>${product.wikiRev ? ` at <code>${product.wikiRev}</code>` : ''}. It may include wiki edits that aren’t published yet.`)}`,
		'---',
	];
	return `${lines.filter(Boolean).join('\n')}\n\n`;
}

// _Sidebar.md: a nested list of links and bold labels. Radial Timeline nests `*` items;
// Editorialist puts a bold label on its own line (or a bold link, for Home) above `-` items.
function parseSidebar(product) {
	const root = { children: [] };
	const stack = [{ indent: -1, node: root }];
	let header = null; // a standalone bold label, which owns the unindented items under it
	for (const line of fs.readFileSync(path.join(product.wikiDir, '_Sidebar.md'), 'utf8').split('\n')) {
		const standalone = line.match(/^\*\*(.+)\*\*\s*$/);
		if (standalone) {
			const link = standalone[1].match(/^\[([^\]]+)\]\(([^)]+)\)$/);
			const node = { label: link ? link[1] : standalone[1], target: link?.[2], children: [] };
			root.children.push(node);
			header = link ? null : { indent: -1, node };
			stack.length = 1;
			if (header) stack.push(header);
			continue;
		}
		const m = line.match(/^(\s*)[*-]\s+(.*)$/);
		if (!m) continue;
		const indent = m[1].length;
		const link = m[2].match(/^\[([^\]]+)\]\(([^)]+)\)/);
		const bold = m[2].match(/^\*\*(.+)\*\*/);
		const node = { label: link ? link[1] : bold ? bold[1] : m[2].trim(), target: link?.[2], children: [] };
		while (stack.length > 1 && stack.at(-1).indent >= indent && stack.at(-1) !== header) stack.pop();
		stack.at(-1).node.children.push(node);
		stack.push({ indent, node });
	}
	const toItem = (node) => {
		const href = node.target && resolveLink(node.target, '_Sidebar', product);
		const external = href && /^https?:/.test(href);
		const linkItem = (label) => ({ label, link: href, ...(external && { attrs: { class: 'rt-wiki-link' } }) });
		if (!node.children.length) return linkItem(node.label);
		const items = node.children.map(toItem);
		if (href) items.unshift(linkItem('Overview'));
		const collapsed = product.openGroups ? !product.openGroups.includes(node.label) : false;
		return { label: node.label, collapsed, items };
	};
	return root.children.map(toItem);
}

fs.rmSync(DOCS_DIR, { recursive: true, force: true });
fs.rmSync(IMAGES_DIR, { recursive: true, force: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });
fs.mkdirSync(GENERATED, { recursive: true });

const sidebars = [];
for (const product of PRODUCTS) {
	const dir = path.join(DOCS_DIR, product.prefix);
	fs.mkdirSync(dir, { recursive: true });
	for (const name of product.synced) {
		const body = transform(product, name);
		const file = name === 'Home' ? 'index.md' : `${name}.md`;
		fs.writeFileSync(path.join(dir, file), frontmatter(product, name, body) + body);
	}
	sidebars.push({ id: product.id, label: product.label, link: urlFor(product, 'Home'), items: parseSidebar(product) });
	console.log(`Synced ${product.synced.size} of ${product.pageNames.length} ${product.label} wiki pages from ${product.wikiDir}`);
}
fs.writeFileSync(path.join(GENERATED, 'sidebar.json'), JSON.stringify(sidebars, null, '\t'));

if (problems.length) {
	console.log(`\n${problems.length} link problem(s) in the wiki source:`);
	for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
}
