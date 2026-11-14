// Live mockup of Settings → Inquiry, as it opens, from main's src/settings/SettingsTab.ts
// (renderInquiryHero) and src/settings/sections/InquirySection.ts (the Inquiry prompts
// section: the Canonical question library row and renderPromptConfiguration's zone cards),
// with zone texts from src/inquiry/prompts.ts and questions from
// src/inquiry/canonicalQuestions.ts. English strings from ui.settingsTab and
// ui.inquirySection in src/i18n/locales/en.ts. Styling follows src/styles/rt-ui.css,
// src/styles/inquiry.css, src/styles/features/templates.css and the zone colours in
// src/styles/variables.css.
//
// A new vault without Pro: each zone starts with its first core question, and the add row
// offers the other three core questions. The pane is cropped as the first screenful ends,
// after the Setup zone.

import { figure, icon } from './shared.mjs';
import { RI_LOGO, hero, settingsPane } from './settings.mjs';

const ZONES = [
	{
		key: 'setup', label: 'SETUP', icon: 'sprout',
		desc: 'Foundations the story depends on. Questions here examine what must already exist or be understood for the material to work: context, relationships, rules, and narrative assumptions. Use this zone to find missing groundwork, unrealized threads, or weak setup that later material relies on.',
		question: 'What must already be true in the material for the story to move smoothly?',
		options: ['2. Missing Foundations', '3. Foreshadowing Gaps', '4. Character Readiness'],
	},
	// Pressure (gauge) and Payoff (target) follow, below the crop.
];

function zone(z) {
	return [
		`<div class="iq-zone is-${z.key}">`,
		'<div class="iq-zone-head">',
		`<span class="tile">${icon(z.icon)}</span>`,
		`<span class="body"><span class="pill">${z.label}</span><span class="desc">${z.desc}</span></span>`,
		`<span class="st-iconbtn" data-tip="Collapse">${icon('chevron-down')}</span>`,
		'</div>',
		'<div class="iq-list">',
		'<div class="iq-row">',
		`<span class="lead"><b>1</b><span class="grip" data-tip="Drag to reorder">${icon('grip-vertical')}</span></span>`,
		'<span class="lines">',
		`<span class="top"><span class="st-input is-ro">${z.label[0]}${z.label.slice(1).toLowerCase()}</span><span class="lock">${icon('lock')}Fixed template</span></span>`,
		`<span class="st-input is-ro">${z.question}</span>`,
		'</span>',
		'</div>',
		z.options ? [
			'<div class="iq-row is-add">',
			`<span class="lead"><span class="plus">${icon('plus')}</span></span>`,
			'<span class="lines">',
			`<span class="top"><span class="st-input is-ph">Label (optional)</span><span class="st-select is-wide" data-tip="${z.options.join(' · ')}">Or choose a canonical question${icon('chevrons-up-down')}</span><span class="st-iconbtn is-cta" data-tip="Add question">${icon('plus')}</span></span>`,
			'<span class="st-input is-ph">Question text</span>',
			'</span>',
			'</div>',
		].join('') : '',
		'</div>',
		'</div>',
	].join('');
}

export function renderSettingsInquiryMockup({ alt }) {
	return figure({
		cls: 'rt-settings',
		alt,
		lead: 'Settings → Inquiry, as it opens.',
		caption: 'The hero card, then Inquiry prompts: the question library and the Setup zone with its first core question and the row that adds another. Pressure and Payoff follow below. Hover the question dropdown for its other choices.',
		body: settingsPane({
			active: 'inquiry',
			body: [
				...hero({
					badge: 'Inquiry · Signals',
					badgeSvg: RI_LOGO,
					title: 'Analyze your story as a complete system.',
					subtitle: 'Evaluate how scenes, books, and entire sagas work together. Inquiry uses your manuscript(s), outlines, characters, and worldbuilding to surface structural weak points, missing or underdeveloped material, and momentum issues—all in a single view with clear visual signals and quantifiers.',
					helper: 'Inquiry runs on the provider key you add in Settings → AI. Your key, your models.',
					kicker: 'Inquiry Focus Areas:',
					features: [
						['search', 'Source Scans — Choose scan locations, class scopes, and source types to include.'],
						['list', 'Prompt Slots — Draft reusable inquiry questions'],
						['layout-grid', 'Corpus Tiers — Calibrate source quality thresholds from sketchy → substantive depth'],
					],
				}),
				`<div class="st-heading"><span class="name">${icon('list')}<span>Inquiry prompts</span><span class="wiki">${icon('external-link')}</span></span></div>`,
				'<div class="st-row st-setting is-flush"><span class="info"><span class="name">Canonical question library</span><span class="desc">Frame Inquiry across three zones: Setup, Pressure, and Payoff. Add your own custom questions, install curated questions line by line, or load the curated Core set across all zones at once.</span></span><span class="ctl"><span class="st-pillbtn">Load Core Questions</span></span></div>',
				...ZONES.map(zone),
			],
		}),
	});
}
