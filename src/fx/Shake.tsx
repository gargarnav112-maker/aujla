import React from 'react';

export const Shake: React.FC<{x: number; y: number; scale?: number; children: React.ReactNode}> = ({x, y, scale = 1, children}) => (
	<div style={{position: 'absolute', inset: 0, translate: `${x}px ${y}px`, scale: String(scale)}}>{children}</div>
);
