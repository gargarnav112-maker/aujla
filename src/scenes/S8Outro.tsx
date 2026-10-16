import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {MapStage} from '../ui/MapStage';
import {Pin} from '../ui/Pin';
import {OutlineCard} from '../ui/OutlineCard';
import {EndCard} from '../ui/EndCard';
import {S} from '../lib/schedule';
import {heroWord} from '../lib/lyrics';
import {beatPulse, secToFrame, useAbsFrame} from '../lib/time';
import {clamp01, springAt} from '../lib/anim';
import {f60, springSlam, whipIn, whipOut} from '../motion';
import {pinCamera} from './mapCamera';
import {Blur} from '../fx/Whip';

const Inner: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const F = (t: number) => secToFrame(t, fps);
	const t = frame / fps;
	const cam = pinCamera(t);
	const d = frame - F(S.s8.slam);
	const collapse = springAt(frame, fps, S.s8.slam, springSlam);
	const disc = 90 + (430 - 90) * (1 - clamp01(collapse));
	const ring = d >= 0 ? d / f60(26, fps) : -1;
	const pinS = 1.45 * (1.25 - 0.25 * collapse);
	const p = cam.pullP;
	// card slides away and the artist name blooms on the same beat
	const awayF = F(S.s8.cardAway);
	const away = interpolate(frame, [awayF - f60(whipIn.frames, fps), awayF], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipIn.easing});
	const reveal = interpolate(frame, [awayF, awayF + f60(whipOut.frames, fps)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipOut.easing});
	const bloom = frame < awayF ? 0 : interpolate(frame, [awayF, F(S.s8.endCard), F(S.end)], [1, 0.35, 0.12], {extrapolateRight: 'clamp'});
	const pulse = beatPulse(frame, fps, 6);
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{frame < awayF ? (
				<AbsoluteFill style={{translate: `${-1200 * away}px 0px`}}>
					<MapStage scale={cam.scale} center={cam.center} grey={0.35 + 0.65 * p} dot={0} pulse={pulse} punjab={p} states={0} />
					<AbsoluteFill style={{backgroundColor: '#000', opacity: 0.55 * p}} />
					{p > 0.55 ? <OutlineCard from={[540, 540]} draw={1} morph={1} card={clamp01((p - 0.55) / 0.45)} dotPulse={pulse} /> : null}
					{p < 0.6 ? (
						<div style={{opacity: 1 - clamp01(p / 0.6)}}>
							<Pin x={540} y={540 + 40} label={heroWord('L8')} s={pinS * (1 - 0.6 * p)} ring={ring} />
						</div>
					) : null}
					{d >= 0 && collapse < 0.999 ? (
						<div style={{position: 'absolute', left: 540 - disc, top: 540 + 40 - 72 * 1.45 - disc, width: disc * 2, height: disc * 2, borderRadius: '50%', background: '#fff', opacity: 1 - clamp01((collapse - 0.85) / 0.15)}} />
					) : null}
				</AbsoluteFill>
			) : null}
			{frame >= awayF ? <EndCard bloom={bloom} reveal={reveal} meta={interpolate(frame, [F(S.s8.endCard), F(S.s8.endCard) + f60(14, fps)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
		</AbsoluteFill>
	);
};

export const S8Outro: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const a = secToFrame(S.s8.cardAway, fps);
	return (
		<Blur active={frame >= a - f60(whipIn.frames, fps) - 1 && frame < a + f60(whipOut.frames, fps)}>
			<Inner />
		</Blur>
	);
};

