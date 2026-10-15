import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {grain} from '../motion';

/** Animated film grain, seeded per frame (deterministic). */
export const Grain: React.FC<{opacity?: number; id?: string}> = ({opacity = grain.opacity, id = 'grain'}) => {
	const frame = Math.floor(useCurrentFrame());
	const seed = (frame * 7919) % 9973;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: opacity / 0.035 * 0.55}}>
			<svg width="100%" height="100%" viewBox="0 0 540 540" preserveAspectRatio="none">
				<filter id={`${id}-f`} x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  1.6 1.6 1.6 0 -1.9" />
				</filter>
				<rect width="540" height="540" filter={`url(#${id}-f)`} />
			</svg>
		</AbsoluteFill>
	);
};
