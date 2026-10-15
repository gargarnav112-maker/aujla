import {spring, type SpringConfig} from 'remotion';
import {secToFrame} from './time';

const cache = new Map<string, number>();

/**
 * Frames from a spring's start until it first reaches `threshold` of its target
 * (the visual "land"). Overdamped springs never overshoot, so they land at 0.99.
 */
export const framesToLand = (fps: number, config: Partial<SpringConfig>, threshold = 0.995) => {
	const key = `${fps}|${JSON.stringify(config)}|${threshold}`;
	const hit = cache.get(key);
	if (hit != null) return hit;
	let f = 0;
	while (f < fps * 4 && spring({frame: f, fps, config}) < threshold) f += 0.25;
	cache.set(key, f);
	return f;
};

/** A 0→1 spring timed so it lands (first reaches ~1) exactly on the frame of `land`. */
export const landSpring = (frame: number, fps: number, land: number, config: Partial<SpringConfig>) => {
	const start = secToFrame(land, fps) - framesToLand(fps, config);
	return spring({frame: frame - start, fps, config});
};

/**
 * A 0→1 spring that is already visibly moving on the frame of `at`: it starts
 * one frame early, so the change reads on the hit frame (never a frame late).
 */
export const springAt = (frame: number, fps: number, at: number, config: Partial<SpringConfig>) =>
	spring({frame: frame - secToFrame(at, fps) + 1, fps, config});

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (x: number) => 1 - (1 - clamp01(x)) ** 3;
export const easeInOutCubic = (x: number) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};

/** Seeded PRNG (mulberry32) for deterministic procedural content. */
export const rng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};
