import React from 'react';
import cfg from '../data/config.json';
import {F} from '../fonts';
import {C} from '../theme';
import {rng} from '../lib/anim';

export const coordText = () => `${cfg.coord.lat.toFixed(3)}° N  ${cfg.coord.lon.toFixed(3)}° E`;

/**
 * Bone-on-panel coordinate chip (echoes the cover's coordinate box).
 * p: 0..1 type-on progress; digits roll before they settle.
 */
export const CoordChip: React.FC<{p: number; frame: number; scale?: number}> = ({p, frame, scale = 1}) => {
	const text = coordText();
	const n = text.length;
	const shown = p * n;
	const r = rng(Math.floor(frame) * 31 + 7);
	const chars = text.split('').map((ch, i) => {
		if (i >= Math.ceil(shown)) return {ch: ' ', dim: true};
		const settled = i < Math.floor(shown - 2) || p >= 1;
		if (!settled && /\d/.test(ch)) return {ch: String(Math.floor(r() * 10)), dim: true};
		return {ch, dim: false};
	});
	return (
		<div
			style={{
				display: 'inline-flex',
				padding: 8 * scale,
				background: C.panel,
				borderRadius: 18 * scale,
				boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
				scale: String(scale),
			}}
		>
			<div
				style={{
					border: `2px solid ${C.bone}`,
					borderRadius: 12,
					padding: '10px 22px',
					fontFamily: F.mono,
					fontWeight: 600,
					fontSize: 34,
					color: C.parchment,
					whiteSpace: 'pre',
					letterSpacing: '0.02em',
				}}
			>
				{chars.map((c, i) => (
					<span key={i} style={{color: c.dim ? C.bone : C.parchment}}>
						{c.ch}
					</span>
				))}
			</div>
		</div>
	);
};
