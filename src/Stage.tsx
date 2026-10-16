import React from 'react';
import {AbsoluteFill, getInputProps, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {LIGHT_RANGES, S} from './lib/schedule';
import {BEATS, beatPulse, punchAt, secToFrame} from './lib/time';
import {f60} from './motion';
import {Scene} from './scenes/Scene';
import {S0ColdOpen} from './scenes/S0ColdOpen';
import {Grain} from './fx/Grain';
import {Watermark} from './ui/Watermark';
import {Vignette} from './fx/Vignette';
import {Flash} from './fx/Flash';
import {SCENES_EXTRA} from './scenes';

/** Breath holds: no drift, no beat micro-move, grain only. */
const breathRanges = (): [number, number][] => [
	[S.s2.silence[0], S.s2.silence[1]],
	[S.s7.floodFull, S.s7.end],
];

/** The 1080×1080 stage shared by the 1:1 master and the 9:16 variant. */
export const Stage: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const inBreath = breathRanges().some(([a, b]) => frame >= secToFrame(a, fps) && frame < secToFrame(b, fps));
	// micro-move on every beat + punch808 on every 808 accent
	const pulse = inBreath ? 0 : beatPulse(frame, fps, 4);
	const punch = inBreath ? {scale: 1, x: 0, y: 0} : punchAt(frame, fps, [...BEATS.accents808, ...extraPunches()]);
	// Scene 2 mood: vignette 22 % → 40 %, grain 3.5 % → 6 %
	const s2 = interpolate(frame, [secToFrame(S.s2.start, fps), secToFrame(S.s2.start, fps) + f60(6, fps), secToFrame(S.s2.end, fps) - 1, secToFrame(S.s2.end, fps)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const light = LIGHT_RANGES.some(([a, b]) => frame >= secToFrame(a, fps) && frame < secToFrame(b, fps));
	return (
		<AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
			<AbsoluteFill style={{scale: String(punch.scale * (1 + 0.004 * pulse)), translate: `${punch.x}px ${punch.y}px`}}>
				<Scene name="S0 Cold open" from={S.s0.start} to={S.s0.end}>
					<S0ColdOpen />
				</Scene>
				{SCENES_EXTRA}
			</AbsoluteFill>
			<Flash at={[S.s3.slam]} />
			<Vignette strength={light ? 0 : 0.22 + 0.18 * s2} />
			<Watermark />
			{getInputProps().qa ? null : <Grain opacity={0.035 + 0.025 * s2} light={light} />}
		</AbsoluteFill>
	);
};

export const extraPunches = () => [S.s3.toggle, S.s6.lastLock, S.s5.adlib];
