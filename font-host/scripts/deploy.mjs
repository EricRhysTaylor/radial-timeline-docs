// Stage the fonts, deploy, and always remove the staged copy, keeping wrangler's exit code.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', cwd: path.join(here, '..') }).status ?? 1;

let status = run(process.execPath, [path.join(here, 'stage.mjs')]);
if (status === 0) status = run('npx', ['wrangler', 'deploy', ...process.argv.slice(2)]);
run(process.execPath, [path.join(here, 'stage.mjs'), '--clean']);
process.exit(status);
