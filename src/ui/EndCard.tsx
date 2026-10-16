import React from 'react';
import cfg from '../data/config.json';
import {F} from '../fonts';
import {C} from '../theme';
import {glow, hexA} from '../motion';
import {coordText} from './CoordChip';
import {PinGlyph} from './glyphs';

/** Artist name with an oxblood bloom (bloom 0..1), song title and the cover coordinates. */
export const EndCard: React.FC<{bloom: number; reveal: number; meta: number}> = ({bloom, reveal, meta}) => (
	<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
		<div style={{position: 'absolute', width: 980, height: 460, borderRadius: '50%', background: `radial-gradient(ellipse at center, ${hexA(C.accentGlow, 0.7 * bloom)} 0%, ${hexA(C.oxblood, 0.4 * bloom)} 40%, rgba(0,0,0,0) 72%)`, filter: 'blur(34px)'}} />
		<div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 112, letterSpacing: '-0.03em', color: `color-mix(in srgb, #ffffff ${100 - 45 * bloom}%, ${C.accentGlow})`, opacity: reveal, translate: `0px ${(1 - reveal) * 30}px`, filter: bloom > 0.02 ? glow(C.accentGlow) : undefined, whiteSpace: 'nowrap'}}>
			{cfg.artist}
		</div>
		<div style={{fontFamily: F.ui, fontWeight: 600, fontSize: 34, color: C.parchment, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: meta}}>{cfg.songTitle}</div>
		<div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 28, color: C.bone, letterSpacing: '0.06em', whiteSpace: 'pre', opacity: meta * 0.9}}>{coordText()}</div>
		<div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 34, fontFamily: F.ui, fontWeight: 600, fontSize: 32, color: C.label, letterSpacing: '-0.01em', opacity: meta}}>
			<PinGlyph size={34} color={C.accentGlow} />@{cfg.handle}
		</div>
	</div>
);
