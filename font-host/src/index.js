// Kalice font host for the Radial Timeline docs, at fonts.radialtimeline.com.
//
// The Claude Type EULA allows web fonts only "from domains owned or controlled by the License
// Owner, with reasonable protection against hotlinking and direct download". So this Worker runs
// before its static assets and serves the two licensed files only to font requests from the
// allowed origins (ALLOWED_ORIGINS in wrangler.jsonc). Browsers send Origin with every font
// request; anything without an allowed one (another site, a typed URL, curl) gets a 403.

const FILES = new Set(['/kalice/Kalice-Regular.woff2', '/kalice/Kalice-Italic.woff2']);

const refuse = () => new Response('Forbidden', {
	status: 403,
	headers: { 'Cache-Control': 'no-store', Vary: 'Origin', 'X-Robots-Tag': 'noindex' },
});

export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);
		const origin = request.headers.get('Origin');
		const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
		if (!['GET', 'HEAD'].includes(request.method) || !FILES.has(pathname) || !origin || !allowed.includes(origin)) {
			return refuse();
		}
		const asset = await env.ASSETS.fetch(request);
		if (!asset.ok) return refuse();
		const response = new Response(asset.body, asset);
		response.headers.set('Content-Type', 'font/woff2');
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Vary', 'Origin');
		response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
		response.headers.set('Cache-Control', 'public, max-age=2592000');
		response.headers.set('X-Robots-Tag', 'noindex');
		return response;
	},
};
