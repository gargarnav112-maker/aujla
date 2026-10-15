import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

// Lyrics are read from assets/lyrics.txt as a raw string (never retyped in code).
Config.overrideWebpackConfig((config) => ({
	...config,
	module: {
		...config.module,
		rules: [...(config.module?.rules ?? []), {test: /\.txt$/, type: 'asset/source'}],
	},
}));

// Sandboxed network: if Remotion cannot download its headless shell, use the
// preinstalled one.
const PREINSTALLED = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(PREINSTALLED)) {
	Config.setBrowserExecutable(PREINSTALLED);
}
