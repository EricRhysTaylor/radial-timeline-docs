// Live mockup of Settings → Resources (the Res tab), from main's
// src/settings/sections/BonusVaultsSection.ts and src/settings/bonusVaults.ts (the Story Vault
// cards) and the Learn more card at the end of SettingsTab.ts's display(). English strings
// from ui.bonusVaultsSection, ui.bonusVaults, ui.demoLibraryModal and ui.settingsTab in
// src/i18n/locales/en.ts. Styling follows src/styles/rt-ui.css (.ert-bonus-*,
// .ert-resource-link*, .ert-badgePill--pro).
//
// The whole tab, in a vault that isn't itself a Story Vault, so no card shows an edition
// status line. The card art is the plugin's own (src/assets/demo-vaults/), copied next to
// the wiki images.

import fs from 'node:fs';
import path from 'node:path';
import { figure, icon } from './shared.mjs';
import { settingsPane } from './settings.mjs';

// Each card's ZIP label reads its archive size as BonusVaultsSection does: bytes / 1048576,
// one decimal. Edition is the date stamped in each archive.
const VAULTS = [
	{ art: 'pride-and-prejudice.jpg', title: 'Pride &amp; Prejudice', meta: 'Austen · 61 chapters', bytes: 21007200, edition: '2026-11-10', desc: 'A good first story. Saved Pulse, four Gossamer signals, and three Inquiry briefings.' },
	{ art: 'odyssey.jpg', title: 'The Odyssey', meta: 'Homer · 89 scenes', bytes: 1105676, edition: '2026-11-10', desc: 'Explore the complete journey with saved Pulse, four Gossamer signals, and three Inquiry briefings.' },
	{ art: 'sherlock-holmes.jpg', title: 'Sherlock Holmes', meta: 'Doyle · 4 novels · 56 chapters', bytes: 5492385, edition: '2026-11-10', desc: 'Our first collection: switch between four complete novels and their saved analyses.' },
	{ art: 'mystery-vault-gray.webp', title: 'Secret vault', meta: 'In preparation', soon: true, desc: 'A wandering knight, an enchanted forest, and a story that circles back upon itself. Look closely: the paths may be encircling something.' },
];

const LINKS = [
	['compass', 'Getting started'],
	['book-open', 'Radial Timeline Docs'],
	['circle-play', 'YouTube Video'],
];

// Copies the plugin's card art next to the wiki images; returns its URL.
function cardArt(file, pluginDir, imagesOut) {
	const source = path.join(pluginDir, 'src/assets/demo-vaults', file);
	if (!fs.existsSync(source)) throw new Error(`Resources mockup: missing card art ${source}`);
	fs.mkdirSync(imagesOut, { recursive: true });
	fs.copyFileSync(source, path.join(imagesOut, `story-vault-${file}`));
	return `/images/story-vault-${file}`;
}

function card(v, src) {
	const action = v.soon
		? '<span class="st-vbtn" aria-disabled="true">Coming soon</span>'
		: [
			`<span class="st-vbtn is-primary">${icon('folder-plus')}<span>Explore story</span></span>`,
			'<span class="st-vlink">View story</span>',
			`<span class="st-vlink">Download ZIP (${(v.bytes / 1048576).toFixed(1)} MB)</span>`,
		].join('');
	return [
		`<div class="st-vault${v.soon ? ' is-soon' : ''}">`,
		`<span class="art"><img src="${src}" alt="" loading="lazy"></span>`,
		`<span class="title">${v.title}</span>`,
		`<span class="meta">${v.meta}</span>`,
		v.edition ? `<span class="meta">Edition ${v.edition}</span>` : '',
		`<span class="desc">${v.desc}</span>`,
		`<span class="action">${action}</span>`,
		'</div>',
	].join('');
}

export function renderSettingsResourcesMockup({ alt, pluginDir, imagesOut }) {
	return figure({
		cls: 'rt-settings',
		alt,
		lead: 'Settings → Resources.',
		caption: 'The whole tab: the Story Vaults, three free and one in preparation, then the Learn more links. Hover a card or a link.',
		body: settingsPane({
			active: 'resources',
			full: true,
			body: [
				'<div class="st-vaults-head">',
				`<span class="st-badge is-pro"><span class="ic">${icon('sparkles')}</span><span class="tx">CLASSICS</span></span>`,
				'<div class="st-section-title">Story Vaults</div>',
				'<p class="st-section-desc">Explore complete works of literature with saved analysis. Start with the free Pride &amp; Prejudice, Odyssey, or Sherlock Holmes Story Vault; no API key is needed to browse saved results. Add a story to this vault, or download a separate vault as a ZIP.</p>',
				'</div>',
				`<div class="st-vaults">${VAULTS.map((v) => card(v, cardArt(v.art, pluginDir, imagesOut))).join('')}</div>`,
				'<div class="st-card">',
				'<div class="st-section-title">Learn more</div>',
				`<div class="st-res-links">${LINKS.map(([ic, label]) => `<span class="st-res-link"><span class="ic">${icon(ic)}</span><span class="lb">${label}</span><span class="ext">${icon('external-link')}</span></span>`).join('')}</div>`,
				'</div>',
			],
		}),
	});
}
