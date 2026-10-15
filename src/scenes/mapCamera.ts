import {Easing} from 'remotion';
import {S} from '../lib/schedule';
import {COORD, INDIA_CENTER, INDIA_SCALE, VILLAGE_SCALE} from '../ui/MapStage';
import {CARD_PROJ_CENTER, CARD_PROJ_SCALE} from '../ui/OutlineCard';
import {clamp01, lerp} from '../lib/anim';

const LAND_SCALE = VILLAGE_SCALE * 0.5;
const PUSH = Math.log(2) * 0.45; // slow push after the pin lands (log-scale per second)
const dive = Easing.bezier(0.55, 0, 0.12, 1);
const pull = Easing.bezier(0.6, 0, 0.2, 1);

/** Camera that converges on `target` as scale grows (pixel error shrinks as the zoom deepens). */
const centerFor = (scale: number, from: [number, number], to: [number, number], s0: number): [number, number] => {
	const w = Math.min(1, (s0 / scale) ** 1.3);
	return [to[0] + (from[0] - to[0]) * w, to[1] + (from[1] - to[1]) * w];
};

/** Map camera as a pure function of time (seconds) and the frame-quantised silence window. */
export const mapCamera = (t: number): {scale: number; center: [number, number]} => {
	const {s1, s2} = S;
	if (t < s1.pinLand) {
		const e = dive(clamp01((t - s1.start) / (s1.pinLand - s1.start)));
		const ls = lerp(Math.log(INDIA_SCALE), Math.log(LAND_SCALE), e);
		const scale = Math.exp(ls);
		return {scale, center: centerFor(scale, INDIA_CENTER, COORD, INDIA_SCALE)};
	}
	// slow push after landing; 25 % speed in the dropout; dead still during the near-silence
	let ls = Math.log(LAND_SCALE);
	ls += PUSH * (Math.min(t, s2.start) - s1.pinLand);
	if (t > s2.start) {
		const [a, b] = s2.silence;
		const active = Math.max(0, Math.min(t, a) - s2.start) + Math.max(0, t - b);
		ls += PUSH * 0.25 * active;
	}
	return {scale: Math.exp(ls), center: COORD};
};

/** Final pin map (S7 → S8): village scale, slow push, then the pull back into the Punjab card. */
export const pinCamera = (t: number): {scale: number; center: [number, number]; pullP: number} => {
	const {s8} = S;
	const base = Math.log(LAND_SCALE * 0.8) + PUSH * 0.6 * Math.max(0, Math.min(t, s8.pullBack) - s8.slam);
	const p = pull(clamp01((t - s8.pullBack) / (s8.cardAway - S.beat - s8.pullBack)));
	const ls = lerp(base, Math.log(CARD_PROJ_SCALE), p);
	const scale = Math.exp(ls);
	// centre slides from the coordinate to the card's centre; weight follows the zoom so the dot stays put
	const w = p <= 0 ? 0 : clamp01((Math.log(LAND_SCALE * 0.8) - ls) / (Math.log(LAND_SCALE * 0.8) - Math.log(CARD_PROJ_SCALE)));
	const cw = w ** 3;
	return {scale, center: [lerp(COORD[0], CARD_PROJ_CENTER[0], cw), lerp(COORD[1], CARD_PROJ_CENTER[1], cw)], pullP: p};
};
