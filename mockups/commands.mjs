// Live mockup of Obsidian's command palette filtered to "Radial timeline", listing the
// commands a release build of main (8.0.3) registers: src/services/CommandRegistrar.ts,
// src/services/SceneAnalysisService.ts, src/RuntimeCommands.ts,
// src/timetable/TimetableService.ts and src/timetable/CanvasSketchEntry.ts, with names from
// commands.*, ui.subplotCanvas.paletteCommand, sceneAnalysis.service.commands.* and
// sceneAnalysis.commands.runtimeEstimator in src/i18n/locales/en.ts. The prefix is the
// plugin name in manifest.json.
//
// State shown: AI turned on, Pro active, a note open (no Timetable, Base or Canvas in front).
// Left out: commands behind betaFeatures (the Dev ones), and those that appear only in
// context: Timetable reset columns to recommended (a Timetable in front), Timetable restore a
// Radial Timetable view (a .base file), Canvas convert cards to scenes or sketches (a Canvas),
// Scene promote note (a promotable note) and Scene time assignment (prose selected).
//
// Obsidian orders the matches by its fuzzy score, which favours shorter names; ties
// follow recent use. The mockup sorts by length, then alphabetically.

import { figure, icon } from './shared.mjs';

const PREFIX = 'Radial timeline';
const COMMANDS = [
	'Timeline open',
	'Inquiry open',
	'Timeline search',
	'Note create',
	'Subplot manager',
	'Book designer',
	'Manuscript import',
	'Timeline date scaffold',
	'Timeline date audit',
	'Manuscript export',
	'Planetary time calculator',
	'Gossamer score manager',
	'Gossamer analysis', // AI on
	'Author progress report (APR)',
	'Community timeline share export',
	'Timetable open',
	'Canvas create subplot map',
	'Summary scene refresh', // AI on
	'Scene pulse analysis (manuscript order)', // AI on
	'Scene pulse analysis (subplot order)', // AI on
	'Runtime estimator', // Pro
];

const ordered = [...COMMANDS].sort((a, b) => a.length - b.length || a.localeCompare(b));

export function renderCommandsMockup({ alt }) {
	return figure({
		cls: 'rt-palette',
		alt,
		lead: 'The command palette, filtered to Radial timeline.',
		caption: 'A release build with AI turned on and Pro active, with a note open. With AI off, Gossamer analysis, Summary scene refresh and both Scene pulse commands are hidden; Runtime estimator needs Pro. The Timetable, Canvas and Scene commands that need a Timetable, Base, Canvas or selection in front join the list when one is. Hover a row.',
		body: [
			'<div class="cp">',
			`<div class="cp-input"><span class="q">${PREFIX}</span><span class="caret"></span><span class="clear">${icon('x')}</span></div>`,
			'<div class="cp-list">',
			...ordered.map((name, i) => `<div class="cp-item${i === 0 ? ' is-selected' : ''}"><b>${PREFIX}</b>: ${name}</div>`),
			'</div>',
			'<div class="cp-foot"><span><b>↑↓</b> to navigate</span><span><b>↵</b> to use</span><span><b>esc</b> to dismiss</span></div>',
			'</div>',
		],
	});
}
