// Live mockup of the Radial Timeline view's title bar, from main's src/view/TimeLineView.ts
// (ensureBookSwitcher, the mode nav and its sub-navs, the writing-session idle label), its
// English strings (timeline.modes, timeline.subplotAlignment, timeline.search and
// ui.timeLineView in src/i18n/locales/en.ts) and the matching rules in src/styles/timeline.css.
//
// One bar, rendered two ways. The real bar is wider than the docs column, so each figure
// shows the part of it that its wiki screenshot showed:
//   - Mode buttons (view-rt-mode-buttons.png): the left end through the mode buttons.
//   - Tab bar actions (ui-tab-bar-actions.png): the mode buttons through the right end.
// The book, counts and badges are invented sample data. Mailbox and Desk Lamps show only
// once the vault is connected to Community; the layers icon only with 2+ subplot rings.

import { figure, icon } from './shared.mjs';

// The plugin's own 'rt-logo' icon (addIcon in main's src/main.ts), used on the tab.
const RT_LOGO = '<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(-56.82,-75.59) scale(0.12030)" fill="currentColor"><path d="M604.11,1274.16l-131.83.12,36.57-162.23c12.42-55.12,57.45-94.1,114.42-94.09h122.98c10.22.01,20-1.99,28.72-6.65,14.3-7.63,20.82-22.45,19.24-38.15-2.34-23.35-20.29-34.12-42.51-35.41l-201.37-.06,29.2-125.03,185.04.12c69.83,3.45,127.94,44.91,151.99,110.3,18.56,53.7,7.91,111.98-27.6,156.25-17.24,21.5-39.41,37.45-64.95,49.11l71.96,144.34c.9,1.81,1.8,2.59-1.12,1.42l-142.07.04-64.96-128.49-53.36-.13-30.34,128.56Z"/><path d="M937.3,1274.25l17.69-77.78,60.02-258.56-45.47-.23c-9.55-54.08-42.3-98.13-90.97-124.96l425-.04-28.48,125.02-129.43.05-78.44,336.43-129.93.06Z"/></g></svg>';

const BOOK = 'Northlight';
const MODES = [
	{ id: 'progress', name: 'Progress' },
	{ id: 'narrative', name: 'Narrative' },
	{ id: 'chronologue', name: 'Chronologue' },
	{ id: 'gossamer', name: 'Gossamer' },
];

// Sub-mode chips: a glyph (shown only in the narrowest bars) and a label.
const chip = ({ cls = '', glyph, label, tip, active }) =>
	`<span class="tb-chip${cls}${active ? ' is-active' : ''}" data-tip="${tip}"><span class="g">${glyph}</span><span class="l">${label}</span></span>`;

function modeNav(active) {
	const parts = [];
	// The subplot alignment chip leads the row in every mode with an all-scenes outer ring.
	if (active !== 'progress') {
		parts.push(`<span class="tb-subnav tb-align">${chip({ cls: ' is-neutral', glyph: '◍', label: 'Fill', tip: 'Fill — subplot scenes spread evenly across each act Click for Sequence.', active: true })}</span>`);
	}
	MODES.forEach((m, i) => {
		parts.push(`<span class="tb-mode${m.id === active ? ' is-active' : ''}" data-tip="${m.name} — press ${i + 1}"><span class="n">${i + 1}</span>${m.name}</span>`);
		if (m.id === 'narrative' && active === 'narrative') {
			parts.push(`<span class="tb-subnav">${chip({ cls: ' is-runtime', glyph: 'RT', label: 'Runtime', tip: 'Runtime overlay' })}</span>`);
		}
		if (m.id === 'chronologue' && active === 'chronologue') {
			parts.push(`<span class="tb-subnav">${chip({ cls: ' is-neutral', glyph: '⇧', label: 'Shift', tip: 'Shift — elapsed time comparison' })}${chip({ cls: ' is-alt', glyph: '⌥', label: 'Alt', tip: 'Alt — planetary calendar' })}</span>`);
		}
	});
	return `<span class="tb-modes">${parts.join('')}</span>`;
}

const iconBtn = (name, tip, cls = 'tb-ic') => `<span class="${cls}"${tip ? ` data-tip="${tip}"` : ''}>${icon(name)}</span>`;

// Right cluster order, as appended in ensureBookSwitcher: legend · search · books, then the
// title actions: Timetable · Canvas · commands · Manuscript export · Report a bug · Help ·
// Settings. Canvas opens a small menu (open the book's story map, choose one, create another).
const TITLE_ACTIONS = [
	['table-2', 'Timetable'],
	['layout-dashboard', 'Canvas'],
	['command', 'Radial Timeline commands'],
	['printer', 'Manuscript export'],
	['bug', 'Report a bug'],
	['life-buoy', 'Help'],
	['settings', 'Settings'],
];

function bar(active) {
	return [
		'<div class="tb-frame">',
		`<div class="tb-tabs"><span class="tb-tab"><span class="logo">${RT_LOGO}</span>${BOOK}<span class="x">${icon('x')}</span></span></div>`,
		'<div class="tb">',
		'<span class="tb-left">',
		`<span class="tb-nav">${icon('arrow-left')}${icon('arrow-right')}</span>`,
		'<span class="tb-session" data-tip="Start writing session, 45 min left today">45</span>',
		`<span class="tb-mail" data-tip="Mailbox: new replies to 2 of your questions">${icon('mail')}<span>Mailbox</span><b class="tb-badge">2</b></span>`,
		`<span class="tb-lamp" data-tip="Desk Lamps: 3 friends at their desks">${icon('lamp-ceiling')}<b class="tb-badge">3</b></span>`,
		active === 'gossamer' ? '' : iconBtn('layers', '', 'tb-ic tb-key'),
		'</span>',
		modeNav(active),
		'<span class="tb-right">',
		iconBtn('asterisk', '', 'tb-ic tb-legend'),
		`<span class="tb-search">${icon('search')}<span class="ph">Search timeline</span></span>`,
		`<span class="tb-books" data-tip="Book selector">${icon('book')}<span class="sel">${BOOK}${icon('chevron-down')}</span></span>`,
		...TITLE_ACTIONS.map(([name, tip]) => iconBtn(name, tip)),
		'</span>',
		iconBtn('ellipsis', 'More options', 'tb-ic tb-more'),
		'</div>',
		'<div class="tb-canvas"></div>',
		'</div>',
	].join('');
}

export function renderModeButtonsMockup({ alt }) {
	return figure({
		cls: 'rt-titlebar rt-tb-left',
		alt,
		lead: 'The title bar’s mode buttons, in Progress mode.',
		caption: 'Each mode carries its key, 1 to 4. To their left: back and forward, the writing-session count, Mailbox, Desk Lamps and the subplot key. An invented book. Hover a button for its tooltip.',
		body: [`<div class="tb-view">${bar('progress')}</div>`],
	});
}

export function renderTabBarMockup({ alt }) {
	return figure({
		cls: 'rt-titlebar rt-tb-right',
		alt,
		lead: 'The title bar’s right end, in Gossamer mode.',
		caption: 'The legend, timeline search, the book selector, then Timetable, Canvas, Radial Timeline commands, Manuscript export, Report a bug, Help and Settings; in a narrow pane those seven fold into one Timeline actions menu. Narrative and Chronologue add sub-mode chips beside their buttons (Runtime; Shift and Alt). Hover an icon.',
		body: [`<div class="tb-view">${bar('gossamer')}</div>`],
	});
}
