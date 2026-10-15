import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {secToFrame} from '../lib/time';
import {f60} from '../motion';

/** White flash: `frames` (@60) at `peak` opacity starting exactly on each hit, then a short release. */
export const Flash: React.FC<{at: readonly number[]; peak?: number; frames?: number; color?: string}> = ({
	at,
	peak = 0.85,
	frames = 3,
	color = '#fff',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	let o = 0;
	for (const t of at) {
		const d = frame - secToFrame(t, fps);
		const hold = f60(frames, fps);
		if (d >= 0 && d < hold) o = Math.max(o, peak);
		else if (d >= hold && d < hold + f60(6, fps)) o = Math.max(o, peak * (1 - (d - hold) / f60(6, fps)) ** 2);
	}
	if (o <= 0) return null;
	return <AbsoluteFill style={{backgroundColor: color, opacity: o, pointerEvents: 'none'}} />;
};
