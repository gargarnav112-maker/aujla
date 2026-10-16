import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {geoMercator, geoPath, type GeoProjection} from 'd3-geo';
import {feature} from 'topojson-client';
import type {Topology, GeometryCollection} from 'topojson-specification';
import landTopo from 'world-atlas/land-50m.json';
import statesJson from '../data/states-nw.json';
import punjabJson from '../data/punjab.json';
import cfg from '../data/config.json';
import {C} from '../theme';
import {rng} from '../lib/anim';

// ---------------------------------------------------------------------------
// Satellite-style vector map: land + sea, noise terrain, Punjab (and its
// non-disputed neighbouring states), and procedural farmland around the
// coordinate at close zoom. No international borders are drawn.
// ---------------------------------------------------------------------------

export const COORD: [number, number] = [cfg.coord.lon, cfg.coord.lat];
export const SIZE = 1080;

const land = feature(landTopo as unknown as Topology, (landTopo as unknown as Topology).objects.land as GeometryCollection);
type FC = GeoJSON.FeatureCollection;
const states = statesJson as unknown as FC;
const punjab = punjabJson as unknown as GeoJSON.Feature;

/** Scale at which all of India fits the frame (the dive's starting point). */
export const INDIA_SCALE = 1500;
/** Scale where ~1.4 km spans the frame (village level). */
export const VILLAGE_SCALE = 4.2e6;
export const INDIA_CENTER: [number, number] = [79.5, 22.8];

export const makeProjection = (scale: number, center: [number, number]): GeoProjection =>
	geoMercator()
		.scale(scale)
		.center(center)
		.translate([SIZE / 2, SIZE / 2])
		.clipExtent([
			[-80, -80],
			[SIZE + 80, SIZE + 80],
		]);

/** Pixels per metre at the coordinate for a mercator scale. */
export const pxPerMetre = (scale: number) => scale / (6378137 * Math.cos((COORD[1] * Math.PI) / 180));

// ---- procedural farmland, in local metres around the coordinate (y down = south) ----
type Plot = {x: number; y: number; w: number; h: number; c: string};
const FIELD_TONES = ['#5c5d43', '#6a6849', '#4e5940', '#78704f', '#57543d', '#636a4f', '#706245', '#4a5139', '#7d7a5a'];

const buildFields = () => {
	const r = rng(30694);
	const plots: Plot[] = [];
	const block = 640; // road grid spacing (m)
	const R = 4200;
	for (let bx = -R; bx < R; bx += block) {
		for (let by = -R; by < R; by += block) {
			if (Math.hypot(bx + block / 2, by + block / 2) > R) continue;
			// each block is split into strips running one way or the other
			const vertical = r() > 0.5;
			let off = 6;
			while (off < block - 6) {
				const sw = 40 + Math.floor(r() * 4) * 22;
				const w = Math.min(sw, block - 6 - off);
				// some strips are split along their length
				const splits = r() > 0.6 ? 2 : 1;
				for (let s = 0; s < splits; s++) {
					const len = (block - 12) / splits;
					const c = FIELD_TONES[Math.floor(r() * FIELD_TONES.length)];
					if (vertical) plots.push({x: bx + off, y: by + 6 + s * len, w: w - 3, h: len - 3, c});
					else plots.push({x: bx + 6 + s * len, y: by + off, w: len - 3, h: w - 3, c});
				}
				off += w;
			}
		}
	}
	// village: dense small roofs around the coordinate
	const roofs: Plot[] = [];
	for (let i = 0; i < 260; i++) {
		const a = r() * Math.PI * 2;
		const d = Math.sqrt(r()) * 230;
		const s = 9 + r() * 16;
		roofs.push({x: Math.cos(a) * d - s / 2 + 40, y: Math.sin(a) * d * 0.8 - s / 2 - 30, w: s, h: s * (0.6 + r() * 0.7), c: r() > 0.7 ? '#8a8378' : r() > 0.4 ? '#6f675d' : '#7c5f4f'});
	}
	const trees: {x: number; y: number; r: number}[] = [];
	for (let i = 0; i < 420; i++) {
		const along = r() > 0.5;
		const k = Math.round((r() * 2 - 1) * (R / block)) * block;
		const t = (r() * 2 - 1) * R;
		trees.push({x: along ? k + 4 : t, y: along ? t : k + 4, r: 4 + r() * 7});
	}
	return {plots, roofs, trees, block, R};
};
const FIELDS = buildFields();

// coarse farmland for the mid-zoom (5–40 km views), radius 32 km
const MACRO = (() => {
	const r = rng(76103);
	const plots: Plot[] = [];
	const block = 4200;
	const R = 32000;
	for (let bx = -R; bx < R; bx += block) {
		for (let by = -R; by < R; by += block) {
			if (Math.hypot(bx + block / 2, by + block / 2) > R) continue;
			const vertical = r() > 0.5;
			let off = 0;
			while (off < block) {
				const w = Math.min(380 + Math.floor(r() * 4) * 180, block - off);
				const c = FIELD_TONES[Math.floor(r() * FIELD_TONES.length)];
				if (vertical) plots.push({x: bx + off, y: by, w: w - 30, h: block - 30, c});
				else plots.push({x: bx, y: by + off, w: block - 30, h: w - 30, c});
				off += w;
			}
		}
	}
	return {plots, R, block};
})();

const Macro: React.FC = React.memo(() => (
	<g>
		{MACRO.plots.map((p, i) => (
			<rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />
		))}
		{Array.from({length: Math.round((2 * MACRO.R) / MACRO.block) + 1}, (_, i) => -MACRO.R + i * MACRO.block).map((k) => (
			<g key={k}>
				<line x1={k - 15} y1={-MACRO.R} x2={k - 15} y2={MACRO.R} stroke="#9a948a" strokeWidth={30} opacity={0.45} />
				<line x1={-MACRO.R} y1={k - 15} x2={MACRO.R} y2={k - 15} stroke="#9a948a" strokeWidth={30} opacity={0.45} />
			</g>
		))}
		<path d={`M ${-MACRO.R} 7000 L ${MACRO.R} -12000`} stroke="#b5aea2" strokeWidth={60} opacity={0.6} />
		<path d={`M ${-MACRO.R} -20000 C -9000 -8000, -3000 -2000, 300 380 S 14000 16000, ${MACRO.R} 26000`} stroke="#3f4d55" strokeWidth={120} fill="none" opacity={0.85} />
	</g>
));

/** Soft circular fade so procedural layers never show a hard edge. */
const SoftMask: React.FC<{id: string; r: number}> = ({id, r}) => (
	<mask id={id} maskUnits="userSpaceOnUse" x={-r} y={-r} width={2 * r} height={2 * r}>
		<radialGradient id={`${id}-g`} cx={0} cy={0} r={r} gradientUnits="userSpaceOnUse">
			<stop offset="0.72" stopColor="#fff" />
			<stop offset="1" stopColor="#000" />
		</radialGradient>
		<circle cx={0} cy={0} r={r} fill={`url(#${id}-g)`} />
	</mask>
);

const Fields: React.FC = React.memo(() => (
	<g>
		{FIELDS.plots.map((p, i) => (
			<rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />
		))}
		{/* road grid */}
		{Array.from({length: Math.round((2 * FIELDS.R) / FIELDS.block) + 1}, (_, i) => -FIELDS.R + i * FIELDS.block).map((k) => (
			<g key={k}>
				<line x1={k} y1={-FIELDS.R} x2={k} y2={FIELDS.R} stroke="#9a948a" strokeWidth={6} opacity={0.55} />
				<line x1={-FIELDS.R} y1={k} x2={FIELDS.R} y2={k} stroke="#9a948a" strokeWidth={6} opacity={0.55} />
			</g>
		))}
		{/* highway + canal */}
		<path d={`M ${-FIELDS.R} 900 L ${FIELDS.R} -1500`} stroke="#b5aea2" strokeWidth={14} opacity={0.7} />
		<path d={`M ${-FIELDS.R} -2400 C -1500 -1200, -600 -900, 300 380 S 2600 2600, ${FIELDS.R} 3400`} stroke="#3f4d55" strokeWidth={26} fill="none" opacity={0.9} />
		{FIELDS.trees.map((t, i) => (
			<circle key={i} cx={t.x} cy={t.y} r={t.r} fill="#2f3a2c" opacity={0.85} />
		))}
		{FIELDS.roofs.map((p, i) => (
			<rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />
		))}
	</g>
));

/** Ground-anchored two-octave noise so terrain texture scales with the zoom. */
const TerrainNoise: React.FC<{scale: number; anchor: [number, number]; strength: number}> = ({scale, anchor, strength}) => {
	const z = Math.log2(scale / INDIA_SCALE);
	const u = z - Math.floor(z);
	const oct = Math.floor(z);
	// two opaque grey octaves (bottom always opaque, top fades in) so overall
	// brightness never pumps through the crossfade
	const layer = (k: number, opacity: number) => {
		const s = 2 ** (u - k);
		const seed = (((oct + k) % 7) + 7) % 7;
		return (
			<g key={k} transform={`translate(${anchor[0]} ${anchor[1]}) scale(${s})`} opacity={opacity}>
				<rect x={-4000} y={-4000} width={8000} height={8000} filter={`url(#terr${seed})`} />
			</g>
		);
	};
	return (
		<g style={{mixBlendMode: 'overlay'}} opacity={strength}>
			<defs>
				{Array.from({length: 7}, (_, i) => (
					<filter key={i} id={`terr${i}`} filterUnits="userSpaceOnUse" x={-4000} y={-4000} width={8000} height={8000} colorInterpolationFilters="sRGB">
						<feTurbulence type="fractalNoise" baseFrequency={0.022} numOctaves={4} seed={i * 13 + 5} />
						<feColorMatrix type="matrix" values="1.1 0 0 0 -0.05  1.1 0 0 0 -0.05  1.1 0 0 0 -0.05  0 0 0 0 1" />
					</filter>
				))}
			</defs>
			{layer(0, 1)}
			{layer(-1, u)}
		</g>
	);
};

export type MapProps = {
	scale: number;
	center: [number, number];
	grey?: number; // 0 colour → 1 greyscale
	dot?: number; // opacity of the location dot
	pulse?: number; // 0..1 beat pulse for the dot halo
	punjab?: number; // opacity of the Punjab outline
	states?: number; // opacity of neighbouring state outlines
	children?: (proj: GeoProjection) => React.ReactNode;
};

export const MapStage: React.FC<MapProps> = ({scale, center, grey = 0, dot = 1, pulse = 0, punjab: pj = 1, states: st = 0.5, children}) => {
	const proj = useMemo(() => makeProjection(scale, center), [scale, center]);
	const path = geoPath(proj);
	const anchor = proj(COORD) as [number, number];
	const ppm = pxPerMetre(scale);
	const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (Math.log10(v) - Math.log10(a)) / (Math.log10(b) - Math.log10(a))));
	const macroOn = ramp(ppm, 0.0012, 0.004) * (1 - ramp(ppm, 0.25, 0.6));
	const fieldsOn = ramp(ppm, 0.04, 0.16);
	const landD = path(land as unknown as GeoJSON.FeatureCollection) ?? '';
	return (
		<AbsoluteFill style={{filter: `saturate(${1 - grey}) contrast(${1 + grey * 0.12}) brightness(${1 - grey * 0.08})`}}>
			<svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
				<defs>
					<radialGradient id="sea" cx="50%" cy="45%" r="75%">
						<stop offset="0%" stopColor="#123a9c" />
						<stop offset="100%" stopColor="#06154a" />
					</radialGradient>
					<linearGradient id="landg" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#4f6a45" />
						<stop offset="55%" stopColor="#4a5a3c" />
						<stop offset="100%" stopColor={C.earth} />
					</linearGradient>
				</defs>
				<rect width={SIZE} height={SIZE} fill="url(#sea)" />
				<path d={landD} fill="url(#landg)" />
				{macroOn > 0 ? (
					<g opacity={macroOn} transform={`translate(${anchor[0]} ${anchor[1]}) scale(${ppm})`}>
						<SoftMask id="macro-m" r={MACRO.R} />
						<g mask="url(#macro-m)">
							<Macro />
						</g>
					</g>
				) : null}
				{fieldsOn > 0 ? (
					<g opacity={fieldsOn} transform={`translate(${anchor[0]} ${anchor[1]}) scale(${ppm})`}>
						<SoftMask id="micro-m" r={FIELDS.R} />
						<g mask="url(#micro-m)">
							<Fields />
						</g>
					</g>
				) : null}
				<TerrainNoise scale={scale} anchor={anchor} strength={0.6 - 0.3 * Math.max(macroOn, fieldsOn)} />
				{/* slate grade */}
				<rect width={SIZE} height={SIZE} fill={C.slate} opacity={0.12} style={{mixBlendMode: 'color'}} />
				<rect width={SIZE} height={SIZE} fill={C.slateDeep} opacity={0.18} style={{mixBlendMode: 'multiply'}} />
				{st > 0
					? states.features
							.filter((f) => (f.properties as {name: string}).name !== 'Punjab')
							.map((f, i) => <path key={i} d={path(f) ?? ''} fill="none" stroke={C.bone} strokeOpacity={0.35 * st} strokeWidth={1.2} />)
					: null}
				{pj > 0 ? <path d={path(punjab) ?? ''} fill={C.parchment} fillOpacity={0.06 * pj} stroke={C.parchment} strokeOpacity={0.85 * pj} strokeWidth={2} /> : null}
				{dot > 0 ? <LocationDot x={anchor[0]} y={anchor[1]} pulse={pulse} opacity={dot} /> : null}
				{children ? children(proj) : null}
			</svg>
		</AbsoluteFill>
	);
};

export const LocationDot: React.FC<{x: number; y: number; pulse: number; opacity?: number}> = ({x, y, pulse, opacity = 1}) => (
	<g opacity={opacity}>
		<circle cx={x} cy={y} r={30 + 40 * (1 - pulse)} fill={C.bubbleBlue} opacity={0.3 * pulse} />
		<circle cx={x} cy={y} r={30} fill={C.bubbleBlue} opacity={0.22} />
		<circle cx={x} cy={y} r={17} fill="#fff" />
		<circle cx={x} cy={y} r={12.5 * (1 + 0.12 * pulse)} fill={C.bubbleBlue} />
	</g>
);

export {punjab as PUNJAB_FEATURE};
