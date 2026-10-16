import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

import {F} from '../fonts';
import cfg from '../data/config.json';

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

/** iOS lock screen with the now-playing player (modelled on reference/lockscreen-ref.jpg). progress: 0..1 scrubber. */
export const LockScreen: React.FC<{progress?: number; playing?: boolean}> = ({progress = 0.77, playing = true}) => {
	const W = PHONE.w - 2 * PHONE.bezel; // 424
	const glyph = 'rgba(255,255,255,0.92)';
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #3b2b26 0%, #2a211f 40%, #1f1e20 75%, #1a1a1c 100%)', fontFamily: F.ui, letterSpacing: '-0.01em'}}>
			{/* time + date */}
			<div style={{position: 'absolute', top: 62, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22, color: '#F4EEEA'}}>
				<div style={{fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: 30}}>{cfg.lockTime}</div>
				<div style={{fontWeight: 500, fontSize: 25, color: '#E9DCD5'}}>{cfg.lockDate}</div>
			</div>
			{/* artwork card */}
			<Img src={staticFile('img/cover.jpg')} style={{position: 'absolute', left: 16, top: 118, width: W - 32, height: W - 32, borderRadius: 18, objectFit: 'cover', boxShadow: '0 18px 40px rgba(0,0,0,0.45)'}} />
			{/* now-playing panel */}
			<div style={{position: 'absolute', left: 16, right: 16, top: 536, height: 168, borderRadius: 26, background: 'rgba(110,104,102,0.32)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)', backdropFilter: 'blur(30px) saturate(180%)'}}>
				<div style={{position: 'absolute', top: 16, width: '100%', textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 19}}>{cfg.songTitle}</div>
				<div style={{position: 'absolute', top: 42, width: '100%', textAlign: 'center', color: 'rgba(235,235,245,0.6)', fontWeight: 500, fontSize: 16}}>{cfg.artist}</div>
				<div style={{position: 'absolute', right: 18, top: 22, display: 'flex', gap: 3}}>
					{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{width: 2.5, height: 2.5, borderRadius: 2, background: 'rgba(235,235,245,0.4)'}} />)}
				</div>
				<div style={{position: 'absolute', top: 76, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(235,235,245,0.6)', fontSize: 12, fontWeight: 500}}>
					<span>{fmt(progress * cfg.trackSeconds)}</span>
					<div style={{flex: 1, height: 6, borderRadius: 3, background: 'rgba(235,235,245,0.18)', overflow: 'hidden'}}>
						<div style={{width: `${progress * 100}%`, height: '100%', background: 'rgba(235,235,245,0.62)'}} />
					</div>
					<span>-{fmt((1 - progress) * cfg.trackSeconds)}</span>
				</div>
				<div style={{position: 'absolute', top: 108, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<svg width={28} height={28} viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" fill="none" stroke="rgba(235,235,245,0.6)" strokeWidth={1.6} strokeLinejoin="round" /></svg>
					<svg width={40} height={28} viewBox="0 0 40 24"><path d="M19 4v16L6 12zM34 4v16L21 12z" fill={glyph} /></svg>
					{playing ? (
						<svg width={30} height={34} viewBox="0 0 24 28"><rect x="3" y="3" width="6" height="22" rx="1.5" fill={glyph} /><rect x="15" y="3" width="6" height="22" rx="1.5" fill={glyph} /></svg>
					) : (
						<svg width={30} height={34} viewBox="0 0 24 28"><path d="M4 2.5v23L22 14z" fill={glyph} /></svg>
					)}
					<svg width={40} height={28} viewBox="0 0 40 24"><path d="M6 4v16l13-8zM21 4v16l13-8z" fill={glyph} /></svg>
					<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.6)" strokeWidth={1.6} strokeLinecap="round"><path d="M5.5 16.5a9 9 0 1 1 13 0" /><path d="M8.6 13.8a5 5 0 1 1 6.8 0" /><circle cx="12" cy="10.5" r="1.4" fill="rgba(235,235,245,0.6)" stroke="none" /></svg>
				</div>
			</div>
			{/* flashlight + camera */}
			{[{x: 46}, {x: W - 46 - 62}].map((b, i) => (
				<div key={i} style={{position: 'absolute', left: b.x, top: 760, width: 62, height: 62, borderRadius: 31, background: 'rgba(60,60,64,0.6)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					{i === 0 ? (
						<svg width={22} height={30} viewBox="0 0 16 24"><path d="M3 2h10v4l-2 4v11.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 5 21.5V10L3 6z" fill="#fff" /><rect x="6.8" y="12" width="2.4" height="4" rx="1" fill="#333" /></svg>
					) : (
						<svg width={30} height={24} viewBox="0 0 24 20"><path d="M8 3l1.6-2h4.8L16 3h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#fff" /><circle cx="12" cy="10.5" r="4.2" fill="#333" /><circle cx="12" cy="10.5" r="2.8" fill="#fff" /></svg>
					)}
				</div>
			))}
			<div style={{position: 'absolute', bottom: 10, left: '50%', translate: '-50% 0', width: 140, height: 5, borderRadius: 3, background: '#fff'}} />
		</AbsoluteFill>
	);
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

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

