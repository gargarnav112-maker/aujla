import React from 'react';
import {C} from '../theme';
import {hexA} from '../motion';

/** iOS-style switch, 1.6× scale. on: 0..1 (spring-driven, may overshoot). */
export const Toggle: React.FC<{on: number; tint?: string; glow?: number}> = ({on, tint = C.accentGlow, glow = 0}) => {
	const W = 102;
	const H = 62;
	const k = Math.min(1, Math.max(0, on));
	const knob = 54;
	const x = 4 + (W - knob - 8) * on;
	return (
		<div
			style={{
				position: 'relative',
				width: W,
				height: H,
				borderRadius: H / 2,
				background: k > 0 ? `color-mix(in srgb, ${tint} ${k * 100}%, #39393D)` : '#39393D',
				boxShadow: glow > 0 ? `0 0 ${18 * glow}px ${hexA(tint, 0.7 * glow)}, 0 0 ${54 * glow}px ${hexA(tint, 0.35 * glow)}` : 'none',
				flexShrink: 0,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 4,
					left: x,
					width: knob + 6 * Math.sin(Math.PI * k),
					height: knob,
					borderRadius: knob / 2,
					background: '#fff',
					boxShadow: '0 3px 8px rgba(0,0,0,0.3), 0 1px 1px rgba(0,0,0,0.16)',
				}}
			/>
		</div>
	);
};
