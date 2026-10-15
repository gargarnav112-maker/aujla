import raw from '../../assets/lyrics.txt';
import timing from '../data/lyrics-timing.json';

// Every on-screen lyric word comes from assets/lyrics.txt. Line n (1-based) = Ln.
// Ad-libs are the bracketed parts, e.g. "(Woo!)".
export type LyricLine = {id: string; text: string; words: string[]; adlib: string | null};

export const LYRICS: LyricLine[] = raw
	.split(/\r?\n/)
	.map((l) => l.trim())
	.filter(Boolean)
	.map((l, i) => {
		const m = l.match(/\(([^)]*)\)/);
		const text = l.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
		return {id: `L${i + 1}`, text, words: text.split(/\s+/), adlib: m ? m[1].trim() : null};
	});

export const line = (id: string) => {
	const l = LYRICS.find((x) => x.id === id);
	if (!l) throw new Error(`lyrics.txt has no ${id}`);
	return l;
};

const clean = (w: string) => w.replace(/[^\p{L}\p{N}'’-]/gu, '');

/** The line's hero word, chosen by heroWordIndex in lyrics-timing.json. */
export const heroWord = (id: string) => {
	const t = timing.lines.find((x) => x.id === id);
	const l = line(id);
	if (!t || t.heroWordIndex == null) return l.words[0];
	return clean(l.words[t.heroWordIndex]);
};

/** Ad-libs in order (A1 after L2, A2 after L6). */
export const adlibText = (n: 1 | 2) => {
	const withAdlib = LYRICS.filter((l) => l.adlib);
	return withAdlib[n - 1]?.adlib ?? '';
};

/** A word with any elided suffix removed: "Chitta'ei" → "Chitta". */
export const stem = (w: string) => clean(w).split(/['’]/)[0];
