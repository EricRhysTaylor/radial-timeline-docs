// Helpers shared by the mockups: Lucide icons inlined at build time, and the figure
// frame from the design note (a tag above, the pane, a caption with a bold lead).

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ICON_DIR = path.join(path.dirname(require.resolve('lucide-static/package.json')), 'icons');

export function icon(name) {
	return fs.readFileSync(path.join(ICON_DIR, `${name}.svg`), 'utf8')
		.replace(/<!--.*?-->/s, '')
		.replace(/\s*\n\s*/g, ' ')
		.replace(/ width="24" height="24"/, ' aria-hidden="true"')
		.trim();
}

export const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// One HTML block with no blank lines, so Markdown passes it through untouched.
export function figure({ cls, alt, lead, caption, body }) {
	return [
		`<figure class="rt-mock ${cls} not-content">`,
		'<span class="rt-tag">Live mockup</span>',
		`<div class="pane" role="img" aria-label="${escapeAttr(alt)}">`,
		...body,
		'</div>',
		`<figcaption><b>${lead}</b> ${caption}</figcaption>`,
		'</figure>',
	].join('\n');
}
