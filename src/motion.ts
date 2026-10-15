import {Easing} from 'remotion';
import {C} from './theme';

// Durations below are specified in frames at the 60 fps master and converted
// with f60() so the 30 fps fallback keeps the same timing in seconds.
export const MASTER_FPS = 60;
export const f60 = (n: number, fps: number) => (n * fps) / MASTER_FPS;

export const springPop = {damping: 14, mass: 0.7, stiffness: 220};
export const springSheet = {damping: 26, mass: 1, stiffness: 180};
export const springSlam = {damping: 20, mass: 1, stiffness: 320};

export const whipIn = {frames: 6, easing: Easing.bezier(0.7, 0, 0.84, 0)};
export const whipOut = {frames: 10, easing: Easing.bezier(0.16, 1, 0.3, 1)};

export const punch808 = {
	frames: 8, // 1 → 1.025 → 1
	peak: 0.025,
	shakePx: 6,
	shakeDecayFrames: 12,
};

export const motionBlur = {shutterAngle: 180, samples: 8};

export const adlibFX = {
	rgbSplitPx: 10,
	rgbFrames: 8,
	smearPx: 24,
	flickerFrames: 2,
};

export const glow = (color: string = C.accentGlow) =>
	`drop-shadow(0 0 12px ${hexA(color, 0.6)}) drop-shadow(0 0 48px ${hexA(color, 0.3)})`;

export const grain = {opacity: 0.035};
export const vignette = {strength: 0.22};
export const drift = {scalePerSecond: 0.004}; // +0.4 %/s on holds

export function hexA(hex: string, a: number) {
	const h = hex.replace('#', '');
	const n = parseInt(h, 16);
	const r = (n >> 16) & 255;
	const g = (n >> 8) & 255;
	const b = n & 255;
	return `rgba(${r},${g},${b},${a})`;
}
