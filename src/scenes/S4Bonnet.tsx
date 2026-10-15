import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useVideoConfig} from 'remotion';
import {GlassWidget, Tumbler} from '../ui/GlassWidget';
import {S} from '../lib/schedule';
import {heroWord, line} from '../lib/lyrics';
import {secToFrame, useAbsFrame} from '../lib/time';
import {clamp01, landSpring, lerp} from '../lib/anim';
import {f60, springPop} from '../motion';
import {Blur, useWhip} from '../fx/Whip';

// Camera path in art-wide.png pixels: across the car windows (masked crew) to the bonnet.
const ART = {w: 2144, h: 1206};
const FROM = {x: 1180, y: 600, k: 1.12};
const TO = {x: 560, y: 640, k: 1.32};
const PARALLAX = 1.6; // foreground moves 1.6× faster than the background
const BONNET_TOP = {x: 560, y: 628}; // where the widget sits (art px)

const Inner: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const F = (t: number) => secToFrame(t, fps);
	const enter = useWhip(S.s4.start, 'enter', 'left');
	const exit = useWhip(S.s4.end, 'exit', 'left');
	// pan across the windows, settling on the bonnet on L4
	const p = interpolate(frame, [F(S.s4.start), F(S.s4.l4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.18, 1)});
	const hold = Math.max(0, frame - F(S.s4.l4)) / fps; // slow push while holding on the bonnet
	const cx = lerp(FROM.x, TO.x, p);
	const cy = lerp(FROM.y, TO.y, p);
	const k = lerp(FROM.k, TO.k, p) * (1 + 0.012 * hold);
	const mid = {x: (FROM.x + TO.x) / 2, y: (FROM.y + TO.y) / 2};
	const bx = mid.x + (cx - mid.x) / PARALLAX;
	const by = mid.y + (cy - mid.y) / PARALLAX;
	const layer = (x: number, y: number): React.CSSProperties => ({
		position: 'absolute',
		left: 0,
		top: 0,
		width: ART.w,
		height: ART.h,
		transformOrigin: '0 0',
		translate: `${540 - x * k}px ${540 - y * k}px`,
		scale: String(k),
	});

	// widget drops onto the bonnet on L4
	const drop = landSpring(frame, fps, S.s4.l4, springPop);
	const wx = 540 + (BONNET_TOP.x - cx) * k;
	const wy = 540 + (BONNET_TOP.y - cy) * k;
	// four fill steps, one per beat; each lands on its beat
	const steps = S.s4.fills.map((t) => landSpring(frame, fps, t, {damping: 16, mass: 0.6, stiffness: 260}));
	const level = steps.reduce((a, s) => a + s, 0) / steps.length;
	const lastStep = S.s4.fills.filter((t) => F(t) <= frame + f60(4, fps)).pop();
	const dW = lastStep != null ? frame - F(lastStep) : 99;
	const wobble = 7 * Math.exp(-Math.max(0, dW) / f60(12, fps)) * (dW >= -f60(4, fps) ? 1 : 0);
	const accent = S.s4.fills[1];
	const dS = frame - F(accent);
	const splash = dS >= 0 && dS < f60(18, fps) ? 1 - dS / f60(18, fps) : 0;
	const glint = clamp01((frame - F(S.s4.brim) - f60(2, fps)) / f60(16, fps));
	const ml = 60 * Math.min(1, level);

	return (
		<AbsoluteFill style={{backgroundColor: '#000', translate: `${enter.x + exit.x}px 0px`}}>
			<Img src={staticFile('img/art-bg.png')} style={{...layer(bx, by), filter: 'blur(1.6px) brightness(0.74) contrast(1.06) saturate(0.92)'}} />
			<Img src={staticFile('img/art-fg.png')} style={{...layer(cx, cy), filter: 'brightness(0.9) contrast(1.08) saturate(0.95)'}} />
			{/* deeper grade + top/bottom falloff */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,10,12,0.55) 0%, rgba(10,10,12,0) 30%, rgba(10,10,12,0) 70%, rgba(10,10,12,0.6) 100%)'}} />
			{drop > 0.001 ? (
				<>
					{/* soft contact shadow on the bonnet */}
					<div style={{position: 'absolute', left: wx - 260, top: wy - 26, width: 520, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: 'blur(14px)', opacity: clamp01(drop), scale: `${0.6 + 0.4 * clamp01(drop)} 1`}} />
					<div style={{position: 'absolute', left: wx, top: wy - 6, translate: `-50% ${-100 + (1 - drop) * -60}%`, opacity: clamp01(drop * 1.5)}}>
						<GlassWidget title={line('L4').words[0]} word={heroWord('L4')} ml={ml}>
							<Tumbler level={level} wobble={wobble} wobblePhase={frame / f60(3, fps)} splash={splash} glint={glint} />
						</GlassWidget>
					</div>
				</>
			) : null}
		</AbsoluteFill>
	);
};

export const S4Bonnet: React.FC = () => {
	const enter = useWhip(S.s4.start, 'enter', 'left');
	const exit = useWhip(S.s4.end, 'exit', 'left');
	return (
		<Blur active={enter.active || exit.active}>
			<Inner />
		</Blur>
	);
};
