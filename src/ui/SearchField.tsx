import React from 'react';
import {F} from '../fonts';
import {C} from '../theme';
import {hexA} from '../motion';
import {Magnifier} from './glyphs';

/** Neon-bordered search field (accentGlow). */
export const SearchField: React.FC<{text: string; cursor: boolean; neon: number}> = ({text, cursor, neon}) => (
	<div
		style={{
			height: 104,
			borderRadius: 26,
			background: C.card,
			display: 'flex',
			alignItems: 'center',
			gap: 18,
			padding: '0 30px',
			border: `2.5px solid ${hexA(C.accentGlow, 0.35 + 0.65 * neon)}`,
			boxShadow: `0 0 ${12 + 10 * neon}px ${hexA(C.accentGlow, 0.55 * neon)}, 0 0 ${48 + 20 * neon}px ${hexA(C.accentGlow, 0.28 * neon)}, inset 0 0 18px ${hexA(C.accentGlow, 0.15 * neon)}`,
		}}
	>
		<Magnifier size={40} color={C.labelSecondary} />
		<div style={{fontFamily: F.ui, fontSize: 46, fontWeight: 600, letterSpacing: '-0.01em', color: C.label, whiteSpace: 'pre', display: 'flex', alignItems: 'center'}}>
			{text || <span style={{color: C.labelTertiary}}>Artists, songs, lyrics</span>}
			{text ? <span style={{display: 'inline-block', width: 4, height: 54, marginLeft: 4, borderRadius: 2, background: C.accentGlow, opacity: cursor ? 1 : 0}} /> : null}
		</div>
	</div>
);
