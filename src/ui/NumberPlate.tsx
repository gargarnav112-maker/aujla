import React from 'react';
import {F} from '../fonts';
import {C} from '../theme';

const LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ';
const DIGITS = '0123456789';

/** One odometer column: `roll` = how many characters away from the final glyph (fractional). */
const Column: React.FC<{ch: string; roll: number; blur: number}> = ({ch, roll, blur}) => {
	const seq = /\d/.test(ch) ? DIGITS : LETTERS;
	const idx = Math.max(0, seq.indexOf(ch));
	const base = Math.floor(roll);
	const frac = roll - base;
	const at = (k: number) => seq[(((idx + k) % seq.length) + seq.length) % seq.length];
	const H = 150;
	return (
		<div style={{position: 'relative', width: '0.62em', height: H, overflow: 'hidden'}}>
			{[0, 1].map((j) => (
				<div
					key={j}
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 0,
						height: H,
						lineHeight: `${H}px`,
						textAlign: 'center',
						translate: `0px ${(frac - j) * H}px`,
						filter: blur > 0.3 ? `blur(0px ${blur}px)` : undefined,
					}}
				>
					{at(base + j)}
				</div>
			))}
		</div>
	);
};

/** Indian high-security-style plate (generic): white, embossed mono chars, blue IND strip. */
export const NumberPlate: React.FC<{text: string; rolls: number[]; blurs: number[]; glint: number}> = ({text, rolls, blurs, glint}) => {
	let col = 0;
	const groups = text.split(/\s+/);
	return (
		<div
			style={{
				position: 'relative',
				width: 952,
				height: 224,
				borderRadius: 20,
				background: 'linear-gradient(180deg, #ffffff 0%, #f1f1ee 55%, #e4e3df 100%)',
				boxShadow: '0 30px 70px rgba(0,0,0,0.6), inset 0 0 0 3px #c9c9c4, inset 0 0 0 9px #fbfbfa, inset 0 0 0 12px #1a1a1a',
				display: 'flex',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			<div style={{width: 104, alignSelf: 'stretch', margin: 12, marginRight: 0, borderRadius: '10px 0 0 10px', background: `linear-gradient(180deg, ${C.plateBlue}, #173d86)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 16px'}}>
				<div style={{width: 58, height: 58, borderRadius: 29, background: 'conic-gradient(from 30deg, #d9dde3, #8f969f, #f5f7fa, #a3aab3, #d9dde3)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.6)'}} />
				<div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: '0.04em'}}>IND</div>
			</div>
			<div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: F.mono, fontWeight: 600, fontSize: 116, color: '#141414', textShadow: '0 2px 0 rgba(255,255,255,0.9), 0 -1px 0 rgba(0,0,0,0.35), 0 3px 4px rgba(0,0,0,0.25)'}}>
				{groups.map((g, gi) => (
					<div key={gi} style={{display: 'flex'}}>
						{g.split('').map((ch) => {
							const i = col++;
							return <Column key={i} ch={ch} roll={rolls[i] ?? 0} blur={blurs[i] ?? 0} />;
						})}
					</div>
				))}
			</div>
			{glint > 0 && glint < 1 ? (
				<div style={{position: 'absolute', top: -40, bottom: -40, left: `${-30 + glint * 140}%`, width: 120, rotate: '18deg', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.85), rgba(255,255,255,0))', mixBlendMode: 'screen'}} />
			) : null}
		</div>
	);
};
