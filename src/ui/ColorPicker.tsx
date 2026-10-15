import React from 'react';
import {F} from '../fonts';
import {C} from '../theme';

export const GRID = {cols: 12, rows: 7, cell: 79, x: 64, y: 316};

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;
/** iOS-style grid: row 0 greys (white → black), then hue columns from dark to light. Oxblood sits in the red column. */
export const cellColor = (r: number, c: number) => {
	if (r === 0) {
		const v = Math.round(255 * (1 - c / (GRID.cols - 1)));
		return `rgb(${v},${v},${v})`;
	}
	if (r === 1 && c === 0) return C.oxblood;
	const hues = [356, 14, 32, 46, 58, 82, 140, 172, 198, 222, 262, 300];
	const l = 22 + (r - 1) * 11;
	return hsl(hues[c], 62 - (r - 1) * 4, l);
};
export const OXBLOOD_CELL = {r: 1, c: 0};
export const WHITE_CELL = {r: 0, c: 0};
export const cellCenter = (r: number, c: number) => ({x: GRID.x + c * GRID.cell + GRID.cell / 2, y: GRID.y + r * GRID.cell + GRID.cell / 2});

export const ColorPicker: React.FC<{hex: string; label: React.ReactNode; swatch: string; children?: React.ReactNode}> = ({hex, label, swatch, children}) => (
	<div style={{position: 'absolute', inset: 0}}>
		<div style={{position: 'absolute', left: 64, right: 64, top: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.ui}}>
			<div style={{fontSize: 36, fontWeight: 600, color: C.label, letterSpacing: '-0.01em'}}>Colours</div>
			<div style={{position: 'absolute', right: 0, width: 56, height: 56, borderRadius: 28, background: C.row, color: C.labelSecondary, fontSize: 30, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</div>
		</div>
		<div style={{position: 'absolute', left: 64, right: 64, top: 206, height: 64, borderRadius: 18, background: C.row, display: 'flex', padding: 5, fontFamily: F.ui, fontSize: 28, fontWeight: 600, color: C.label}}>
			{['Grid', 'Spectrum', 'Sliders'].map((t, i) => (
				<div key={t} style={{flex: 1, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? '#636366' : 'transparent'}}>
					{t}
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: GRID.x, top: GRID.y, width: GRID.cols * GRID.cell, height: GRID.rows * GRID.cell, borderRadius: 16, overflow: 'hidden', display: 'grid', gridTemplateColumns: `repeat(${GRID.cols}, ${GRID.cell}px)`}}>
			{Array.from({length: GRID.rows * GRID.cols}, (_, i) => {
				const r = Math.floor(i / GRID.cols);
				const c = i % GRID.cols;
				return <div key={i} style={{width: GRID.cell, height: GRID.cell, background: cellColor(r, c)}} />;
			})}
		</div>
		<div style={{position: 'absolute', left: 64, right: 64, top: GRID.y + GRID.rows * GRID.cell + 40, display: 'flex', alignItems: 'center', gap: 28}}>
			<div style={{width: 112, height: 112, borderRadius: 24, background: swatch, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.15)'}} />
			<div style={{flex: 1, fontFamily: F.ui}}>
				<div style={{fontSize: 44, fontWeight: 700, color: C.label, letterSpacing: '-0.01em'}}>{label}</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 8}}>
					<div style={{fontSize: 28, fontWeight: 500, color: C.labelSecondary}}>Hex Colour #</div>
					<div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 34, color: C.label, background: C.row, borderRadius: 12, padding: '6px 16px', minWidth: 170}}>{hex}</div>
				</div>
			</div>
		</div>
		{children}
	</div>
);

/** Picker loupe: ring + magnified colour. */
export const Loupe: React.FC<{x: number; y: number; color: string; scale?: number}> = ({x, y, color, scale = 1}) => (
	<div style={{position: 'absolute', left: x - 64, top: y - 64, width: 128, height: 128, borderRadius: 64, background: color, border: '6px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(0,0,0,0.15)', scale: String(scale)}} />
);
