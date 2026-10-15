import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

import {F} from '../fonts';

/** Generic phone slab (no logo). Screen content is passed as children. */
export const PHONE = {w: 450, h: 940, r: 74, bezel: 13};

export const Device: React.FC<{children?: React.ReactNode; sheen?: number}> = ({children, sheen = 0}) => (
	<div
		style={{
			position: 'relative',
			width: PHONE.w,
			height: PHONE.h,
			borderRadius: PHONE.r,
			background: 'linear-gradient(135deg, #5b5f63 0%, #26282a 40%, #3d4043 70%, #1a1b1c 100%)',
			padding: 3,
			boxShadow: '0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
		}}
	>
		<div style={{position: 'absolute', inset: 3, borderRadius: PHONE.r - 3, background: '#050505', padding: PHONE.bezel - 3}}>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: PHONE.r - PHONE.bezel, overflow: 'hidden', background: '#000'}}>
				{children}
			</div>
		</div>
		{sheen > 0 ? (
			<div style={{position: 'absolute', inset: 0, borderRadius: PHONE.r, background: `linear-gradient(105deg, rgba(255,255,255,0) ${30 + sheen * 40}%, rgba(255,255,255,0.18) ${40 + sheen * 40}%, rgba(255,255,255,0) ${50 + sheen * 40}%)`, pointerEvents: 'none'}} />
		) : null}
	</div>
);

/** Lock-screen wallpaper + clock. */
export const LockScreen: React.FC<{dim?: number}> = ({dim = 0.35}) => (
	<AbsoluteFill>
		<Img src={staticFile('img/cover.jpg')} style={{position: 'absolute', height: '100%', left: '50%', translate: '-58% 0', objectFit: 'cover'}} />
		<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${dim + 0.25}) 0%, rgba(0,0,0,${dim}) 35%, rgba(0,0,0,${dim + 0.3}) 100%)`}} />
		<div style={{position: 'absolute', top: 196, width: '100%', textAlign: 'center', fontFamily: F.ui, color: 'rgba(255,255,255,0.92)'}}>
			<div style={{fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', opacity: 0.85}}>Thursday 15 October</div>
			<div style={{fontSize: 96, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1}}>9:41</div>
		</div>
	</AbsoluteFill>
);

/** Island pill → expanded live activity. p: 0 = pill, 1 = expanded. */
export const Island: React.FC<{p: number; children?: React.ReactNode}> = ({p, children}) => {
	const w = 120 + (392 - 120) * p;
	const h = 36 + (84 - 36) * p;
	return (
		<div
			style={{
				position: 'absolute',
				top: 12,
				left: '50%',
				translate: '-50% 0',
				width: w,
				height: h,
				borderRadius: h / 2,
				background: '#000',
				overflow: 'hidden',
				boxShadow: p > 0.05 ? `0 10px 30px rgba(0,0,0,${0.5 * p})` : 'none',
			}}
		>
			{children}
		</div>
	);
};

