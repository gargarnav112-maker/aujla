// Every time-based event in the edit, derived from src/data/*.json.
// No hand-typed times: change beats.json or lyrics-timing.json and the whole
// edit re-flows. tools/verify_sync.py checks this table (dumped via
// tools/dump_schedule.mjs) against the beat grid.
import timing from '../data/lyrics-timing.json';
import cfg from '../data/config.json';
import {BEATS, accentAtOrAfter, beatTime, beatIndexOfTime} from './time';

const beat = BEATS.beatPeriod;
const e8 = beat / 2;
const s16 = beat / 4;

const L = (id: string) => {
	const l = timing.lines.find((x) => x.id === id);
	if (!l) throw new Error(`lyrics-timing.json has no ${id}`);
	return l;
};
const hero = (id: string, fallback: number) => L(id).heroWordTime ?? fallback;
const A = (i: 0 | 1) => timing.adlibs[i];

const slamA = BEATS.slams[0];
const slamB = BEATS.slams[1] ?? BEATS.bars[BEATS.bars.length - 1];
const dropA = BEATS.dropouts[0];
const dropB = BEATS.dropouts[1];
const lastBeatAtOrBefore = (t: number) => beatTime(Math.floor((t - BEATS.beat0) / beat + 1e-6));
const firstBeatAtOrAfter = (t: number) => beatTime(Math.ceil((t - BEATS.beat0) / beat - 1e-6));

const clipEnd = BEATS.duration;
const audioEnd = clipEnd + cfg.tailSeconds;
const end = audioEnd + cfg.endCardSeconds;

const manakChars = cfg.manakArtist.length;
const plateCols = cfg.plateText.replace(/\s/g, '').length;
const L7hero = hero('L7', L('L7').start + 3 * beat);
// One plate column per 8th, ending on L7's hero word; if the columns don't fit
// between the slam (+ one 8th) and the hero word, fall back to 16ths.
const plateDiv = (plateCols - 1) * e8 <= L7hero - (L('L7').start + e8) + 1e-6 ? e8 : s16;

export const S = {
	beat,
	e8,
	s16,
	clipEnd,
	audioEnd,
	end,
	s0: {
		start: 0,
		end: BEATS.grooveStart,
		phoneLand: BEATS.beats[0],
		island: BEATS.beats[0],
		pill: BEATS.beats[1],
	},
	s1: {
		start: BEATS.grooveStart,
		end: dropA.start,
		// pin lands on the last beat before the 808 drops out
		pinLand: lastBeatAtOrBefore(dropA.start),
	},
	s2: {
		start: dropA.start,
		end: slamA,
		greyFlip: dropA.start,
		silence: BEATS.nearSilence[0] ?? [dropA.start, dropA.start],
		outlineDone: slamA, // minus 2 frames, applied in frames by the scene
	},
	s3: {
		start: slamA,
		end: L('L3').start,
		slam: slamA,
		rowsFrom: slamA + beat, // first row lands one beat after the slam, then every 8th
		toggle: hero('L2', accentAtOrAfter(L('L2').start + e8)),
		adlib: A(0).start,
		adlibEnd: A(0).end,
	},
	s4: {
		start: L('L3').start,
		end: L('L5').start,
		l4: L('L4').start,
		fills: [0, 1, 2, 3].map((k) => L('L4').start + k * beat),
		brim: hero('L4', L('L4').start + 3 * beat),
		whipOut: L('L5').start,
	},
	s5: {
		start: L('L5').start,
		end: L('L7').start,
		chars: Array.from({length: manakChars}, (_, i) => L('L5').start + i * s16),
		tap: L('L5').start + (manakChars - 1) * s16,
		queue: L('L6').start,
		lock: accentAtOrAfter(L('L6').start + e8),
		adlib: A(1).start,
		adlibEnd: A(1).end,
	},
	s6: {
		start: L('L7').start,
		end: L('L8').start,
		slam: L('L7').start,
		locks: Array.from({length: plateCols}, (_, i) => L7hero - (plateCols - 1 - i) * plateDiv),
		lockDivision: plateDiv === e8 ? '8th' : '16th',
		lastLock: L7hero,
	},
	s7: {
		start: L('L8').start,
		end: slamB,
		loupeLand: accentAtOrAfter(L('L8').start + e8),
		hexChars: Array.from({length: 6}, (_, i) => accentAtOrAfter(L('L8').start + e8) + (i + 1) * s16),
		floodStart: dropB ? dropB.start : slamB - 2 * beat,
		floodFull: firstBeatAtOrAfter((dropB ? dropB.start : slamB - 2 * beat) + e8),
	},
	s8: {
		start: slamB,
		end,
		slam: slamB,
		pullBack: slamB + 2 * beat,
		cardAway: slamB + 4 * beat,
		nameGlow: slamB + 4 * beat, // the card slides away and the name blooms on the same beat
		endCard: slamB + 5 * beat,
	},
} as const;

/** Light scenes (white flood): grain switches to multiply, vignette off. */
export const LIGHT_RANGES: [number, number][] = [
	[S.s2.silence[1], S.s3.slam + e8], // Punjab card on light grey → white snap
	[S.s7.floodStart, S.s7.end],
];

/**
 * Grid a hit must sit on: quarter beat, 8th, 16th, a measured audio event (dropout edge), or 'lyric'
 * (anchored to a line/hero time from lyrics-timing.json: the 8th grid tap-sync snaps to, or the exact tapped time).
 */
export type Grid = 'beat' | '8th' | '16th' | 'audio' | 'lyric';
export type Hit = {name: string; t: number; grid: Grid; kind: 'boundary' | 'hit'};

/** Every scene boundary and hit (slams, flips, locks, lands, flashes) for tools/verify_sync.py. */
export const HITS: Hit[] = [
	{name: 'S0→S1 boundary (808 enters)', t: S.s1.start, grid: 'beat', kind: 'boundary'},
	{name: 'S1→S2 boundary (808 drops out)', t: S.s2.start, grid: 'audio', kind: 'boundary'},
	{name: 'S2→S3 boundary (SLAM A)', t: S.s3.start, grid: 'beat', kind: 'boundary'},
	{name: 'S3→S4 boundary (L3)', t: S.s4.start, grid: 'lyric', kind: 'boundary'},
	{name: 'S4→S5 boundary (L5)', t: S.s5.start, grid: 'lyric', kind: 'boundary'},
	{name: 'S5→S6 boundary (L7)', t: S.s6.start, grid: 'lyric', kind: 'boundary'},
	{name: 'S6→S7 boundary (L8)', t: S.s7.start, grid: 'lyric', kind: 'boundary'},
	{name: 'S7→S8 boundary (SLAM B)', t: S.s8.start, grid: 'beat', kind: 'boundary'},
	{name: 'S0 phone lands / island expands (beat 0)', t: S.s0.phoneLand, grid: 'beat', kind: 'hit'},
	{name: 'S0 headphones pill', t: S.s0.pill, grid: 'beat', kind: 'hit'},
	{name: 'S1 pin lands', t: S.s1.pinLand, grid: 'beat', kind: 'hit'},
	{name: 'S2 grey flip', t: S.s2.greyFlip, grid: 'audio', kind: 'hit'},
	{name: 'S3 SLAM A flash + punch', t: S.s3.slam, grid: 'beat', kind: 'hit'},
	...Array.from({length: 7}, (_, i) => ({name: `S3 settings row ${i + 1}`, t: S.s3.rowsFrom + i * e8, grid: '8th' as Grid, kind: 'hit' as const})),
	{name: 'S3 toggle flips ON (L2 hero)', t: S.s3.toggle, grid: 'lyric', kind: 'hit'},
	{name: 'S3 ad-lib 1', t: S.s3.adlib, grid: 'lyric', kind: 'hit'},
	{name: 'S4 widget drop (L4)', t: S.s4.l4, grid: 'lyric', kind: 'hit'},
	...S.s4.fills.map((t, i) => ({name: `S4 fill step ${i + 1}`, t, grid: 'lyric' as Grid, kind: 'hit' as const})),
	{name: 'S4 brim (L4 hero)', t: S.s4.brim, grid: 'lyric', kind: 'hit'},
	...S.s5.chars.map((t, i) => ({name: `S5 char ${i + 1}`, t, grid: 'lyric' as Grid, kind: 'hit' as const})),
	{name: 'S5 tap', t: S.s5.tap, grid: 'lyric', kind: 'hit'},
	{name: 'S5 queue sheet (L6)', t: S.s5.queue, grid: 'lyric', kind: 'hit'},
	{name: 'S5 Nipsey row locks (808)', t: S.s5.lock, grid: 'beat', kind: 'hit'},
	{name: 'S5 ad-lib 2', t: S.s5.adlib, grid: 'lyric', kind: 'hit'},
	{name: 'S6 plate slam (L7)', t: S.s6.slam, grid: 'lyric', kind: 'hit'},
	...S.s6.locks.map((t, i) => ({name: `S6 column ${i + 1} locks`, t, grid: 'lyric' as Grid, kind: 'hit' as const})),
	{name: 'S7 loupe lands (808)', t: S.s7.loupeLand, grid: 'beat', kind: 'hit'},
	...S.s7.hexChars.map((t, i) => ({name: `S7 hex char ${i + 1}`, t, grid: '16th' as Grid, kind: 'hit' as const})),
	{name: 'S7 flood starts (808 vanishes)', t: S.s7.floodStart, grid: 'audio', kind: 'hit'},
	{name: 'S7 white full', t: S.s7.floodFull, grid: 'beat', kind: 'hit'},
	{name: 'S8 SLAM B → pin + ring', t: S.s8.slam, grid: 'beat', kind: 'hit'},
	{name: 'S8 pull back', t: S.s8.pullBack, grid: 'beat', kind: 'hit'},
	{name: 'S8 card away / name bloom', t: S.s8.cardAway, grid: 'beat', kind: 'hit'},
];

export const beatIdx = beatIndexOfTime;
