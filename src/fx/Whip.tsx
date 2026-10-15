import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {f60, motionBlur, whipIn, whipOut} from '../motion';
import {secToFrame, useAbsFrame} from '../lib/time';

type Dir = 'left' | 'right' | 'up' | 'down';
const vec = (d: Dir) => ({left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1]})[d];

/**
 * Whip transition around a cut at `at` (a beat):
 *   exit  — [at − whipIn, at): content accelerates away in `dir`
 *   enter — [at, at + whipOut): content decelerates in from the opposite side
 * The new scene is fully on screen from the cut frame, displaced only by the
 * decaying offset, so the hit reads on the beat.
 */
export const useWhip = (at: number, mode: 'exit' | 'enter', dir: Dir, distance = 1100) => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const cut = secToFrame(at, fps);
	const [vx, vy] = vec(dir);
	if (mode === 'exit') {
		const p = interpolate(frame, [cut - f60(whipIn.frames, fps), cut], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: whipIn.easing,
		});
		return {x: vx * distance * p, y: vy * distance * p, active: frame >= cut - f60(whipIn.frames, fps) - 1 && frame < cut};
	}
	const p = interpolate(frame, [cut, cut + f60(whipOut.frames, fps)], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: whipOut.easing,
	});
	// enter from the opposite side: if the old scene exits left, the new comes from the right
	return {x: -vx * distance * 0.55 * p, y: -vy * distance * 0.55 * p, active: frame >= cut && frame < cut + f60(whipOut.frames, fps)};
};

/** Wraps content in CameraMotionBlur only while `active` (it renders children N times). */
export const Blur: React.FC<{active: boolean; children: React.ReactNode}> = ({active, children}) =>
	active ? (
		<CameraMotionBlur shutterAngle={motionBlur.shutterAngle} samples={motionBlur.samples}>
			{children}
		</CameraMotionBlur>
	) : (
		<AbsoluteFill>{children}</AbsoluteFill>
	);
