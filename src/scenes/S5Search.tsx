import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import cfg from '../data/config.json';
import assets from '../data/assets.json';
import {SearchField} from '../ui/SearchField';
import {ArtistTile, ResultRow, SkeletonRow} from '../ui/ResultRow';
import {QueueSheet} from '../ui/QueueSheet';
import {AdlibCard} from '../ui/AdlibCard';
import {EQ} from '../ui/NowPlaying';
import {Pause} from '../ui/glyphs';
import {S} from '../lib/schedule';
import {adlibText} from '../lib/lyrics';
import {beatIndexAt, beatTime, secToFrame, useAbsFrame} from '../lib/time';
import {clamp01, landSpring, springAt} from '../lib/anim';
import {f60, hexA, springPop, springSheet, whipOut} from '../motion';
import {adlibState} from '../fx/adlib';
import {Blur, useWhip} from '../fx/Whip';
import {F as FONT} from '../fonts';
import {C} from '../theme';

const ROW = 132;

const Inner: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const F = (t: number) => secToFrame(t, fps);
	const enter = useWhip(S.s5.start, 'enter', 'left');
	const name = cfg.manakArtist;
	const typed = S.s5.chars.filter((t) => F(t) <= frame).length;
	// cursor blinks on beats: lit for the first 8th of every beat
	const k = beatIndexAt(frame, fps);
	const cursor = typed < name.length ? true : frame - F(beatTime(k)) < F(S.e8);
	const neon = 0.75 + 0.25 * Math.exp(-(frame - F(S.s5.chars[Math.max(0, typed - 1)])) / f60(6, fps));
	const shimmer = ((frame / fps) * 1.6) % 1.6;
	const found = clamp01((typed - 2) / 2);
	// tap on the last character → now playing
	const dTap = frame - F(S.s5.tap);
	const ripple = dTap >= 0 && dTap < f60(26, fps) ? dTap / f60(26, fps) : -1;
	const mini = landSpring(frame, fps, S.s5.tap + S.e8, springPop) * (dTap >= 0 ? 1 : 0);
	// queue sheet (L6) and the Nipsey row lift → slide → lock on the 808
	// springSheet peaks in velocity ~4 frames in; pre-roll 3 frames so the peak sits on L6
	const sheet = springAt(frame + f60(3, fps), fps, S.s5.queue, springSheet);
	const lift = springAt(frame, fps, S.s5.queue + S.e8, springPop);
	const move = landSpring(frame, fps, S.s5.lock, {damping: 22, mass: 0.8, stiffness: 240});
	const locked = frame >= F(S.s5.lock);
	const settle = locked ? springAt(frame, fps, S.s5.lock, springPop) : 0;
	const liftAmt = clamp01(lift) * (1 - settle);
	const highlight = locked ? clamp01((frame - F(S.s5.lock)) / f60(4, fps) + 0.5) : 0;
	// ad-lib 2: skid in, tyre marks, smear
	const ad = adlibState(frame, fps, S.s5.adlib);
	const skid = interpolate(frame, [F(S.s5.adlib), F(S.s5.adlib) + f60(whipOut.frames, fps)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipOut.easing});
	const marks = clamp01((frame - F(S.s5.adlib)) / f60(5, fps));

	const nowPlayingRow = (
		<div style={{display: 'flex', alignItems: 'center', gap: 24, height: 112}}>
			<ArtistTile name={name} photo={assets.manakPhoto} size={84} round={false} />
			<div style={{flex: 1, fontFamily: FONT.ui}}>
				<div style={{fontSize: 36, fontWeight: 600, color: C.label}}>{name}</div>
				<div style={{fontSize: 26, fontWeight: 500, color: C.labelSecondary}}>{cfg.manakTrack || 'Now Playing'}</div>
			</div>
			<EQ height={34} barW={6} />
		</div>
	);

	return (
		<AbsoluteFill style={{backgroundColor: '#000', translate: `${enter.x}px 0px`}}>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${hexA(C.oxbloodDeep, 0.9)} 0%, rgba(0,0,0,0) 70%)`}} />
			<div style={{position: 'absolute', inset: 0, padding: '88px 64px 0', scale: String(1 - 0.04 * clamp01(sheet)), opacity: 1 - 0.45 * clamp01(sheet)}}>
				<div style={{fontFamily: FONT.ui, fontSize: 68, fontWeight: 700, letterSpacing: '-0.02em', color: C.label, marginBottom: 32}}>Search</div>
				<SearchField text={name.slice(0, typed)} cursor={cursor} neon={neon} />
				<div style={{fontFamily: FONT.ui, fontSize: 36, fontWeight: 700, color: C.label, margin: '44px 0 8px', opacity: found}}>Top Result</div>
				<div style={{position: 'relative'}}>
					{found > 0 ? (
						<div style={{opacity: found, translate: `0px ${(1 - found) * 20}px`}}>
							<ResultRow name={name} typed={typed} subtitle="Artist" photo={assets.manakPhoto} right={dTap >= 0 ? <EQ height={34} barW={6} /> : null} />
						</div>
					) : (
						<SkeletonRow shimmer={shimmer} />
					)}
					{ripple >= 0 ? (
						<div style={{position: 'absolute', left: 56, top: 66, width: 0, height: 0}}>
							<div style={{position: 'absolute', left: -900 * ripple, top: -900 * ripple, width: 1800 * ripple, height: 1800 * ripple, borderRadius: '50%', background: hexA('#ffffff', 0.14 * (1 - ripple))}} />
						</div>
					) : null}
					<SkeletonRow shimmer={(shimmer + 0.2) % 1.6} widths={[300, 160]} />
					<SkeletonRow shimmer={(shimmer + 0.4) % 1.6} widths={[420, 220]} />
					<SkeletonRow shimmer={(shimmer + 0.6) % 1.6} widths={[260, 180]} />
					<SkeletonRow shimmer={(shimmer + 0.8) % 1.6} widths={[380, 140]} />
				</div>
			</div>
			{/* mini player */}
			{mini > 0.001 && sheet < 0.999 ? (
				<div style={{position: 'absolute', left: 48, right: 48, bottom: 48, translate: `0px ${(1 - mini) * 180}px`, borderRadius: 28, background: C.row, padding: '0 28px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 20}}>
					<div style={{flex: 1}}>{nowPlayingRow}</div>
					<Pause size={44} />
				</div>
			) : null}
			{sheet > 0.001 ? (
				<QueueSheet y={1080 - (1080 - 170) * sheet} nowPlaying={nowPlayingRow}>
					{[0, 1, 2].map((i) => (
						<div key={i} style={{position: 'absolute', left: 0, right: 0, top: (i + move) * ROW}}>
							<SkeletonRow shimmer={(shimmer + i * 0.2) % 1.6} widths={[340 - i * 40, 180]} />
						</div>
					))}
					<div style={{position: 'absolute', left: 0, right: 0, top: 4 * ROW}}>
						<SkeletonRow shimmer={(shimmer + 0.7) % 1.6} widths={[280, 150]} />
					</div>
					<div
						style={{
							position: 'absolute',
							left: -16,
							right: -16,
							top: (3 - 3 * move) * ROW,
							padding: '0 16px',
							borderRadius: 22,
							background: liftAmt > 0.01 || highlight > 0 ? `color-mix(in srgb, ${C.row} ${100 - 12 * highlight}%, ${C.accentGlow})` : 'transparent',
							scale: String(1 + 0.04 * liftAmt),
							boxShadow: `0 ${20 * liftAmt}px ${50 * liftAmt}px rgba(0,0,0,${0.6 * liftAmt})`,
							zIndex: 2,
						}}
					>
						<ResultRow name={cfg.nipseyArtist} typed={cfg.nipseyArtist.length} subtitle={cfg.nipseyTrack || 'Artist'} photo={assets.nipseyPhoto} highlight={highlight} />
					</div>
				</QueueSheet>
			) : null}
			{ad.d >= 0 ? (
				<>
					<AbsoluteFill style={{backgroundColor: '#000', opacity: 0.45}} />
					<svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
						<defs>
							<filter id="smearf" x="-10%" y="-200%" width="120%" height="500%">
								<feGaussianBlur stdDeviation="40 6" />
							</filter>
						</defs>
						<rect x={-100} y={610} width={1300 * marks} height={190} fill={hexA(C.parchment, 0.42)} filter="url(#smearf)" />
						<rect x={-100} y={655} width={1300 * marks} height={100} fill={hexA(C.accentGlow, 0.35)} filter="url(#smearf)" />
						{[0, 1].map((i) => (
							<path
								key={i}
								d={`M -40 ${668 + i * 74} C 300 ${660 + i * 78}, 700 ${684 + i * 70}, 1120 ${668 + i * 72}`}
								stroke="#0b0b0c"
								strokeWidth={26}
								strokeDasharray="7 5"
								fill="none"
								pathLength={1}
								strokeDashoffset={0}
								style={{clipPath: `inset(0 ${(1 - marks) * 100}% 0 0)`}}
								opacity={0.92}
							/>
						))}
					</svg>
					<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', translate: `${-1100 * skid}px ${-40}px`, rotate: `${-8 * skid + 3}deg`}}>
						<AdlibCard text={adlibText(2)} fx={Math.max(ad.fx, skid)} visible={ad.visible} rotate={3} />
					</AbsoluteFill>
				</>
			) : null}
		</AbsoluteFill>
	);
};

export const S5Search: React.FC = () => {
	const enter = useWhip(S.s5.start, 'enter', 'left');
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const a = secToFrame(S.s5.adlib, fps);
	return (
		<Blur active={enter.active || (frame >= a && frame < a + f60(whipOut.frames, fps))}>
			<Inner />
		</Blur>
	);
};
