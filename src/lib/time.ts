import {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import beatsJson from '../data/beats.json';
import {f60, punch808} from '../motion';

export type Beats = typeof beatsJson;
export const BEATS: Beats = beatsJson;

/** Absolute seconds → frame. Always from absolute time; never accumulate durations. */
export const secToFrame = (t: number, fps: number) => Math.round(t * fps);

/** Time of beat k, from the measured grid (absolute, no accumulation). */
export const beatTime = (k: number) => BEATS.beat0 + k * BEATS.beatPeriod;

/** Snap a time to the nearest grid division (in beats: 1 = quarter, 0.5 = 8th, 0.25 = 16th). */
export const snap = (t: number, division = 1) => {
	const d = division * BEATS.beatPeriod;
	return BEATS.beat0 + Math.round((t - BEATS.beat0) / d) * d;
};
export const nearestBeat = (t: number) => snap(t, 1);
export const beatIndexOfTime = (t: number) => Math.round((t - BEATS.beat0) / BEATS.beatPeriod);

/** Index of the latest beat whose (rounded) frame is ≤ frame; −1 before the first beat. */
export const beatIndexAt = (frame: number, fps: number) => {
	let k = Math.floor((frame / fps - BEATS.beat0) / BEATS.beatPeriod) + 1;
	while (k >= 0 && secToFrame(beatTime(k), fps) > frame) k--;
	return k;
};

export const isAccent = (frame: number, fps: number) =>
	BEATS.accents808.some((t) => secToFrame(t, fps) === Math.round(frame));

/** First 808 accent at or after t. */
export const accentAtOrAfter = (t: number) =>
	BEATS.accents808.find((a) => a >= t - 1e-6) ?? BEATS.accents808[BEATS.accents808.length - 1];

/** Frames elapsed since the latest of `times` that has started (Infinity if none). */
export const framesSince = (frame: number, fps: number, times: readonly number[]) => {
	let best = Infinity;
	for (const t of times) {
		const d = frame - secToFrame(t, fps);
		if (d >= 0 && d < best) best = d;
	}
	return best;
};

// --- scene-relative absolute frame -------------------------------------------
// Scenes live inside <Sequence from=…>. useCurrentFrame() is relative there (and
// fractional under CameraMotionBlur); adding the scene offset gives absolute time.
export const SceneOffset = createContext(0);
export const useAbsFrame = () => useCurrentFrame() + useContext(SceneOffset);
/** Absolute time in seconds of the current (possibly fractional) frame. */
export const useTime = () => {
	const {fps} = useVideoConfig();
	return useAbsFrame() / fps;
};

/** 1 on each beat frame, decaying exponentially (≈ 0.05 after 10 frames @60). */
export const beatPulse = (frame: number, fps: number, decay60 = 3.5) => {
	const k = beatIndexAt(frame, fps);
	if (k < 0) return 0;
	const d = frame - secToFrame(beatTime(k), fps);
	return Math.exp(-d / f60(decay60, fps));
};
export const useBeatPulse = (decay60?: number) => {
	const {fps} = useVideoConfig();
	return beatPulse(useAbsFrame(), fps, decay60);
};

/** punch808 at the given hit times: scale 1→1.025→1 over 8 frames + seeded decaying shake. */
export const punchAt = (frame: number, fps: number, hits: readonly number[], seed = 'punch') => {
	const d = framesSince(frame, fps, hits);
	if (!Number.isFinite(d)) return {scale: 1, x: 0, y: 0};
	const len = f60(punch808.frames, fps);
	const s = d <= len ? Math.sin((Math.PI * d) / len) : 0;
	const amp = punch808.shakePx * Math.exp(-d / f60(punch808.shakeDecayFrames / 3, fps));
	const t = frame / f60(2, fps);
	return {
		scale: 1 + punch808.peak * s,
		x: amp * noise2D(seed + 'x', t, 0),
		y: amp * noise2D(seed + 'y', 0, t),
	};
};
export const usePunch808 = (extraHits: readonly number[] = []) => {
	const {fps} = useVideoConfig();
	const frame = useAbsFrame();
	return punchAt(frame, fps, [...BEATS.accents808, ...extraHits]);
};

/** Progress 0→1 between two absolute times (clamped). */
export const prog = (frame: number, fps: number, t0: number, t1: number) => {
	const a = secToFrame(t0, fps);
	const b = secToFrame(t1, fps);
	if (b <= a) return frame >= a ? 1 : 0;
	return Math.min(1, Math.max(0, (frame - a) / (b - a)));
};
