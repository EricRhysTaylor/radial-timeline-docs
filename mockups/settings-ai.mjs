// Live mockup of Settings → AI, as it opens, from main's src/settings/sections/AiSection.ts
// (the hero card, AI Strategy, the resolved-model Preview and the head of Cost Estimate) and
// src/settings/sections/aiSettingsPreview.ts. English strings from settings.ai and
// ui.aiSection in src/i18n/locales/en.ts. Styling follows src/styles/rt-ui.css
// (.ert-ai-hero-*, .ert-ai-quick-grid, .ert-ai-resolved-preview) and
// src/styles/features/ai-settings.css.
//
// AI is on, the provider is Anthropic with a key that validated, and Model is Auto. A new
// vault starts with AI off. Auto's model is read from the plugin's own catalog
// (src/ai/registry/builtinModels.ts) at build time, so the preview names the model the
// documented release picks. The pane is cropped at the Cost Estimate heading: the table
// below it lists every provider's models and prices.

import fs from 'node:fs';
import path from 'node:path';
import { figure, icon } from './shared.mjs';
import { RI_LOGO, hero, settingsPane, toggle } from './settings.mjs';

// What Auto resolves to for Anthropic: the newest non-deprecated model on the stable channel
// (releaseChannels.ts selectLatestModelByReleaseChannel), newest by releasedAt.
function autoModel(pluginDir) {
	const file = path.join(pluginDir, 'src/ai/registry/builtinModels.ts');
	const entries = fs.readFileSync(file, 'utf8').split(/\n\s*provider: '/).slice(1).map((chunk) => ({
		provider: chunk.match(/^([^']+)'/)?.[1],
		id: chunk.match(/\bid: '([^']+)'/)?.[1],
		label: chunk.match(/\blabel: '([^']+)'/)?.[1],
		releasedAt: chunk.match(/\breleasedAt: '([^']+)'/)?.[1] ?? '',
		status: chunk.match(/\bstatus: '([^']+)'/)?.[1],
		channel: chunk.match(/\bchannel: '([^']+)'/)?.[1],
	}));
	const pick = entries
		.filter((m) => m.provider === 'anthropic' && m.channel === 'stable' && m.status !== 'deprecated' && m.releasedAt)
		.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))[0];
	if (!pick?.id || !pick.label) throw new Error(`AI settings mockup: no stable Anthropic model found in ${file}`);
	return pick;
}

const STRATEGY = [
	{ name: 'Provider', value: 'Anthropic', ready: true, desc: 'Select the AI service or Local LLM runtime that powers structural analysis and editorial insight.' },
	{ name: 'Model', value: 'Auto', desc: 'Use Auto for deterministic latest-stable selection, or pin a specific model.' },
	{ name: 'Access', value: 'Tier 1', desc: 'Set your provider access tier. Higher tiers unlock more context headroom.' },
];

export function renderSettingsAiMockup({ alt, pluginDir }) {
	const model = autoModel(pluginDir);
	return figure({
		cls: 'rt-settings',
		alt,
		lead: 'Settings → AI, as it opens.',
		caption: `AI on, with Anthropic and a validated key. Model is Auto, which the preview resolves to ${model.label}. Below the Cost Estimate heading come its pricing table, what gets sent to the AI, Role context and API keys.`,
		body: settingsPane({
			active: 'ai',
			body: [
				...hero({
					badge: 'AI',
					badgeIcon: 'cpu',
					badgeRight: `<span class="st-hero-toggle is-active"><span>Active</span>${toggle(true)}</span>`,
					title: 'Editorial AI for your manuscript.',
					subtitle: 'Evaluate structure, momentum, and continuity across your manuscript. Choose a provider, review pricing, and run Inquiry when you’re ready.',
					kicker: 'AI HIGHLIGHTS',
					features: [
						[RI_LOGO, 'Inquiry — Ask cross-scene questions and receive structured editorial feedback.'],
						['activity', 'Pulse — Examine scenes in context using Radial Timeline’s three-scene lens.'],
						['waypoints', 'Gossamer — Measure beat-level tension and narrative drive.'],
						['sparkles', 'Force multiplier — Expand analytical reach with contextual, actionable insight.'],
					],
				}),
				'<div class="st-card">',
				'<div><div class="st-section-title">AI Strategy</div><p class="st-section-desc">Choose which AI provider and model to use for Inquiry runs.</p></div>',
				'<div class="ai-grid">',
				...STRATEGY.map((s) => `<div class="ai-cell"><span class="nm">${s.name}</span><span class="st-select is-mono${s.ready ? ' is-ready' : ''}">${s.value}${icon('chevrons-up-down')}</span><span class="ds">${s.desc}</span></div>`),
				'</div>',
				'</div>',
				'<div class="ai-preview">',
				'<span class="kicker">Preview</span>',
				`<span class="model">${model.label}</span>`,
				`<span class="prov">Anthropic · ${model.id}</span>`,
				'<span class="pills"><span class="ai-pill is-on">Provider cache supported</span><span class="ai-pill">Context · Single-pass at this corpus</span></span>',
				'</div>',
				'<div class="st-card">',
				'<div><div class="st-section-title">Cost Estimate</div><p class="st-section-desc">Estimated pricing for your current manuscript scope.</p></div>',
				'</div>',
			],
		}),
	});
}
