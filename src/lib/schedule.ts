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
		locks: Array.from({length: plateCols}, (_, i) => L7hero - (plateCols - 1 - i) * e8),
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
		handleGlow: slamB + 5 * beat,
		endCard: audioEnd - beat,
	},
} as const;

/** Light scenes: the watermark drops to the bottom-left. */
export const LIGHT_RANGES: [number, number][] = [[S.s7.floodStart, S.s7.end]];

/** All "hit" events (scene boundaries, slams, flips, locks, lands, flashes) for QA. */
export const HITS: {name: string; t: number; onGrid: boolean}[] = [
	{name: 'S0 phone lands / island (beat 0)', t: S.s0.phoneLand, onGrid: true},
	{name: 'S0 headphones pill', t: S.s0.pill, onGrid: true},
	{name: 'S1 start: 808 enters → map push', t: S.s1.start, onGrid: true},
	{name: 'S1 pin lands', t: S.s1.pinLand, onGrid: true},
	{name: 'S2 start: grey flip (808 drops)', t: S.s2.greyFlip, onGrid: false},
	{name: 'S3 SLAM A flash', t: S.s3.slam, onGrid: true},
	{name: 'S3 toggle flips ON (L2 hero)', t: S.s3.toggle, onGrid: true},
	{name: 'S3 ad-lib 1', t: S.s3.adlib, onGrid: true},
	{name: 'S4 whip in (L3)', t: S.s4.start, onGrid: true},
	{name: 'S4 widget drop (L4)', t: S.s4.l4, onGrid: true},
	...S.s4.fills.map((t, i) => ({name: `S4 fill step ${i + 1}`, t, onGrid: true})),
	{name: 'S5 whip in / search (L5)', t: S.s5.start, onGrid: true},
	{name: 'S5 last char + tap', t: S.s5.tap, onGrid: true},
	{name: 'S5 queue sheet (L6)', t: S.s5.queue, onGrid: true},
	{name: 'S5 Nipsey row locks (808)', t: S.s5.lock, onGrid: true},
	{name: 'S5 ad-lib 2', t: S.s5.adlib, onGrid: true},
	{name: 'S6 plate slam (L7)', t: S.s6.slam, onGrid: true},
	{name: 'S6 last column lock', t: S.s6.lastLock, onGrid: true},
	{name: 'S7 picker (L8)', t: S.s7.start, onGrid: true},
	{name: 'S7 loupe lands (808)', t: S.s7.loupeLand, onGrid: true},
	{name: 'S7 white full', t: S.s7.floodFull, onGrid: true},
	{name: 'S8 SLAM B → pin', t: S.s8.slam, onGrid: true},
	{name: 'S8 pull back', t: S.s8.pullBack, onGrid: true},
];

export const beatIdx = beatIndexOfTime;
