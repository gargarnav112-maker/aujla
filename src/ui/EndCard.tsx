import React from 'react';
import cfg from '../data/config.json';
import {F} from '../fonts';
import {C} from '../theme';
import {glow, hexA} from '../motion';
import {PinGlyph} from './glyphs';
import {coordText} from './CoordChip';

/** Handle with oxblood bloom (bloom 0..1) and the cover coordinates; clean end card at bloom ≈ 0. */
export const EndCard: React.FC<{bloom: number; reveal: number}> = ({bloom, reveal}) => (
	<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
		<div style={{position: 'absolute', width: 900, height: 420, borderRadius: '50%', background: `radial-gradient(ellipse at center, ${hexA(C.oxbloodHi, 0.75 * bloom)} 0%, ${hexA(C.oxblood, 0.35 * bloom)} 40%, rgba(0,0,0,0) 72%)`, filter: 'blur(30px)'}} />
		<div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: reveal, translate: `0px ${(1 - reveal) * 30}px`, filter: bloom > 0.02 ? glow(C.accentGlow) : undefined}}>
			<PinGlyph size={64} color={C.accentGlow} />
			<div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 96, letterSpacing: '-0.03em', color: C.label}}>@{cfg.handle}</div>
		</div>
		<div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 30, color: C.bone, letterSpacing: '0.06em', whiteSpace: 'pre', opacity: reveal * 0.9}}>{coordText()}</div>
	</div>
);
