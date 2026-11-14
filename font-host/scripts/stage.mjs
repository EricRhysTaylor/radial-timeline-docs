// Copies the two licensed Kalice web fonts into .staging/kalice/ for wrangler, or removes the
// staging folder with --clean. The fonts never live in this project: they come from Eric's
// licensed copy (KALICE_SOURCE, or the default below) only for the moment of a dev run or deploy.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const staging = path.join(here, '..', '.staging');

if (process.argv.includes('--clean')) {
	fs.rmSync(staging, { recursive: true, force: true });
	console.log('Removed .staging');
	process.exit(0);
}

const source = process.env.KALICE_SOURCE
	?? path.join(os.homedir(), 'Documents/FONTS/Claude Type - Kalice Regular + Italic/Web');
const out = path.join(staging, 'kalice');
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of ['Kalice-Regular.woff2', 'Kalice-Italic.woff2']) {
	fs.copyFileSync(path.join(source, name), path.join(out, name));
}
console.log(`Staged Kalice Regular and Italic from ${source}`);
