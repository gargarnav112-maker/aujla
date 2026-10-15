import React from 'react';
import {F} from '../fonts';
import {C, R} from '../theme';
import {Chevron} from './glyphs';
import {Toggle} from './Toggle';
import {hexA} from '../motion';

export type Row = {
	label: string;
	icon: React.ReactNode;
	tint: string;
	kind: 'toggle' | 'chevron';
	value?: string;
	on?: number;
	glow?: number;
	appear: number; // 0..1 (spring)
	capitalize?: boolean;
};

export const ROW_H = 96;

const RowView: React.FC<{row: Row; first: boolean; last: boolean}> = ({row, first, last}) => {
	const a = row.appear;
	return (
		<div
			style={{
				position: 'relative',
				height: ROW_H,
				display: 'flex',
				alignItems: 'center',
				padding: '0 24px',
				opacity: Math.min(1, Math.max(0, a * 1.4)),
				translate: `0px ${(1 - a) * 28}px`,
				background: row.glow ? `color-mix(in srgb, ${C.card} ${100 - 14 * row.glow}%, ${C.accentGlow})` : C.card,
				borderTopLeftRadius: first ? R.lg : 0,
				borderTopRightRadius: first ? R.lg : 0,
				borderBottomLeftRadius: last ? R.lg : 0,
				borderBottomRightRadius: last ? R.lg : 0,
			}}
		>
			<div style={{width: 60, height: 60, borderRadius: 14, background: row.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{row.icon}</div>
			<div
				style={{
					flex: 1,
					marginLeft: 24,
					fontFamily: F.ui,
					fontSize: 36,
					fontWeight: 500,
					letterSpacing: '-0.01em',
					color: row.glow ? `color-mix(in srgb, ${C.label} ${100 - 35 * row.glow}%, ${C.accentGlow})` : C.label,
					textTransform: row.capitalize ? 'capitalize' : 'none',
					textShadow: row.glow ? `0 0 ${16 * row.glow}px ${hexA(C.accentGlow, 0.6 * row.glow)}` : 'none',
				}}
			>
				{row.label}
			</div>
			{row.kind === 'toggle' ? (
				<Toggle on={row.on ?? 0} glow={row.glow ?? 0} />
			) : (
				<div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.ui, fontSize: 32, fontWeight: 500, color: C.labelSecondary}}>
					{row.value}
					<Chevron size={28} />
				</div>
			)}
			{!last ? <div style={{position: 'absolute', left: 108, right: 0, bottom: 0, height: 1, background: C.separator}} /> : null}
		</div>
	);
};

/** Dark grouped Settings list: large title + grouped rows. */
export const SettingsList: React.FC<{groups: Row[][]; title: string; titleAppear?: number}> = ({groups, title, titleAppear = 1}) => (
	<div style={{position: 'absolute', inset: 0, background: '#000', padding: '88px 64px 0'}}>
		<div style={{fontFamily: F.ui, fontSize: 68, fontWeight: 700, letterSpacing: '-0.02em', color: C.label, opacity: titleAppear, marginBottom: 40}}>{title}</div>
		{groups.map((g, gi) => (
			<div key={gi} style={{marginBottom: 40}}>
				{g.map((row, i) => (
					<RowView key={i} row={row} first={i === 0} last={i === g.length - 1} />
				))}
			</div>
		))}
	</div>
);
