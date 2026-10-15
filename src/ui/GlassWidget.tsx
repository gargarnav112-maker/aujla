import React from 'react';
import {F} from '../fonts';
import {C, material} from '../theme';

/** Tumbler with amber liquid. level 0..1, wobble px, splash 0..1, glint 0..1 (sweep position). */
export const Tumbler: React.FC<{level: number; wobble: number; wobblePhase: number; splash: number; glint: number}> = ({level, wobble, wobblePhase, splash, glint}) => {
	const W = 150;
	const H = 190;
	const top = 14;
	const bottom = 168;
	const inner = (y: number) => {
		// interior x-extent at height y (tapers toward the base)
		const t = (y - top) / (bottom - top);
		const half = 64 - 10 * t;
		return [W / 2 - half, W / 2 + half];
	};
	const ly = bottom - (bottom - top - 8) * Math.min(1, Math.max(0, level));
	const [lx0, lx1] = inner(ly);
	const n = 16;
	const surf = Array.from({length: n + 1}, (_, i) => {
		const x = lx0 + ((lx1 - lx0) * i) / n;
		const y = ly + wobble * Math.sin(wobblePhase + (i / n) * Math.PI * 2);
		return `${x.toFixed(1)} ${y.toFixed(1)}`;
	});
	const [bx0, bx1] = inner(bottom);
	const liquid = `M ${surf.join(' L ')} L ${bx1} ${bottom} L ${bx0} ${bottom} Z`;
	const [tx0, tx1] = inner(top);
	const glass = `M ${tx0 - 6} ${top - 6} L ${tx1 + 6} ${top - 6} L ${bx1 + 8} ${H - 4} L ${bx0 - 8} ${H - 4} Z`;
	const drops = splash > 0 ? [-30, -12, 8, 26, 40] : [];
	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={C.amberHi} />
					<stop offset="1" stopColor={C.amber} />
				</linearGradient>
				<linearGradient id="glassg" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="rgba(255,255,255,0.28)" />
					<stop offset="0.25" stopColor="rgba(255,255,255,0.06)" />
					<stop offset="0.8" stopColor="rgba(255,255,255,0.04)" />
					<stop offset="1" stopColor="rgba(255,255,255,0.2)" />
				</linearGradient>
				<clipPath id="glassClip">
					<path d={glass} />
				</clipPath>
			</defs>
			<path d={glass} fill="url(#glassg)" stroke="rgba(255,255,255,0.55)" strokeWidth={2.5} strokeLinejoin="round" />
			{level > 0.002 ? <path d={liquid} fill="url(#amber)" opacity={0.95} /> : null}
			{level > 0.002 ? <path d={`M ${surf.join(' L ')}`} fill="none" stroke="#F6C77A" strokeWidth={2.5} opacity={0.9} /> : null}
			{/* thick base */}
			<rect x={bx0 - 6} y={bottom} width={bx1 - bx0 + 12} height={H - 4 - bottom} rx={4} fill="rgba(255,255,255,0.22)" />
			{/* specular streak */}
			<path d={`M ${tx0 + 10} ${top + 10} L ${tx0 + 20} ${top + 10} L ${bx0 + 16} ${bottom - 12} L ${bx0 + 8} ${bottom - 12} Z`} fill="rgba(255,255,255,0.35)" />
			{drops.map((dx, i) => {
				const up = Math.sin(Math.PI * Math.min(1, 1 - splash)) * (24 + i * 7);
				return <circle key={i} cx={W / 2 + dx * (1.2 - splash * 0.4)} cy={ly - up} r={3.5 - i * 0.3} fill={C.amberHi} opacity={splash} />;
			})}
			{glint > 0 && glint < 1 ? (
				<g clipPath="url(#glassClip)">
					<rect x={-80 + glint * 320} y={-20} width={36} height={H + 40} fill="rgba(255,255,255,0.55)" transform={`rotate(18 ${W / 2} ${H / 2})`} />
				</g>
			) : null}
		</svg>
	);
};

export const GlassWidget: React.FC<{title: string; word: string; ml: number; children: React.ReactNode}> = ({title, word, ml, children}) => (
	<div
		style={{
			...material('rgba(30,30,32,0.42)'),
			display: 'flex',
			alignItems: 'center',
			gap: 36,
			padding: '30px 48px 30px 36px',
			borderRadius: 40,
			border: '1px solid rgba(255,255,255,0.18)',
			boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 30px 60px rgba(0,0,0,0.45)',
		}}
	>
		{children}
		<div style={{fontFamily: F.ui, letterSpacing: '-0.01em'}}>
			<div style={{fontSize: 26, fontWeight: 600, color: C.labelSecondary, textTransform: 'uppercase', letterSpacing: '0.08em'}}>{title}</div>
			<div style={{fontSize: 64, fontWeight: 700, color: C.label, lineHeight: 1.05, textTransform: 'capitalize'}}>{word}</div>
			<div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 40, color: C.amberHi, marginTop: 10}}>
				{String(Math.round(ml)).padStart(2, '0')} ml
			</div>
		</div>
	</div>
);
