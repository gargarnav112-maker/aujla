import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import cfg from '../data/config.json';
import {F} from '../fonts';
import {C} from '../theme';
import {LIGHT_RANGES, S} from '../lib/schedule';
import {secToFrame} from '../lib/time';
import {f60, hexA} from '../motion';
import {PinGlyph} from './glyphs';

/** "@handle" with glyph: top-right; drops to bottom-left on light scenes; hides for the end card. */
export const Watermark: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const tr = f60(8, fps);
	let light = 0;
	for (const [a, b] of LIGHT_RANGES) {
		const fa = secToFrame(a, fps);
		const fb = secToFrame(b, fps);
		light = Math.max(light, interpolate(frame, [fa, fa + tr, fb - 1, fb], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	}
	const endF = secToFrame(S.s8.handleGlow, fps);
	const hide = interpolate(frame, [endF - f60(6, fps), endF], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (hide <= 0) return null;
	const inset = 36;
	const color = light > 0.5 ? hexA(C.bone, 0.9) : hexA(C.bone, 0.7);
	const style: React.CSSProperties = {
		position: 'absolute',
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontFamily: F.ui,
		fontWeight: 600,
		fontSize: 22,
		letterSpacing: '-0.01em',
		color,
		opacity: hide * (light > 0 && light < 1 ? Math.abs(light - 0.5) * 2 : 1),
	};
	const tl = light > 0.5;
	return (
		<div
			style={{
				...style,
				...(tl ? {left: inset, bottom: inset} : {right: inset, top: inset}),
				width: undefined,
				height: undefined,
				maxWidth: width,
				maxHeight: height,
			}}
		>
			<PinGlyph size={22} color={color} />@{cfg.handle}
		</div>
	);
};
