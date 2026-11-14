// Live mockup of the Welcome screen, from main's src/view/WelcomeScreen.ts, its English
// strings (ui.welcomeScreen in src/i18n/locales/en.ts) and the rt-welcome rules in
// src/styles/base.css. Shown at the two-column card width the real screen uses on
// narrower panes. The quick-start photo is decoded from the plugin's own inlined copy.

import fs from 'node:fs';
import path from 'node:path';
import { figure, icon } from './shared.mjs';

const CARDS = [
	{ icon: 'book-open', title: 'Explore a finished book', desc: 'Add a complete Story Vault to this vault. Explore the scenes, beats, Pulse, Gossamer, and saved Inquiry briefings. No API key needed.', cta: 'Choose a story', hero: true },
	{ icon: 'compass', title: 'Set Book Project', desc: 'Choose the manuscript folder that drives the timeline, exports, Inquiry scope, and Book Manager.', cta: 'Open Book Manager', secondary: '→ or open Book Designer' },
	{ icon: 'book-up', title: 'Import a manuscript', desc: 'Bring in a Scrivener export or a Word document. Scenes, order, synopses and metadata come with it.', cta: 'Import manuscript' },
	{ icon: 'globe', title: 'Visit the website', desc: 'Join the community and share your journey at your own comfort level. Learn about the features available using the Radial Timeline & Editorialist ecosystem and get help.', cta: 'Open Website' },
];

const STEPS = [
	['compass', 'Set your novel folder inside the vault with <a>Book Manager</a>.'],
	['file-plus', 'Open the Command Palette <code>⌘ + P</code> and run <code>Note create</code>, or scaffold quickly with <code>Book Designer</code>.'],
	['layers', 'Populate scenes and then expand with subplots, beat systems and more.'],
	['map-pin', 'Decide early: How many acts? What is the span of time? Consider helpful context markers with backdrop notes or micro-backdrops.'],
	['target', 'Once you get in the rhythm, don’t forget to track your writing session time and word count and set due dates for scenes or publish stages.'],
];

// Writes the plugin's inlined quick-start photo next to the wiki images; returns its URL.
function authorImage(pluginDir, imagesOut) {
	const source = path.join(pluginDir, 'src/branding/welcomeAuthorImage.ts');
	const base64 = fs.existsSync(source) && fs.readFileSync(source, 'utf8').match(/data:image\/jpeg;base64,([^']+)'/)?.[1];
	if (!base64) return null;
	fs.mkdirSync(imagesOut, { recursive: true });
	fs.writeFileSync(path.join(imagesOut, 'welcome-author.jpg'), Buffer.from(base64, 'base64'));
	return '/images/welcome-author.jpg';
}

function card(c, i) {
	return [
		`<div class="wl-card${c.hero ? ' hero' : ''}" data-n="${String(i + 1).padStart(2, '0')}">`,
		`<span class="ghost">${icon(c.icon)}</span>`,
		`<span class="ic">${icon(c.icon)}</span>`,
		`<span class="t">${c.title}</span>`,
		`<span class="d">${c.desc}</span>`,
		c.secondary ? `<span class="sec">${c.secondary}</span>` : '',
		`<span class="cta">${c.cta}</span>`,
		'</div>',
	].join('');
}

export function renderWelcomeMockup({ alt, caption, pluginDir, imagesOut }) {
	const photo = authorImage(pluginDir, imagesOut);
	const [lead, rest] = (caption ?? 'Welcome screen — quick-start guide for new vaults').split(' — ');
	return figure({
		cls: 'rt-welcome',
		alt,
		lead: `${lead}.`,
		caption: rest ? `${rest[0].toUpperCase()}${rest.slice(1)}. Hover a card.` : 'Hover a card.',
		body: [
			'<div class="wl">',
			'<div class="wl-title" aria-hidden="true">Welcome</div>',
			'<p>Radial Timeline turns long-form narratives into a single, navigable story map. Track scenes, subplots, characters, beats, and timelines across novels, sagas, memoirs, and other sustained fiction or nonfiction projects. Pick a starting point below.</p>',
			'<p>Take a moment to <a>share your feedback</a> about Radial Timeline and the features you would like to see next to smooth your writing workflow. Radial Timeline is expanding in every direction, and your feedback helps guide it. Community feedback requires sign-in. Without a Community account, use our <a>contact form</a>. Happy Writing!</p>',
			`<div class="wl-cards">${CARDS.map(card).join('')}</div>`,
			'<div class="wl-flow">',
			photo ? `<img src="${photo}" alt="">` : '',
			'<div class="wl-flow-body"><div class="lead">Starting a new vault?</div><div class="steps">',
			...STEPS.map(([ic, text]) => `<div class="step">${icon(ic)}<span>${text}</span></div>`),
			'</div></div>',
			'</div>',
			'<p class="wl-foot">The Community is live — connect from Radial Timeline plugin settings → Community and share your writing journey.</p>',
			'<div class="wl-links"><a>YouTube videos</a><a>Community</a><a>Wiki — full documentation</a><a>Bug reports / feature requests</a></div>',
			`<div class="wl-backup">${icon('archive-restore')}<span>Back up your Obsidian vault regularly to protect against data loss. Learn more at <a>Obsidian backup guide</a>. Sync does not protect against all forms of data loss. Obsidian’s File recovery keeps snapshots of your notes, and <a>Obsidian Sync</a> or iCloud keeps a copy on your other devices.</span></div>`,
			'</div>',
		],
	});
}
