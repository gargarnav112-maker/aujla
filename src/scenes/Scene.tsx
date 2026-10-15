import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneOffset, secToFrame} from '../lib/time';
import {drift} from '../motion';

/**
 * A scene mounted over [from − padIn, to + padOut) on the absolute timeline.
 * Children read absolute time via useAbsFrame()/useTime().
 * `drift` applies the slow hold drift (+0.4 %/s) measured from `from`.
 */
export const Scene: React.FC<{
	name: string;
	from: number;
	to: number;
	padIn?: number; // frames @ current fps
	padOut?: number;
	drift?: boolean;
	children: React.ReactNode;
}> = ({name, from, to, padIn = 0, padOut = 0, drift: useDrift = true, children}) => {
	const {fps} = useVideoConfig();
	const a = Math.max(0, secToFrame(from, fps) - padIn);
	const b = secToFrame(to, fps) + padOut;
	if (b <= a) return null;
	return (
		<Sequence name={name} from={a} durationInFrames={b - a} premountFor={fps} layout="absolute-fill">
			<SceneOffset.Provider value={a}>
				{useDrift ? <Drift since={from}>{children}</Drift> : children}
			</SceneOffset.Provider>
		</Sequence>
	);
};

const Drift: React.FC<{since: number; children: React.ReactNode}> = ({since, children}) => {
	const {fps} = useVideoConfig();
	const off = React.useContext(SceneOffset);
	const t = Math.max(0, (useCurrentFrame() + off) / fps - since);
	return <AbsoluteFill style={{scale: String(1 + drift.scalePerSecond * t)}}>{children}</AbsoluteFill>;
};
