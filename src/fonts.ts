import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Google Fonts (Inter, JetBrains Mono, Noto Sans Gurmukhi) served locally.
// @remotion/google-fonts fetches from fonts.gstatic.com inside the headless
// browser, which this sandbox cannot reach, so tools/fetch_fonts.sh downloads
// the identical variable-font files once. loadFont() blocks rendering
// (delayRender) until each face is ready, so no frame renders with a fallback.
const faces = [
	{family: 'Inter', file: 'fonts/Inter.woff2'},
	{family: 'JetBrains Mono', file: 'fonts/JetBrainsMono.woff2'},
	{family: 'Noto Sans Gurmukhi', file: 'fonts/NotoSansGurmukhi.woff2'},
];
for (const f of faces) {
	loadFont({family: f.family, url: staticFile(f.file), weight: '100 900', format: 'woff2'}).catch((e) => {
		throw new Error(`font ${f.family} failed: ${e}`);
	});
}

export const F = {
	ui: 'Inter, sans-serif',
	mono: '"JetBrains Mono", monospace',
	gurmukhi: '"Noto Sans Gurmukhi", sans-serif',
};

export const uiText = {
	fontFamily: F.ui,
	letterSpacing: '-0.01em',
} as const;
