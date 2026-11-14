// Live mockup of the Book Designer, from main's src/modals/BookDesignerModal.ts (onOpen: the
// hero badge, Location & Structure, Content Configuration with the Preview, Scene Sets &
// Extras, the footer) and its English strings (bookDesigner in src/i18n/locales/en.ts).
// Styling follows src/styles/book-designer.css.
//
// The Preview is drawn as renderPreview draws it: a 300-unit donut, one ring per subplot from
// the outside in, an act spoke every 360°/act count from 12 o'clock, and each act's scenes
// sharing its wedge evenly. Scenes go to acts and subplots by rebuildAutoAssignments (an even
// split across the chosen acts, the remainder to the last act, subplots in rotation), coloured
// by subplotColor (golden-angle hues). The "numbered" line follows updateTargetDesc.
//
// The book, subplots and characters are the invented Northlight of the Timetable mockups;
// Save The Cat is the active beat system and no scene layout is saved yet.

import { figure, icon } from './shared.mjs';

const BOOK = 'Northlight';
const SCENES = 30;
const TARGET = 60;
const ACTS = [1, 2, 3];
const SUBPLOTS = ['Main Plot', 'The Keeper', 'Harbor'];
const CHARACTERS = ['Mara', 'Ilse', 'Teodor'];

const subplotColor = (i, total) => (total <= 1 ? 'var(--m-accent)' : `hsl(${((i * 137.508) % 360).toFixed(1)}deg 62% 56%)`);

// rebuildAutoAssignments, for 1–3 subplots and any act list.
function assignments() {
	const base = Math.floor(SCENES / ACTS.length);
	const rem = SCENES % ACTS.length;
	const sizes = ACTS.map(() => base);
	if (base === 0) for (let i = 0; i < rem; i++) sizes[i] += 1;
	else if (ACTS.length === 3 && base === 1 && rem === 2) sizes.splice(0, 3, 2, 2, 1);
	else sizes[sizes.length - 1] += rem;
	const out = [];
	let scene = 1;
	ACTS.forEach((act, idx) => {
		for (let n = 0; n < sizes[idx]; n++, scene++) out.push({ scene, act, subplot: (scene - 1) % SUBPLOTS.length });
	});
	return out;
}

// updateTargetDesc: the first three scene numbers spread across the target length.
function numberedLine() {
	const step = (TARGET - 1) / (SCENES - 1);
	const shown = Math.min(3, SCENES);
	const examples = Array.from({ length: shown }, (_, i) => Math.round(1 + i * step));
	return `Scenes will be numbered: ${examples.join(', ')}${SCENES > 3 ? '...' : ''} based on ${SCENES} scenes across ${TARGET} units.`;
}

function slice(cx, cy, r0, r1, a0, a1) {
	const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
	const large = a1 - a0 > Math.PI ? 1 : 0;
	return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${large} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
}

function preview() {
	const cx = 150, cy = 150, outerR = 136, innerR = 52;
	const ring = (outerR - innerR) / SUBPLOTS.length;
	const totalActs = ACTS.length;
	const actAngle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / totalActs;
	const parts = ['<svg class="bd-wheel" viewBox="0 0 300 300" aria-hidden="true">'];
	for (let i = 0; i <= SUBPLOTS.length; i++) parts.push(`<circle class="guide" cx="${cx}" cy="${cy}" r="${outerR - i * ring}"/>`);
	for (let i = 0; i < totalActs; i++) {
		const a = actAngle(i);
		parts.push(`<line class="spoke" x1="${(cx + innerR * Math.cos(a)).toFixed(2)}" y1="${(cy + innerR * Math.sin(a)).toFixed(2)}" x2="${(cx + (outerR + 6) * Math.cos(a)).toFixed(2)}" y2="${(cy + (outerR + 6) * Math.sin(a)).toFixed(2)}"/>`);
	}
	const all = assignments();
	for (const act of ACTS) {
		const scenes = all.filter((s) => s.act === act);
		const span = (2 * Math.PI) / totalActs / scenes.length;
		scenes.forEach((s, i) => {
			const a0 = actAngle(act - 1) + i * span;
			const r1 = outerR - s.subplot * ring;
			parts.push(`<path class="slice" fill="${subplotColor(s.subplot, SUBPLOTS.length)}" d="${slice(cx, cy, r1 - ring, r1, a0, a0 + span)}"><title>Scene ${s.scene} · Act ${s.act} · ${SUBPLOTS[s.subplot]}</title></path>`);
		});
	}
	parts.push(`<circle class="core" cx="${cx}" cy="${cy}" r="${innerR}"/>`, '</svg>');
	return parts.join('');
}

const setting = (name, desc, control) => `<div class="bd-setting"><span class="info"><span class="name">${name}</span><span class="desc">${desc}</span></span>${control}</div>`;
const select = (value, cls = '') => `<span class="bd-select ${cls}">${value}${icon('chevrons-up-down')}</span>`;
const input = (value, cls = '') => `<span class="bd-input ${cls}">${value}</span>`;
const check = (label) => `<span class="bd-check"><i>${icon('check')}</i>${label}</span>`;
const pills = (options) => `<span class="bd-pills">${options.map(([label, on, cls = '']) => `<span class="bd-pill${on ? ' is-active' : ''} ${cls}">${label}</span>`).join('')}</span>`;

export function renderBookDesignerMockup({ alt }) {
	return figure({
		cls: 'rt-bd',
		alt,
		lead: 'The Book Designer.',
		caption: `An invented book: ${SCENES} scenes across three acts and three subplots, numbered to a target length of ${TARGET}. The Preview is laid out as the plugin lays it out; hover a scene to see its act and subplot. In the plugin you drag a scene to another act or ring to place it by hand.`,
		body: [
			'<div class="bd">',
			`<span class="bd-close">${icon('x')}</span>`,
			`<span class="bd-badge"><b>SETUP</b><i>•</i><span>${BOOK}</span><i>•</i><span class="mode">Auto mode</span><span class="wiki">${icon('external-link')}</span></span>`,
			'<div class="bd-title">Book designer</div>',
			'<p class="bd-sub">Configure and generate the scaffold for your new novel. Drag scenes in Preview to different acts and subplots to activate manual mode. Save the template to reuse it later.</p>',
			// Location & Structure
			'<div class="bd-card">',
			'<div class="bd-head">Location &amp; Structure</div>',
			setting('Target book', 'Choose the Book Manager project where scenes and beats will be created.', select(BOOK, 'is-lg')),
			setting('Date increment per scene', 'Timeline increment across scenes (e.g. 1 hour, 1 day, 1 week). Set to 0 to disable increments.', input('1 day', 'is-sm')),
			'<div class="bd-block bd-duo">',
			setting('Scenes to generate', 'Number of template scene files to create with YAML frontmatter.', input(SCENES, 'is-xs')),
			setting('Target book length', numberedLine(), input(TARGET, 'is-xs')),
			'</div>',
			`<div class="bd-block bd-acts"><span class="label">Acts to distribute scenes across</span>${ACTS.map((n) => check(`Act ${n}`)).join('')}</div>`,
			'</div>',
			// Content Configuration
			'<div class="bd-card">',
			'<div class="bd-head">Content Configuration</div>',
			'<div class="bd-block bd-content">',
			'<div class="left">',
			`<div class="bd-stacked"><span class="name">Subplots</span><span class="desc">Enter one subplot per line.</span><span class="bd-area">${SUBPLOTS.join('<br>')}</span></div>`,
			`<div class="bd-stacked"><span class="name">Characters</span><span class="desc">Enter one character per line.</span><span class="bd-area">${CHARACTERS.join('<br>')}</span></div>`,
			'</div>',
			'<div class="right">',
			'<div class="bd-preview-head"><b>Preview</b><span>— Auto distribution</span></div>',
			preview(),
			`<div class="bd-legend">${SUBPLOTS.map((name, i) => `<span><i style="background:${subplotColor(i, SUBPLOTS.length)}"></i>${name}</span>`).join('')}</div>`,
			'</div>',
			'</div>',
			'</div>',
			// Scene Sets & Extras
			'<div class="bd-card">',
			'<div class="bd-head">Scene Sets &amp; Extras</div>',
			'<div class="bd-duo-row">',
			`<div class="bd-block"><span class="label">Scene set</span>${pills([['Base Scene Set', true], ['Advanced properties', false]])}</div>`,
			`<div class="bd-block"><span class="label">Generate Save The Cat beats</span>${pills([['No', true], ['Yes', false, 'is-yes']])}</div>`,
			'</div>',
			'<div class="bd-block">',
			setting('Scene layouts', 'Select a saved layout (acts, subplots, assignments, metadata).', select('—', 'is-md')),
			'<div class="bd-actions"><span class="bd-btn">Save Scene Set</span><span class="bd-btn">Reset</span><span class="bd-btn is-pro">Demo Project</span><span class="bd-btn is-danger" aria-disabled="true">Delete layout</span></div>',
			'<span class="bd-note">Includes scenes, acts, subplots, beats, and chronologue timing.</span>',
			'</div>',
			'</div>',
			'<div class="bd-footer"><span class="bd-btn is-cta">Create Book</span><span class="bd-btn">Cancel</span></div>',
			'</div>',
		],
	});
}
