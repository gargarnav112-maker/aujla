// Bundle src/lib/schedule.ts with esbuild and print the schedule + hit table as JSON.
// Used by tools/verify_sync.py so QA checks exactly what the edit renders.
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = `
import {S, HITS, LIGHT_RANGES} from './src/lib/schedule';
console.log(JSON.stringify({S, HITS, LIGHT_RANGES}));
`;
const out = await build({
	stdin: {contents: entry, resolveDir: root, loader: 'ts'},
	bundle: true,
	platform: 'node',
	format: 'esm',
	write: false,
	external: ['remotion', '@remotion/*', 'react'],
	loader: {'.txt': 'text'},
	logLevel: 'error',
});
const code = out.outputFiles[0].text;
const tmp = path.join(root, 'node_modules', '.schedule-dump.mjs');
const fs = await import('node:fs');
fs.writeFileSync(tmp, code);
await import(tmp + '?t=' + Date.now());
