import React from 'react';
import {AbsoluteFill} from 'remotion';
import {vignette} from '../motion';

export const Vignette: React.FC<{strength?: number}> = ({strength = vignette.strength}) => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: `radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength * 2.6}) 100%)`,
		}}
	/>
);
