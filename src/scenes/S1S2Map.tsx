import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {MapStage} from '../ui/MapStage';
import {CoordChip} from '../ui/CoordChip';
import {OutlineCard} from '../ui/OutlineCard';
import {S} from '../lib/schedule';
import {beatPulse, secToFrame, useAbsFrame} from '../lib/time';
import {f60, whipOut} from '../motion';
import {mapCamera} from './mapCamera';
import {Blur} from '../fx/Whip';

/** Scenes 1 + 2: coordinate dive → grey flip → dotted route → Punjab card. One continuous camera. */
const Inner: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const F = (t: number) => secToFrame(t, fps);
	// freeze time inside the near-silence (dead still, grain only)
	const [sa, sb] = S.s2.silence;
	const frozen = frame >= F(sa) && frame < F(sb);
	const fT = frozen ? F(sa) : frame;
	const t = fT / fps;
	const cam = mapCamera(t);
	// entry from the S0 push-through: decelerating zoom-out + blur
	const enter = interpolate(frame, [F(S.s1.start), F(S.s1.start) + f60(whipOut.frames, fps)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipOut.easing});
	const grey = interpolate(frame, [F(S.s2.greyFlip) - 1, F(S.s2.greyFlip) - 1 + f60(6, fps)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = frozen ? 0 : beatPulse(fT, fps, 6);
	// coordinate chip types from the 808 entry until the pin lands
	const chipP = interpolate(fT, [F(S.s1.start) + f60(4, fps), F(S.s1.pinLand)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const chipOut = interpolate(fT, [F(S.s2.start), F(S.s2.start) + f60(10, fps)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	// dotted route draws out of the dot, holds through the silence, then resolves into the card
	const draw = interpolate(fT, [F(S.s2.start) + f60(4, fps), F(sa)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - (1 - x) ** 2});
	const done = F(S.s2.outlineDone) - f60(2, fps);
	const morph = interpolate(fT, [F(sb), done], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)});
	const card = interpolate(fT, [F(sb) + f60(4, fps), done], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - (1 - x) ** 3});
	const mapDim = interpolate(fT, [F(sb), done], [0, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill style={{scale: String(1 + 0.6 * enter), filter: enter > 0.01 ? `blur(${(enter * 10).toFixed(2)}px)` : undefined}}>
				<MapStage scale={cam.scale} center={cam.center} grey={grey} pulse={pulse} dot={draw > 0 ? 0 : 1} punjab={1 - grey * 0.6} states={0.5 * (1 - grey)} />
				<AbsoluteFill style={{backgroundColor: '#000', opacity: mapDim}} />
			</AbsoluteFill>
			{draw > 0 ? <OutlineCard from={[540, 540]} draw={draw} morph={morph} card={card} dotPulse={pulse} /> : null}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', opacity: chipOut * Math.min(1, chipP * 4)}}>
				<CoordChip p={chipP} frame={fT} />
			</div>
		</AbsoluteFill>
	);
};

export const S1S2Map: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const a = secToFrame(S.s1.start, fps);
	return (
		<Blur active={frame >= a && frame < a + f60(whipOut.frames, fps)}>
			<Inner />
		</Blur>
	);
};
