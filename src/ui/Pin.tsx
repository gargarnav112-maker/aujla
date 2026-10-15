import React from 'react';
import {F} from '../fonts';
import {C} from '../theme';
import {Car} from './glyphs';

/** Find-My-style pin: white disc with a generic car glyph, tail, and a label pill. */
export const Pin: React.FC<{x: number; y: number; label: string; s?: number; ring?: number}> = ({x, y, label, s = 1, ring = -1}) => (
	<div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
		{ring >= 0 && ring < 1 ? (
			<div style={{position: 'absolute', left: -60 - 240 * ring, top: -60 - 240 * ring, width: 120 + 480 * ring, height: 120 + 480 * ring, borderRadius: '50%', border: `${8 * (1 - ring) + 1}px solid ${C.accentGlow}`, opacity: 1 - ring}} />
		) : null}
		<div style={{position: 'absolute', left: 0, top: 0, scale: String(s), transformOrigin: '0 0'}}>
			<div style={{position: 'absolute', left: -14, top: -12, width: 28, height: 28, rotate: '45deg', background: '#fff', borderRadius: 4}} />
			<div style={{position: 'absolute', left: -62, top: -134, width: 124, height: 124, borderRadius: 62, background: '#fff', boxShadow: '0 14px 30px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Car size={86} color={C.card} />
			</div>
			<div style={{position: 'absolute', left: 0, top: 26, translate: '-50% 0', padding: '8px 22px', borderRadius: 999, background: 'rgba(28,28,30,0.82)', backdropFilter: 'blur(20px)', fontFamily: F.ui, fontWeight: 700, fontSize: 32, color: C.label, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textTransform: 'capitalize'}}>{label}</div>
		</div>
	</div>
);
