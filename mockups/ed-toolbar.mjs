// Live mockup of Editorialist's inline suggestion toolbar in review mode, from Editorialist's
// src/ui/Toolbar.ts (renderReviewToolbar: leading Hide and ✱ legend, the meta row with the
// operation badge from OPERATION_ICONS, then Previous, Next, Apply, Defer, Rewrite myself,
// Backup to cut file and Reject), its English strings (toolbar.* in src/i18n/locales/en.ts) and
// the .editorialist-toolbar rules in styles.css. The state matches the wiki's screenshot: an Edit
// suggestion, entry 1 of 1, one pending. Hover a button for its action, or the ✱ for the legend,
// which lists the same rows as buildLegend.

import { figure, icon } from './shared.mjs';

const ACTIONS = [
	['arrow-left', 'Previous'],
	['arrow-right', 'Next'],
	['check', 'Apply edit', 'apply'],
	['clock', 'Defer'],
	['pen-line', 'Rewrite myself'],
	['archive', 'Backup to cut file'],
	['circle-off', 'Reject'],
];

// The legend's rows: icon, modifier, action (buildLegend in Toolbar.ts).
const LEGEND = [
	['check', 'Click', 'Apply edit'],
	['list-end', 'Shift', 'Apply edit and advance'],
	['list-checks', 'Shift + Cmd', 'Apply to all'],
	['clock', 'Click', 'Defer'],
	['pen-line', 'Click', 'Rewrite myself'],
	['archive', 'Click', 'Backup to cut file'],
	['folder-open', 'Shift', 'Open cut file for this scene'],
	['circle-off', 'Click', 'Reject'],
	['x', 'Click', 'Hide toolbar'],
];

export function renderEdToolbarMockup({ alt }) {
	const legend = LEGEND.map(([ic, keys, label]) => `<span class="lg-row"><span class="lg-ic">${icon(ic)}</span><span class="lg-keys">${keys}</span><span>${label}</span></span>`).join('');
	return figure({
		cls: 'rt-ed-toolbar',
		alt: alt || 'Editorialist’s inline suggestion toolbar',
		lead: 'The suggestion toolbar.',
		caption: 'An edit selected: entry 1 of 1, with one pending. Hover a button for its action, or the ✱ for the legend of every icon and modifier key.',
		body: [
			'<div class="et-stage">',
			'<div class="et" role="toolbar">',
			'<span class="et-lead">',
			`<span class="et-close" data-tip="Hide toolbar">${icon('x')}</span>`,
			`<span class="et-legend" tabindex="0" aria-label="Review shortcuts">${icon('asterisk')}<span class="et-pop" role="tooltip"><span class="lg-title">Review shortcuts</span>${legend}</span></span>`,
			'</span>',
			'<span class="et-meta">',
			`<span class="et-op">${icon('file-pen-line')}<span>Edit</span></span>`,
			'<span class="et-sep">•</span><span>Entry 1/1</span><span class="et-sep">•</span><span>1 pending</span>',
			'</span>',
			'<span class="et-actions">',
			...ACTIONS.map(([ic, label, kind]) => `<span class="et-btn${kind ? ` is-${kind}` : ''}" data-tip="${label}">${icon(ic)}</span>`),
			'</span>',
			'</div>',
			'</div>',
		],
	});
}
