import React from 'react';
import {F} from '../fonts';
import {C} from '../theme';
import {RGBSplit} from '../fx/RGBSplit';

/** Chunky ad-lib card. fx: 1 → full RGB split + smear (entry), 0 → clean. */
export const AdlibCard: React.FC<{text: string; fx: number; visible: boolean; rotate?: number}> = ({text, fx, visible, rotate = -4}) => {
	if (!visible) return null;
	return (
		<RGBSplit split={10 * fx} smear={24 * fx}>
			<div
				style={{
					rotate: `${rotate}deg`,
					padding: '46px 84px 52px',
					background: C.panel,
					borderRadius: 36,
					boxShadow: `0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(203,181,164,0.12)`,
					fontFamily: F.ui,
					fontWeight: 900,
					fontSize: 190,
					lineHeight: 1,
					letterSpacing: '-0.03em',
					color: C.parchment,
					whiteSpace: 'nowrap',
					position: 'relative',
				}}
			>
				{text}
				{/* chat-bubble tail (as the reference's ad-lib bubble) */}
				<svg width={56} height={44} viewBox="0 0 56 44" style={{position: 'absolute', right: -18, bottom: -14}}>
					<path d="M0 0 C 6 22, 22 38, 54 42 C 36 30, 34 14, 34 0 Z" fill={C.panel} />
				</svg>
			</div>
		</RGBSplit>
	);
};
