// Live mockup of Settings → Advanced, from main's src/settings/SettingsTab.ts
// (renderAdvancedHero) and src/settings/sections/ConfigurationSection.ts, with
// src/settings/sections/MetadataSection.ts for the remap row and src/settings/pathChip.ts for
// the folder chips. English strings from ui.settingsTab, settings.configuration,
// ui.configurationSection and ui.metadataSection in src/i18n/locales/en.ts. Styling follows
// src/styles/rt-ui.css (.ert-config-group, .ert-config-row-icon) and src/styles/settings.css
// (.ert-path-chip).
//
// The whole tab, in a new vault's state: every default on, except the chapter markers, the
// frontmatter remap and the AI content logs. The Logs and Export chips show the default
// folders; the chapter-marker status reads as it does for an invented book with 24 chapters.

import { figure, icon } from './shared.mjs';
import { hero, settingsPane, toggle } from './settings.mjs';

// The chip shortens paths under the plugin's system folder (shortenVaultPath); the tooltip
// keeps the full path.
const chip = (label, path, count) => `<span class="st-chip" data-tip="${path}">${count ? `<b>${count}</b>` : ''}${icon('folder')}<span>${label}</span></span>`;

const row = ({ icon: ic, name, desc, ctl }) => [
	'<div class="st-row st-setting">',
	`<span class="info"><span class="name">${ic ? `<span class="ri">${icon(ic)}</span>` : ''}${name}</span><span class="desc">${desc}</span></span>`,
	`<span class="ctl">${ctl}</span>`,
	'</div>',
].join('');

const dropdown = (value) => `<span class="st-select">${value}${icon('chevrons-up-down')}</span>`;

// Timeline display, in the order ConfigurationSection adds the rows.
const DISPLAY = [
	{ icon: 'git-commit-vertical', name: 'Show time notation bar in scene notes', desc: 'In scene notes, a vertical bar beside the text marks each time phrase, such as "an hour later", in editing and Reading views. Other notes never show it. Turn off to hide the bar; scene timing in the note title bar stays visible.', ctl: toggle(true) },
	{ icon: 'mail', name: 'Show community mailbox', desc: 'When this vault is connected to the Community, a Mailbox button beside the writing-session control marks new replies to your requests and questions. It checks the website about once an hour and when Obsidian regains focus.', ctl: toggle(true) },
	{ icon: 'lamp-ceiling', name: 'Show desk lamps', desc: 'When this vault is connected to the Community, a lamp beside the Mailbox shows which of your Desk Lamps are at their desks, and the session panel lets you share a session with them. Turn off to hide both and keep your own lamp off.', ctl: toggle(true) },
	{ icon: 'unfold-horizontal', name: 'Auto-expand clipped scene titles', desc: 'When hovering over a scene, automatically expand it if the title text is clipped. Disable this if you prefer to quickly slide through scenes and read titles from the synopsis instead.', ctl: toggle(true) },
	{ icon: 'bookmark', name: 'Show part and chapter markers', desc: 'Display part and chapter boundaries as small badges on the Narrative all-scenes ring. A scene that opens both shows a combined marker. 24 active chapter markers in the current active book.', ctl: toggle(false) },
	{ icon: 'history', name: 'Recent drag move overlay in narrative mode', desc: 'Shows the last committed scene and beat drag moves in narrative timeline.', ctl: toggle(true) },
	{ icon: 'a-large-small', name: 'Readability size', desc: 'Choose a curated font sizing profile for select timeline text. Large may be helpful for low-res screens; Normal is recommended for standard and high-dpi displays.', ctl: dropdown('Normal') },
];

const LOGS = [
	{ name: 'Logs', desc: 'Runtime logs, archives, snapshots, and move history.', ctl: chip('Logs', 'Radial Timeline/Logs') },
	{ name: 'Export folder', desc: 'Destination for manuscript, outline, and cue card exports (Markdown, PDF, beat sheets, index cards). Must be a folder inside your vault.', ctl: chip('Export', 'Radial Timeline/Export') },
	{ name: 'Enable AI content logs', desc: 'When enabled, full prompts, materials, and API responses are written to feature content folders under Logs. Concise logs, archives, snapshots, and move history are always written regardless of this toggle.', ctl: chip('Content logs', 'Radial Timeline/Logs') + toggle(false) },
];

export function renderSettingsAdvancedMockup({ alt }) {
	return figure({
		cls: 'rt-settings',
		alt,
		lead: 'Settings → Advanced.',
		caption: 'The whole tab as a new vault has it: the hero card, then Configuration’s three groups. Hover a folder chip for its full path.',
		body: settingsPane({
			active: 'advanced',
			full: true,
			body: [
				...hero({
					badge: 'Advanced · configuration',
					badgeIcon: 'pyramid',
					title: 'Configuration and system controls.',
					subtitle: 'Configuration now lives here. Use this tab for timeline display controls, metadata remapping, logs, output folders, and other system-level behavior.',
					kicker: 'Currently here:',
					features: [
						['monitor', 'Timeline display controls and marker overlays'],
						['folder-cog', 'Logs, output folders, and generated file locations'],
						['waypoints', 'Metadata remapping and manuscript behavior controls'],
					],
				}),
				`<div class="st-heading"><span class="name">${icon('pyramid')}<span>Configuration</span><span class="wiki">${icon('external-link')}</span></span></div>`,
				'<div class="st-group-title">Timeline display</div>',
				`<div class="st-rows">${DISPLAY.map(row).join('')}</div>`,
				'<div class="st-group-title">Schema &amp; manuscript</div>',
				`<div class="st-panel">${row({ name: 'Remap frontmatter field keys', desc: 'Map custom frontmatter keys to Radial Timeline scene core fields.', ctl: toggle(false) })}</div>`,
				`<div class="st-rows">${row({ name: 'Manuscript ripple rename: normalize numeric prefixes after drag reorder.', desc: 'Renames scene and active-beat filenames only. Scenes stay integer (1, 2, 3). Beats become decimal minors (1.01, 1.02).', ctl: toggle(true) })}</div>`,
				'<div class="st-group-title">Logs</div>',
				`<div class="st-rows">${LOGS.map(row).join('')}</div>`,
			],
		}),
	});
}
