import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import cfg from '../data/config.json';
import {ColorPicker, Loupe, OXBLOOD_CELL, WHITE_CELL, cellCenter} from '../ui/ColorPicker';
import {S} from '../lib/schedule';
import {line, stem} from '../lib/lyrics';
import {prog, secToFrame, useAbsFrame} from '../lib/time';
import {clamp01, landSpring, lerp} from '../lib/anim';
import {springPop, whipOut} from '../motion';
import {F as FONT} from '../fonts';
import {C} from '../theme';

const SHEET_TOP = 80;

/** Scene 7: colour picker → loupe lands on white on the 808 → white floods the frame (Dropout B). */
export const S7Picker: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const F = (t: number) => secToFrame(t, fps);
	// sheet decelerates up from the beat (velocity peak on L8), settling within one 8th
	const sheet = interpolate(frame, [F(S.s7.start) - 1, F(S.s7.start + S.e8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipOut.easing});
	const y = lerp(1080, SHEET_TOP, sheet);
	const glide = landSpring(frame, fps, S.s7.loupeLand, springPop);
	const a = cellCenter(OXBLOOD_CELL.r, OXBLOOD_CELL.c);
	const b = cellCenter(WHITE_CELL.r, WHITE_CELL.c);
	const lx = lerp(a.x, b.x, glide);
	const ly = lerp(a.y, b.y, glide);
	const landed = frame >= F(S.s7.loupeLand);
	const typed = S.s7.hexChars.filter((t) => F(t) <= frame).length;
	const hex = landed ? 'FFFFFF'.slice(0, typed) : C.oxblood.slice(1).toUpperCase();
	const loupeColor = `color-mix(in srgb, ${C.oxblood} ${100 - clamp01(glide) * 100}%, #ffffff)`;
	// the white swatch scales out from the loupe and floods the frame
	// accelerating swell: the biggest change lands on 'white full' (a beat)
	const flood = prog(frame, fps, S.s7.floodStart, S.s7.floodFull) ** 2.4;
	const dy = y - SHEET_TOP;
	const word = stem(line('L8').words[0]);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: '#000', opacity: 0.6 * clamp01(sheet)}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: y, height: 1080, borderRadius: '40px 40px 0 0', background: 'rgba(28,28,30,0.97)', boxShadow: '0 -20px 60px rgba(0,0,0,0.6)'}} />
			<div style={{position: 'absolute', inset: 0, translate: `0px ${dy}px`}}>
				<ColorPicker
					hex={hex}
					swatch={landed ? '#FFFFFF' : C.oxblood}
					label={
						<span>
							{word} · <span style={{fontFamily: FONT.gurmukhi, fontWeight: 600}}>{cfg.colorNameGurmukhi}</span>
						</span>
					}
				>
					<Loupe x={lx} y={ly} color={loupeColor} scale={1 + 0.08 * Math.sin(Math.PI * clamp01(glide))} />
				</ColorPicker>
			</div>
			{flood > 0 ? (
				<div style={{position: 'absolute', left: lx, top: ly + dy, width: 0, height: 0}}>
					<div style={{position: 'absolute', left: -1700 * flood - 58, top: -1700 * flood - 58, width: 3400 * flood + 116, height: 3400 * flood + 116, borderRadius: '50%', background: '#fff'}} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};
