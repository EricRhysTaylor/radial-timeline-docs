// Live mockup of the Timetable beside the wheel, in Progress mode, as main (8.0.3) draws it:
// the Bases header with the plugin's Saved views caption and help, the Radial Timetable toolbar
// (src/timetable/TimetableView.ts, renderLayoutSwitch: Quick Workspace, Table / Panels / Outline,
// Canvas map, the book button and Mode), the fitted number column and its control panel
// (renderNumberCell and renderControls), the corner's +, lens and ✱ (renderCorner), the
// recommended columns with header icons, the short When, relative Due, and the Words bar.
// Styling follows src/styles/timetable.css. The toolbar is drawn as in a wide pane; under
// 1350 px the plugin folds Table, Panels and Outline into one menu.
// Returns one HTML block with no blank lines, so Markdown passes it through untouched.
// Hover links rows and wheel cells with CSS :has() only (see src/styles/mockups.css).
// The book, scenes and subplots are invented sample data; Due reads as if today were 25 Oct 2026.

import { figure, icon } from './shared.mjs';

const SUBPLOTS = [
	{ name: 'Main Plot', color: '#a35ca7' },
	{ name: 'The Keeper', color: '#6461A0' },
	{ name: 'Harbor', color: '#0A81D1' },
];

// chip: the Progress-mode number cell, stage color plus status pattern.
const STAGE = { zero: '#9E70CF', author: '#5E85CF', house: '#F2863C', late: '#d9605a' };
// The stage letter's color: the Publish Stage colors.
const LETTER = { Z: '#9E70CF', A: '#5E85CF', H: '#F2863C', P: '#6FB971' };
// The invented book, shared with the Outline mockup (timetable-outline.mjs).
export const ROWS = [
	{ kind: 'beat', num: '0.01', name: 'Opening Image', system: 'Save the Cat', purpose: 'The keeper alone with the lamp, before anyone arrives.' },
	{ kind: 'scene', id: 1, num: '1', name: 'The Lighthouse Keeper', chip: 'author-done', stage: 'author', letter: 'A', status: 'Complete · Author', when: 'Fri Apr 6 · 7PM', whenFull: 'Fri Apr 6, 2085 @ 7PM', dur: '2h', durFull: '2 hours', character: 'Mara', place: 'North Light', due: { kind: 'done', text: 'Oct 20', full: 'Tue, Oct 20, 2026' }, words: 2140, rings: [0, 1], synopsis: 'Mara finds the lamp log torn out at the week she arrived.' },
	{ kind: 'scene', id: 2, num: '2', name: 'Salt Ledger', chip: 'author-working', stage: 'author', letter: 'A', status: 'Working · Author · Due in 3 days', when: 'Sat Apr 7 · 6:30AM', whenFull: 'Sat Apr 7, 2085 @ 6:30AM', dur: '45m', durFull: '45 minutes', character: 'Mara, Ilse', place: 'Harbor Office', due: { kind: 'soon', text: 'in 3 days', full: 'Wed, Oct 28, 2026' }, words: 1650, rings: [0, 2], pending: 'Cut the second ledger argument; Ilse leaves angrier.', synopsis: 'Ilse brings the harbor accounts and asks Mara to sign for oil she never received.' },
	{ kind: 'scene', id: 3, num: '3', name: 'Fog Bell', chip: 'late', stage: 'late', letter: 'A', status: 'Overdue · Author · Due 4 days ago', when: 'Sat Apr 7 · 9PM', whenFull: 'Sat Apr 7, 2085 @ 9PM', dur: '1h', durFull: '1 hour', character: 'Ilse', place: 'Lantern Row', due: { kind: 'late', text: '4 days ago', full: 'Wed, Oct 21, 2026' }, words: 980, rings: [0, 2], synopsis: 'The bell rings with no hand on the rope.' },
	{ kind: 'sketch', num: '–', name: 'The Keeper’s Brother', planned: [1], synopsis: 'Maybe the keeper had a brother on the mainland?' },
	{ kind: 'scene', id: 4, num: '4', name: 'Night Crossing', chip: 'zero-todo', stage: 'zero', letter: 'Z', status: 'Todo · Zero', when: 'Mon Apr 9', whenFull: 'Mon Apr 9, 2085', dur: '3d', durFull: '3 days', character: 'Teodor', place: 'The Strait', due: { kind: 'later', text: 'in 12 days', full: 'Fri, Nov 6, 2026' }, words: 3420, rings: [0], synopsis: '' },
	{ kind: 'scene', id: 5, num: '5', name: 'The Keeper’s Log', chip: 'house-done', stage: 'house', letter: 'H', status: 'Complete · House', when: 'Tue Apr 10 · 8AM', whenFull: 'Tue Apr 10, 2085 @ 8AM', dur: '30m', durFull: '30 minutes', character: 'Mara', place: 'North Light', due: { kind: 'done', text: 'Oct 2', full: 'Fri, Oct 2, 2026' }, words: 1210, rings: [0, 1], synopsis: 'Mara reads the log aloud to the inspector.' },
];
const scenes = ROWS.filter((r) => r.kind === 'scene');
const MEDIAN = [...scenes.map((r) => r.words)].sort((a, b) => a - b)[Math.floor(scenes.length / 2)];
const fmt = (n) => n.toLocaleString('en-US');
const attr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// ── Wheel geometry ──
const C = 150;
const RINGS = [[108, 134], [80, 106], [52, 78]]; // outer to inner, one per subplot
const ACT1 = [-90, 30];
const FUTURE = [[30, 150, [7, 4, 3]], [150, 270, [7, 3, 2]]]; // acts 2 and 3: cells per ring

const polar = (r, deg) => {
	const a = (deg * Math.PI) / 180;
	return `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
};
function arc(r0, r1, a0, a1) {
	const pad = 0.9;
	const s = a0 + pad, e = a1 - pad;
	const large = e - s > 180 ? 1 : 0;
	return `M${polar(r1, s)}A${r1} ${r1} 0 ${large} 1 ${polar(r1, e)}L${polar(r0, e)}A${r0} ${r0} 0 ${large} 0 ${polar(r0, s)}Z`;
}
const FILL = {
	'author-done': STAGE.author,
	'author-working': 'url(#rt-p-working)',
	late: STAGE.late,
	'zero-todo': 'url(#rt-p-todo)',
	'house-done': STAGE.house,
};

function wheel() {
	const cells = [];
	RINGS.forEach(([r0, r1], ring) => {
		const inRing = scenes.filter((s) => s.rings.includes(ring));
		const step = (ACT1[1] - ACT1[0]) / inRing.length;
		inRing.forEach((s, i) => {
			cells.push(`<path class="cell" data-s="${s.id}" style="--c:${STAGE[s.stage]}" fill="${FILL[s.chip]}" d="${arc(r0, r1, ACT1[0] + i * step, ACT1[0] + (i + 1) * step)}"><title>${s.num} ${s.name} · ${SUBPLOTS[ring].name}</title></path>`);
		});
		for (const [a0, a1, counts] of FUTURE) {
			const n = counts[ring];
			const w = (a1 - a0) / n;
			for (let i = 0; i < n; i++) cells.push(`<path class="cell later" d="${arc(r0, r1, a0 + i * w, a0 + (i + 1) * w)}"/>`);
		}
	});
	const dividers = [-90, 30, 150].map((a) => `<path class="act-line" d="M${polar(48, a)}L${polar(140, a)}"/>`).join('');
	// Act labels sit just after each act's opening line, outside the rings, as on the wheel.
	const labels = [['ACT 1', -82], ['ACT 2', 40], ['ACT 3', 160]].map(([t, a]) => {
		const [x, y] = polar(143, a).split(' ');
		return `<text class="act" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${t}</text>`;
	}).join('');
	return [
		'<svg class="rt-wheel" viewBox="0 0 300 300" aria-hidden="true">',
		'<defs>',
		`<pattern id="rt-p-working" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#b3c6ec"/><rect width="3" height="6" fill="${STAGE.author}"/></pattern>`,
		`<pattern id="rt-p-todo" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#efe7f8"/><path d="M0 6L6 0M0 0L6 6" stroke="${STAGE.zero}" stroke-opacity="0.6" stroke-width="1.2"/></pattern>`,
		'</defs>',
		...cells,
		dividers,
		labels,
		`<text class="hub" x="${C}" y="${C}" text-anchor="middle" dominant-baseline="middle">Northlight</text>`,
		'</svg>',
	].join('\n');
}

function ringSquares(row) {
	const names = [];
	const squares = SUBPLOTS.map((sp, i) => {
		if (row.rings?.includes(i)) { names.push(sp.name); return `<i class="on" style="--r:${sp.color}"></i>`; }
		if (row.planned?.includes(i)) { names.push(`${sp.name} (planned)`); return `<i class="planned" style="--r:${sp.color}"></i>`; }
		return '<i></i>';
	}).join('');
	return `<span class="rings" title="${names.join(', ') || 'No subplots'}">${squares}</span>`;
}

// The first column: the number chip, then the row's control panel, each control in its own place.
function controls(r) {
	const slot = r.kind === 'scene'
		? `<span class="slot"><span class="stage" style="--st:${LETTER[r.letter]}">${r.letter}</span><i class="cb"></i></span>`
		: `<span class="slot"><span class="mini-btn">${icon('chevron-right')}</span><i class="cb"></i></span>`;
	const pending = r.pending ? `<span class="tc is-pending" title="${attr(`Pending edits: ${r.pending}`)}">${icon('pencil-line')}</span>` : '<span class="tc"></span>';
	const synopsis = `<span class="tc${r.synopsis ? '' : ' is-empty'}" title="${attr(r.synopsis ? `Synopsis: ${r.synopsis}` : 'Synopsis empty')}">${icon('align-left')}</span>`;
	let last = '';
	if (r.kind !== 'scene') last = `<span class="mini-btn" title="Promote to scene">${icon('file-up')}</span>`;
	else if (r.due.kind !== 'done') {
		const dot = r.due.kind === 'late' || r.due.kind === 'soon' ? `<span class="dot ${r.due.kind}"></span>` : '';
		last = `${dot}<span class="steps"><b title="Advance one day">+</b><b title="Advance one week">++</b></span>`;
	}
	return `${slot}${pending}${synopsis}<span class="dslot">${last}</span>`;
}

function due(d) {
	const check = d.kind === 'done' ? icon('check') : '';
	return `<span class="due is-${d.kind}" title="${d.full}">${check}${d.text}</span>`;
}

function words(n) {
	const ratio = n / (2 * MEDIAN);
	const tip = `${fmt(n)} words · ${(n / MEDIAN).toFixed(1)}× the median (${fmt(MEDIAN)})`;
	return `<span class="words" title="${tip}"><span class="n">${fmt(n)}</span><span class="bar${ratio > 1 ? ' over' : ''}"><b style="width:${Math.round(Math.min(1, ratio) * 100)}%"></b></span></span>`;
}

function row(r) {
	if (r.kind === 'beat') {
		return `<tr class="beat"><td class="num"><span class="ninner"><span class="chip c-beat">${r.num}</span></span></td><td colspan="8"><b>${r.name}</b><span class="sys">${r.system}</span>${r.purpose}</td></tr>`;
	}
	if (r.kind === 'sketch') {
		return `<tr class="sketch"><td class="num"><span class="ninner"><span class="chip c-sketch">${r.num}</span>${controls(r)}</span></td><td>${ringSquares(r)}</td><td class="name">${r.name}</td><td></td><td></td><td></td><td></td><td></td><td class="faint">${r.synopsis}</td></tr>`;
	}
	return `<tr data-s="${r.id}" style="--c:${STAGE[r.stage]}"><td class="num"><span class="ninner"><span class="chip c-${r.chip}" title="${r.status}">${r.num}</span>${controls(r)}</span></td><td>${ringSquares(r)}</td><td class="name">${r.name}</td><td><span class="when" title="${r.whenFull} · ${r.durFull}">${r.when}<span class="pill">${r.dur}</span></span></td><td>${r.character}</td><td>${r.place}</td><td>${due(r.due)}</td><td>${words(r.words)}</td><td>${r.synopsis}</td></tr>`;
}

// The plugin's 'rt-circle-letter-o' icon (addIcon in main's src/main.ts): the Mode button while
// the table follows the timeline (a pinned mode shows a lock).
const FOLLOW_ICON = '<svg viewBox="0 0 100 100" class="lucide" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="8.333"><circle cx="50" cy="50" r="16.667"/><circle cx="50" cy="50" r="41.667"/></g></svg>';

// Under Obsidian's Bases header: the Radial Timetable toolbar, in renderLayoutSwitch's order.
export function toolbar({ layout = 'table', mode = 'Progress' } = {}) {
	const sw = (ic, label) => `<span class="sw${label.toLowerCase() === layout ? ' is-on' : ''}">${icon(ic)}${label}</span>`;
	return [
		'<div class="tt-toolbar">',
		`<span class="qw" title="Quick Workspace: open a reference document beside the table">${icon('panels-left-right')}Quick Workspace${icon('chevron-down')}</span>`,
		'<span class="cap">Radial Timetable</span>',
		sw('table-2', 'Table'),
		sw('layout-grid', 'Panels'),
		sw('list-tree', 'Outline'),
		`<span class="sw canvas" title="Canvas map: open, choose or create the book’s subplot map">${icon('layout-dashboard')}Canvas map</span>`,
		`<span class="book" title="Book: Northlight">${icon('book')}${icon('chevron-down')}</span>`,
		`<span class="modebtn" title="Following the timeline: ${mode}">${FOLLOW_ICON}<span class="cap">Mode</span>${mode}${icon('chevron-down')}</span>`,
		'</div>',
	].join('');
}

// Obsidian's Bases header, with the plugin's Saved views caption and help.
export function basesBar(results) {
	return `<div class="pane-bar"><span class="cap">Saved views</span><span class="title views">${icon('table-2')}Radial Timetable${icon('chevron-down')}</span><span class="help" title="Saved views are native Obsidian. Table, Panels and Outline below are Radial Timetable curated layouts.">${icon('circle-help')}</span><span>${results} results</span><span class="spacer"></span><span>Sort</span><span>Group</span><span>Filter</span><span>Properties</span></div>`;
}

const head = (iconName, label, extra = '') => `<th><span class="h">${iconName ? icon(iconName) : ''}${label}${extra}</span></th>`;

export function renderTimetableMockup({ alt }) {
	return figure({
		cls: 'rt-tt',
		alt,
		lead: 'The Timetable beside the wheel, in Progress mode.',
		caption: 'An invented book, in the Table layout. Hover a row or a cell on the wheel: each points at the other, as in Obsidian. On a row, hover the pencil or the Synopsis icon to read it, or the Due and Words cells for the full date and the median. In a narrower pane, Table, Panels and Outline fold into one menu.',
		body: [
			'<div class="side wheel-side">',
			`<div class="pane-bar"><span class="title">${icon('chart-pie')}Northlight</span><span class="spacer"></span><b class="mode">1 Progress</b></div>`,
			wheel(),
			'</div>',
			'<div class="side table-side">',
			basesBar(7),
			toolbar(),
			'<div class="pane-scroll">',
			'<table class="tt" style="width:1242px"><colgroup><col style="width:124px"><col style="width:54px"><col style="width:162px"><col style="width:176px"><col style="width:96px"><col style="width:100px"><col style="width:84px"><col style="width:90px"><col style="width:360px"></colgroup>',
			`<thead><tr><th><span class="corner">${['plus', 'scan-eye', 'asterisk'].map(icon).join('')}</span></th><th>${ringSquares({ rings: [0, 1, 2] })}</th>${head('', 'file name')}${head('calendar-clock', 'When', '<span class="yr">· 2085</span>')}${head('users', 'Character')}${head('map-pin', 'Place')}${head('calendar-check', 'Due')}${head('pilcrow', 'Words')}${head('align-left', 'Synopsis')}</tr></thead>`,
			`<tbody><tr class="group"><td colspan="9">${icon('chevron-down')}Act 1<span class="cnt">7</span></td></tr>`,
			ROWS.map(row).join('\n'),
			'</tbody></table>',
			'</div>',
			'</div>',
		],
	});
}
