// Live mockup of Settings → Radial timeline with the Core tab open, from main's
// src/settings/SettingsTab.ts (display(): the tab strip, renderCoreHero, the quick links),
// src/settings/sections/ProgressSection.ts (the completion estimate summary) and
// src/settings/sections/GeneralSection.ts (Books), with English strings from
// ui.settingsTab, ui.generalSection, ui.progressSection and commands.onboardManuscript in
// src/i18n/locales/en.ts. Styling follows src/styles/rt-ui.css,
// src/styles/features/completion-preview.css and src/styles/legacy/rt-ui-legacy.css.
//
// The first sections only, as the page opens: no notification history (it shows only once
// a migration has run). Book titles, folders and counts are invented. The Obsidian sidebar
// is trimmed to its Options group.

import { figure, icon } from './shared.mjs';

// The plugin's 'ri-logo' icon (main's src/assets/icons/radial-inquiry.svg), on the Inquiry tab.
const RI_LOGO = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor" transform="translate(-56.82,-75.59) scale(0.12030)"><path d="M604.11,1274.16l-131.83.12,36.57-162.23c12.42-55.12,57.45-94.1,114.42-94.09h122.98c10.22.01,20-1.99,28.72-6.65,14.3-7.63,20.82-22.45,19.24-38.15-2.34-23.35-20.29-34.12-42.51-35.41l-201.37-.06,29.2-125.03,185.04.12c69.83,3.45,127.94,44.91,151.99,110.3,18.56,53.7,7.91,111.98-27.6,156.25-17.24,21.5-39.41,37.45-64.95,49.11l71.96,144.34c.9,1.81,1.8,2.59-1.12,1.42l-142.07.04-64.96-128.49-53.36-.13-30.34,128.56Z"/><path d="M1046 812H1176L1068 1274H938Z"/></g></svg>';

const TABS = [
	{ label: 'Cor', icon: 'settings', active: true },
	{ label: 'Soc', icon: 'radio' },
	{ label: 'Com', icon: 'users' },
	{ label: 'Inq', svg: RI_LOGO },
	{ label: 'Pub', icon: 'book-open-text' },
	{ label: 'AI', icon: 'cpu' },
	{ label: 'Adv', icon: 'pyramid' },
	{ label: 'Res', icon: 'library' },
];

const FEATURES = [
	['layout-grid', 'Story structure — manage scenes, beats, profiles, and advanced fields.'],
	['orbit', 'Chronologue &amp; time — align chronologue, backdrop, and planetary clocks'],
	['timer', 'Sessions — calibrate drafting pace, daily targets, and completion estimates.'],
];

const QUICK_LINKS = ['Books', 'Sessions', 'Beats', 'Properties', 'Chronology', 'POV', 'Planet Calendar', 'Backdrop', 'Colors', 'Release Notes'];

const BOOKS = [
	{ title: 'Northlight', n: 1, scenes: 24, words: '61k', folder: 'Books/Northlight', active: true },
	{ title: 'Saltwake', n: 2, scenes: 11, words: '23k', folder: 'Books/Saltwake' },
];

// Obsidian's own settings sidebar, Options group (sample: a few community plugins below).
const SIDEBAR = [
	['circle-user', 'General'], ['pen-line', 'Editor'], ['folder-cog', 'Files and links'], ['palette', 'Appearance'],
	['command', 'Hotkeys'], ['key-round', 'Keychain'], ['box', 'Core plugins'], ['puzzle', 'Community plugins'],
];

const toggle = (on) => `<span class="st-toggle${on ? ' is-on' : ''}"><i></i></span>`;

function bookCard(b) {
	return [
		`<div class="st-book${b.active ? ' is-active' : ' is-clickable'}">`,
		`<span class="drag">${icon('grip-vertical')}</span>`,
		'<span class="info">',
		`<span class="name"><span class="status">${icon('circle-check')}</span><span class="title">${b.title}</span></span>`,
		`<span class="meta">BOOK ${b.n} — ${b.scenes} scenes — ${b.words} words</span>`,
		'</span>',
		`<span class="controls"><span class="desc">Include in saga</span>${toggle(true)}<span class="st-iconbtn">${icon('book-dashed')}</span><span class="st-iconbtn">${icon('tags')}</span></span>`,
		`<span class="folder"><span class="st-input">${b.folder}</span><span class="trash">${icon('trash-2')}</span></span>`,
		'</div>',
	].join('');
}

export function renderSettingsCoreMockup({ alt }) {
	return figure({
		cls: 'rt-settings',
		alt,
		lead: 'Settings → Core, as it opens.',
		caption: 'The tab strip with Core selected, its hero card and quick links, the completion estimate, and the first rows of Books. Two invented books. Hover a tab, a quick link or the inactive book.',
		body: [
			'<div class="st">',
			'<div class="st-side">',
			'<div class="st-search">' + icon('search') + '<span>Search settings…</span></div>',
			'<div class="st-group">Options</div>',
			...SIDEBAR.map(([ic, label]) => `<div class="st-nav">${icon(ic)}<span>${label}</span></div>`),
			'<div class="st-group">Community plugins</div>',
			'<div class="st-nav">Editorialist</div>',
			'<div class="st-nav is-active">Radial timeline</div>',
			'</div>',
			'<div class="st-main">',
			`<div class="st-tabs">${TABS.map((tb) => `<span class="st-tab${tb.active ? ' is-active' : ''}"><span class="ic">${tb.svg ?? icon(tb.icon)}</span><span class="lb">${tb.label}</span></span>`).join('')}</div>`,
			'<div class="st-hero">',
			`<span class="st-badge"><span class="ic">${icon('settings')}</span><span class="tx">Core · Foundation</span><span class="wiki">${icon('external-link')}</span></span>`,
			'<div class="st-hero-title">Build the core of your writing workflow.</div>',
			'<p class="st-hero-sub">The Radial Timeline is designed to empower you, the author, toward greater productivity and accountability. Use Core settings to align the timeline with your manuscript’s structure, sharpen your workflow, and move faster with clarity.</p>',
			'<div class="st-features"><div class="kicker">Core Highlights:</div>',
			...FEATURES.map(([ic, text]) => `<div class="feat"><span class="ic">${icon(ic)}</span><span>${text}</span></div>`),
			'</div>',
			'</div>',
			`<div class="st-links"><span class="label">Quick Links</span>${QUICK_LINKS.map((l) => `<span class="pill">${l}${icon('corner-right-down')}</span>`).join('')}</div>`,
			`<div class="st-estimate"><div class="sum"><span class="t">Completion Estimate • Author Stage</span><span class="a">16/54 scenes complete</span></div><span class="st-iconbtn">${icon('chevron-right')}</span></div>`,
			`<div class="st-heading"><span class="name">${icon('library-big')}<span>Books</span></span><span class="desc">The active book drives the timeline view, title and exports.</span><span class="st-iconbtn is-cta">${icon('plus')}</span></div>`,
			'<div class="st-panel"><div class="st-row"><span class="info"><span class="name">Add an existing book or manuscript</span><span class="desc">Radial Timeline book folders are added as they are. Scrivener and Word exports are imported into a new book.</span></span><span class="ctl"><span class="st-btn">Import manuscript</span><span class="st-btn">Scan vault</span></span></div></div>',
			...BOOKS.map(bookCard),
			'</div>',
			'</div>',
		],
	});
}
