import React from 'react';
import {geoMercator, geoPath} from 'd3-geo';
import {PUNJAB_FEATURE, COORD} from './MapStage';
import {C} from '../theme';
import {lerp, rng} from '../lib/anim';

export const CARD = {x: 250, y: 250, w: 580, h: 580, r: 28, pad: 56};
const N = 220;

// Punjab outline projected into the card, resampled to N points starting at the
// border point nearest the coordinate (so the route "lands" on the outline).
const cardProj = geoMercator().fitExtent(
	[
		[CARD.x + CARD.pad, CARD.y + CARD.pad],
		[CARD.x + CARD.w - CARD.pad, CARD.y + CARD.h - CARD.pad],
	],
	PUNJAB_FEATURE,
);
export const CARD_DOT = cardProj(COORD) as [number, number];
export const PUNJAB_CARD_PATH = geoPath(cardProj)(PUNJAB_FEATURE) ?? '';

const outlineRing = (() => {
	const g = PUNJAB_FEATURE.geometry as GeoJSON.MultiPolygon;
	// largest ring
	let ring = g.coordinates[0][0];
	for (const poly of g.coordinates) if (poly[0].length > ring.length) ring = poly[0];
	const pts = ring.map((c) => cardProj(c as [number, number]) as [number, number]);
	return resample(pts, N, true);
})();

function resample(pts: [number, number][], n: number, closed: boolean): [number, number][] {
	const p = closed ? [...pts, pts[0]] : pts;
	const seg: number[] = [0];
	for (let i = 1; i < p.length; i++) seg.push(seg[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
	const total = seg[seg.length - 1];
	const out: [number, number][] = [];
	let j = 1;
	for (let k = 0; k < n; k++) {
		const d = (k / (closed ? n : n - 1)) * total;
		while (j < seg.length - 1 && seg[j] < d) j++;
		const t = (d - seg[j - 1]) / Math.max(1e-6, seg[j] - seg[j - 1]);
		out.push([lerp(p[j - 1][0], p[j][0], t), lerp(p[j - 1][1], p[j][1], t)]);
	}
	return out;
}

/** Route from the screen dot outward (seeded meander), N points. */
export const routePoints = (from: [number, number]): [number, number][] => {
	const r = rng(76103);
	const pts: [number, number][] = [from];
	let a = -2.3;
	let [x, y] = from;
	for (let i = 1; i < 40; i++) {
		a += (r() - 0.5) * 0.9;
		x += Math.cos(a) * 26;
		y += Math.sin(a) * 26;
		pts.push([x, y]);
	}
	return resample(pts, N, false);
};

// rotate the outline so it starts at the point nearest the coordinate
const startIdx = outlineRing.reduce((best, p, i) => (Math.hypot(p[0] - CARD_DOT[0], p[1] - CARD_DOT[1]) < Math.hypot(outlineRing[best][0] - CARD_DOT[0], outlineRing[best][1] - CARD_DOT[1]) ? i : best), 0);
const OUTLINE = [...outlineRing.slice(startIdx), ...outlineRing.slice(0, startIdx)];

/**
 * draw: 0..1 how much of the dotted route is drawn (from the dot outward)
 * morph: 0..1 route → Punjab outline
 * card: 0..1 white card presence
 */
export const OutlineCard: React.FC<{from: [number, number]; draw: number; morph: number; card: number; dotPulse?: number}> = ({from, draw, morph, card, dotPulse = 0}) => {
	const route = routePoints(from);
	const pts = route.map((p, i) => [lerp(p[0], OUTLINE[i][0], morph), lerp(p[1], OUTLINE[i][1], morph)] as [number, number]);
	const visible = Math.max(2, Math.round(lerp(draw, 1, morph) * N));
	const d = 'M ' + pts.slice(0, visible).map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ') + (morph >= 0.999 ? ' Z' : '');
	const stroke = morph > 0.5 ? C.oxblood : C.parchment;
	const s = 0.7 + 0.3 * card;
	const dot: [number, number] = [lerp(from[0], CARD_DOT[0], morph), lerp(from[1], CARD_DOT[1], morph)];
	return (
		<svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{position: 'absolute', inset: 0}}>
			{card > 0 ? (
				<g transform={`translate(540 540) scale(${s}) translate(-540 -540)`} opacity={Math.min(1, card * 1.6)}>
					<rect x={CARD.x} y={CARD.y + 14} width={CARD.w} height={CARD.h} rx={CARD.r} fill="#000" opacity={0.35} filter="blur(18px)" />
					<rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.r} fill="#F7F4F1" />
				</g>
			) : null}
			<path d={d} fill="none" stroke={stroke} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 13" />
			{morph >= 0.999 ? <path d={PUNJAB_CARD_PATH} fill={C.oxblood} fillOpacity={0.07} stroke="none" /> : null}
			<circle cx={dot[0]} cy={dot[1]} r={16 + 10 * dotPulse} fill={C.accentGlow} opacity={0.25} />
			<circle cx={dot[0]} cy={dot[1]} r={9} fill="#fff" />
			<circle cx={dot[0]} cy={dot[1]} r={6.5} fill={C.accentGlow} />
		</svg>
	);
};

/** Mercator scale/centre equivalent to the card projection (for the S8 pull-back). */
export const CARD_PROJ_SCALE = cardProj.scale();
export const CARD_PROJ_CENTER = cardProj.invert!([540, 540]) as [number, number];
