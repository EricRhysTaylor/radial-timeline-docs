// Live mockup of the Timetable's Outline layout, from main's src/timetable/TimetableView.ts:
// renderOutlineDocuments (the Outline documents tray, its tools and the insertion line) and
// renderPanels with the outline flag (act headings with their insert button, then scenes,
// sketches and beats in narrative order, each with its synopsis or purpose). English strings
// from ui.timetable in src/i18n/locales/en.ts. Styling follows src/styles/timetable.css
// (.ert-outline-documents*, .is-outline). The Bases header and toolbar come from
// timetable.mjs, with Outline selected.
//
// The same invented book as the Table mockup, in Narrative mode. The tray holds one note
// with Class: Outline, which appears by itself, and one attached note, which can be unlinked.
// Show beats is on, so the story beat sits among the scenes.

import { figure, icon } from './shared.mjs';
import { ROWS, basesBar, toolbar } from './timetable.mjs';

const DOCUMENTS = [
	{ name: 'Northlight outline', icon: 'list-tree', type: 'Outline', path: 'Books/Northlight/Northlight outline.md' },
	{ name: 'Harbor research', icon: 'file-text', type: 'Note', path: 'Research/Harbor research.md', attached: true },
];

const tip = (text) => `title="${text}"`;
const open = `<span class="ic open" ${tip('Open note')}>${icon('file-text')}</span>`;
const insert = `<span class="ic ins" ${tip('Place new sketch after this')}>${icon('circle-plus')}</span>`;

function documentCard(d) {
	return [
		'<span class="ol-card">',
		`<span class="file" ${tip(d.path)}><span class="dic">${icon(d.icon)}</span><span class="fn">${d.name}</span><span class="ty">${d.type}</span></span>`,
		`<span class="ic convert" ${tip('Create sketches from this document')}>${icon('list-plus')}</span>`,
		d.attached ? `<span class="ic remove" ${tip('Remove document link')}>${icon('x')}</span>` : '',
		'</span>',
	].join('');
}

function row(r) {
	if (r.kind === 'beat') {
		return `<div class="ol-row is-beat"><span class="head"><span class="n">${r.num}</span><b>${r.name}</b></span>${open}<p class="text">${r.purpose}</p></div>`;
	}
	const grip = `<span class="grip">${icon('grip-vertical')}</span>`;
	if (r.kind === 'sketch') {
		return `<div class="ol-row is-sketch">${grip}<span class="head">${insert}<b>${r.name}</b><span class="kind">Sketch</span></span><span class="ic promote" ${tip('Promote to scene')}>${icon('file-up')}</span>${open}<span class="drawer">Expand sketch</span></div>`;
	}
	const text = r.synopsis ? `<p class="text">${r.synopsis}</p>` : '<p class="text is-empty">Add synopsis</p>';
	return `<div class="ol-row is-scene">${grip}<span class="head">${insert}<span class="n">${r.num}</span><b>${r.name}</b></span>${open}${text}</div>`;
}

export function renderTimetableOutlineMockup({ alt }) {
	return figure({
		cls: 'rt-tt rt-outline',
		alt,
		lead: 'The Outline layout.',
		caption: 'The same invented book as the Table, act by act in narrative order: the Outline documents tray, then Act 1 with a story beat, its scenes and a sketch. Hover a document card for its tools, or a row’s ⊕ to place a new sketch after it.',
		body: [
			'<div class="side">',
			basesBar(7),
			toolbar({ layout: 'outline', mode: 'Narrative' }),
			`<div class="ol-corner">${['plus', 'scan-eye', 'asterisk'].map(icon).join('')}</div>`,
			'<div class="ol-docs">',
			'<div class="ol-tray">',
			'<div class="content">',
			`<div class="heading"><span class="drop">${icon('folder-input')}</span><b>Outline documents</b><span class="hint">Click to choose a vault note or drop notes here</span></div>`,
			`<div class="shelf">${DOCUMENTS.map(documentCard).join('')}</div>`,
			'</div>',
			'<div class="tools">',
			`<span class="tool" ${tip('Attach document')}>${icon('file-plus-2')}</span>`,
			`<span class="tool" ${tip('Copy the selected text from the open reference document into a new sketch')}>${icon('file-input')}</span>`,
			`<span class="tool is-on" ${tip('Hide beats')}>${icon('list-music')}</span>`,
			'</div>',
			'</div>',
			'<div class="position">Choose an act, scene, or sketch below</div>',
			'</div>',
			'<div class="ol-list">',
			`<div class="ol-act"><span>▾ Act 1</span><span class="ic ins" ${tip('Place new sketch at end of Act 1')}>${icon('circle-plus')}</span></div>`,
			...ROWS.map(row),
			'</div>',
			'</div>',
		],
	});
}
