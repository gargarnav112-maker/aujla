import React from 'react';
import {glow} from '../motion';
import {C} from '../theme';

/** Layered accentGlow drop-shadows; `amount` 0..1 crossfades it in. */
export const Glow: React.FC<{amount?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
	amount = 1,
	color = C.accentGlow,
	children,
	style,
}) => (
	<div style={{position: 'relative', ...style}}>
		{amount > 0 ? (
			<div style={{position: 'absolute', inset: 0, filter: glow(color), opacity: amount}}>{children}</div>
		) : null}
		<div style={{position: 'relative'}}>{children}</div>
	</div>
);
