// @ts-check
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sidebar from './src/generated/sidebar.json' with { type: 'json' };

// Two looks from one codebase. `paper` (the default) matches radialtimeline.com and the newsletter:
// paper, Satoshi, Geist Mono, serif headings. `note` is the earlier Timetable-design-note look:
// DOCS_THEME=note npm run build
const THEME = process.env.DOCS_THEME === 'note' ? 'note' : 'paper';

// Kalice headings, only where the Claude Type EULA allows them. Web fonts may be served only from a
// domain we own, protected against hotlinking and direct download, and never from a repository.
//  - Public builds (CI, GitHub Pages) load Kalice from fonts.radialtimeline.com, our font host
//    (font-host/), which serves it only to https://docs.radialtimeline.com. The build ships no font
//    files, so it is safe for a public repo. On any other origin the fonts are refused and the
//    headings fall back to Newsreader. KALICE_URL points a build at another such host.
//  - Local builds bundle the licensed files in src/fonts/kalice/ (git-ignored), which never leave
//    this Mac. GitHub Pages lets any site load its files, so those must never be deployed there.
//  - Otherwise headings use Newsreader (OFL). DOCS_HEADINGS=newsreader forces it.
const PUBLIC_BUILD = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
const FONT_HOST = 'https://fonts.radialtimeline.com/kalice/';
const KALICE_URL = (process.env.KALICE_URL || (PUBLIC_BUILD ? FONT_HOST : '')).replace(/\/?$/, '/').replace(/^\/$/, '');
const KALICE_LOCAL = !PUBLIC_BUILD
	&& existsSync(new URL('./src/fonts/kalice/Kalice-Regular.woff2', import.meta.url));
const KALICE = THEME === 'paper' && process.env.DOCS_HEADINGS !== 'newsreader'
	? (KALICE_URL ? 'remote' : KALICE_LOCAL ? 'local' : '')
	: '';

const kaliceRemoteHead = KALICE === 'remote'
	? [
		{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `${KALICE_URL}Kalice-Regular.woff2` } },
		{
			tag: 'style',
			content: [
				`@font-face{font-family:'Kalice';src:url('${KALICE_URL}Kalice-Regular.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}`,
				`@font-face{font-family:'Kalice';src:url('${KALICE_URL}Kalice-Italic.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap}`,
				`:root:root{--rt-display:'Kalice','Newsreader Variable',Georgia,serif}`,
			].join(''),
		},
	]
	: [];

const themeCss = THEME === 'paper'
	? ['@fontsource/geist-mono/400.css', '@fontsource/geist-mono/500.css', './src/styles/theme-paper.css',
		...(KALICE === 'local' ? ['./src/styles/kalice.css'] : [])]
	: [];

console.log(`[docs] look: ${THEME}; headings: ${KALICE ? `Kalice (${KALICE})` : THEME === 'paper' ? 'Newsreader' : 'note'}`);

export default defineConfig({
	site: 'https://docs.radialtimeline.com',
	vite: { define: { 'import.meta.env.DOCS_KALICE': JSON.stringify(KALICE ? 'true' : '') } },
	integrations: [
		starlight({
			title: 'Radial Timeline Docs',
			description: 'How to use Radial Timeline, the manuscript timeline for Obsidian.',
			// The paper look keeps the website's dark top bar in both themes, so its mark is white.
			logo: THEME === 'paper'
				? { src: './src/assets/logo-white.png', alt: 'Radial Timeline' }
				: { light: './src/assets/logo-black.png', dark: './src/assets/logo-white.png', alt: 'Radial Timeline' },
			// Satoshi comes from Fontshare in this prototype, as on the newsletter; a launch would self-host it.
			head: THEME === 'paper'
				? [{ tag: 'link', attrs: { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap' } }, ...kaliceRemoteHead]
				: [],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/EricRhysTaylor/radial-timeline' }],
			sidebar,
			customCss: [
				'@fontsource/ibm-plex-sans/400.css',
				'@fontsource/ibm-plex-sans/400-italic.css',
				'@fontsource/ibm-plex-sans/500.css',
				'@fontsource/ibm-plex-sans/600.css',
				'@fontsource/ibm-plex-mono/400.css',
				'@fontsource/ibm-plex-mono/500.css',
				'@fontsource-variable/newsreader/opsz.css',
				'./src/styles/docs.css',
				'./src/styles/mockups.css',
				'./src/styles/mockups-panels.css',
				...themeCss,
			],
			components: { PageTitle: './src/components/PageTitle.astro', Footer: './src/components/Footer.astro' },
			tableOfContents: false,
			credits: false,
		}),
	],
});
