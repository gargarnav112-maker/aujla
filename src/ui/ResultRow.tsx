import React from 'react';
import {Img, staticFile} from 'remotion';
import {F} from '../fonts';
import {C} from '../theme';
import {hexA} from '../motion';

/** Artist tile: photo if provided in public/img/people, else a bone monogram. */
export const ArtistTile: React.FC<{name: string; photo?: string | null; size?: number; round?: boolean}> = ({name, photo, size = 96, round = true}) => {
	const initials = name
		.split(/\s+/)
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	return photo ? (
		<Img src={staticFile(photo)} style={{width: size, height: size, borderRadius: round ? size / 2 : 18, objectFit: 'cover', flexShrink: 0}} />
	) : (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: round ? size / 2 : 18,
				background: `linear-gradient(145deg, ${C.panel}, ${C.slateDeep})`,
				border: `2px solid ${hexA(C.bone, 0.6)}`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: F.ui,
				fontWeight: 700,
				fontSize: size * 0.36,
				letterSpacing: '0.02em',
				color: C.parchment,
				flexShrink: 0,
			}}
		>
			{initials}
		</div>
	);
};

/** Result row; `typed` characters of `name` are bright, the rest secondary (live match). */
export const ResultRow: React.FC<{name: string; typed: number; subtitle: string; photo?: string | null; right?: React.ReactNode; highlight?: number}> = ({name, typed, subtitle, photo, right, highlight = 0}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 28, height: 132, padding: '0 8px'}}>
		<ArtistTile name={name} photo={photo} />
		<div style={{flex: 1, fontFamily: F.ui, letterSpacing: '-0.01em'}}>
			<div style={{fontSize: 42, fontWeight: 600, color: highlight > 0 ? `color-mix(in srgb, ${C.label} ${100 - 100 * highlight}%, ${C.accentGlow})` : C.label, textShadow: highlight > 0 ? `0 0 ${18 * highlight}px ${hexA(C.accentGlow, 0.6 * highlight)}` : 'none'}}>
				<span>{name.slice(0, typed)}</span>
				<span style={{color: highlight > 0 ? undefined : C.labelSecondary}}>{name.slice(typed)}</span>
			</div>
			<div style={{fontSize: 30, fontWeight: 500, color: C.labelSecondary, marginTop: 2}}>{subtitle}</div>
		</div>
		{right}
	</div>
);

/** Skeleton row (loading shimmer) — used instead of naming other artists. */
export const SkeletonRow: React.FC<{shimmer: number; widths?: [number, number]}> = ({shimmer, widths = [360, 200]}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 28, height: 132, padding: '0 8px', opacity: 0.9}}>
		<div style={{width: 96, height: 96, borderRadius: 18, background: C.row}} />
		<div style={{flex: 1}}>
			{widths.map((w, i) => (
				<div
					key={i}
					style={{
						width: w,
						height: i === 0 ? 30 : 24,
						borderRadius: 12,
						marginBottom: 14,
						background: `linear-gradient(90deg, ${C.row} ${shimmer * 100 - 30}%, #3A3A3C ${shimmer * 100}%, ${C.row} ${shimmer * 100 + 30}%)`,
					}}
				/>
			))}
		</div>
	</div>
);
