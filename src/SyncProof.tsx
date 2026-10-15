import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import timing from './data/lyrics-timing.json';
import {BEATS, beatIndexAt, beatPulse, framesSince, secToFrame} from './lib/time';
import {S} from './lib/schedule';
import {LYRICS, heroWord} from './lib/lyrics';
import {F} from './fonts';
import {C} from './theme';

/** 540×540 @30: line labels, hero markers, beat flashes, 808 rings, dropout shading. */
export const SyncProof: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width} = useVideoConfig();
	const t = frame / fps;
	const k = beatIndexAt(frame, fps);
	const flash = beatPulse(frame, fps, 4);
	const acc = framesSince(frame, fps, BEATS.accents808);
	const ring = Number.isFinite(acc) && acc < fps * 0.35 ? acc / (fps * 0.35) : null;
	const on = (a: number, b: number) => frame >= secToFrame(a, fps) && frame < secToFrame(b, fps);
	const inDrop = BEATS.dropouts.some((d) => on(d.start, d.end));
	const line = timing.lines.find((l) => on(l.start, l.end));
	const lyr = line ? LYRICS.find((x) => x.id === line.id) : null;
	const adlib = timing.adlibs.find((a) => on(a.start, a.end));
	const heroT = (id: string) => {
		const l = timing.lines.find((x) => x.id === id)!;
		if (l.heroWordTime != null) return {t: l.heroWordTime, measured: true};
		// fallbacks used by the edit (see src/lib/schedule.ts)
		const fb: Record<string, number> = {L2: S.s3.toggle, L4: S.s4.brim, L7: S.s6.lastLock};
		return fb[id] != null ? {t: fb[id], measured: false} : null;
	};
	const heroes = timing.lines
		.filter((l) => l.heroWordIndex != null)
		.map((l) => ({id: l.id, word: heroWord(l.id), ...heroT(l.id)}))
		.filter((h) => h.t != null) as {id: string; word: string; t: number; measured: boolean}[];
	const activeHero = heroes.find((h) => {
		const d = frame - secToFrame(h.t, fps);
		return d >= 0 && d < fps * 0.6;
	});
	const lineFrames = line ? frame - secToFrame(line.start, fps) : 99;

	return (
		<AbsoluteFill style={{backgroundColor: '#0b0b0c', fontFamily: F.ui, color: '#fff'}}>
			<Audio src={staticFile('audio/straight-up-full.wav')} />
			{inDrop ? <AbsoluteFill style={{backgroundColor: '#3a3a3a'}} /> : null}
			<AbsoluteFill style={{backgroundColor: '#fff', opacity: flash * 0.22}} />
			{ring != null ? (
				<div
					style={{
						position: 'absolute',
						left: width / 2 - 200 * (0.6 + ring),
						top: 250 - 200 * (0.6 + ring),
						width: 400 * (0.6 + ring),
						height: 400 * (0.6 + ring),
						borderRadius: '50%',
						border: `${10 * (1 - ring) + 2}px solid ${C.accentGlow}`,
						opacity: 1 - ring,
					}}
				/>
			) : null}
			<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center'}}>
				<div style={{fontSize: 190, fontWeight: 900, lineHeight: 1, scale: String(lineFrames < 4 ? 1.15 - lineFrames * 0.04 : 1), color: lineFrames < 3 ? C.accentGlow : '#fff'}}>
					{line ? line.id : inDrop ? 'DROP' : ''}
				</div>
				<div style={{fontSize: 22, fontWeight: 600, opacity: 0.8, marginTop: 14, padding: '0 30px'}}>{lyr?.text ?? ''}</div>
			</div>
			{adlib ? (
				<div style={{position: 'absolute', top: 30, right: 30, background: C.accentGlow, padding: '6px 14px', borderRadius: 10, fontWeight: 900, fontSize: 26}}>
					{adlib.id}
				</div>
			) : null}
			{activeHero ? (
				<div style={{position: 'absolute', top: 368, width: '100%', textAlign: 'center'}}>
					<span style={{background: activeHero.measured ? '#0A84FF' : '#555', padding: '6px 16px', borderRadius: 12, fontSize: 30, fontWeight: 800}}>
						◆ {activeHero.word} {activeHero.measured ? '' : '(fallback)'}
					</span>
				</div>
			) : null}
			{/* timeline strip */}
			<div style={{position: 'absolute', left: 20, right: 20, bottom: 70, height: 36}}>
				{BEATS.beats.map((b, i) => (
					<div key={i} style={{position: 'absolute', left: `${(b / S.audioEnd) * 100}%`, width: 2, height: BEATS.barBeats.includes(i) ? 36 : 16, bottom: 0, background: i <= k ? '#fff' : '#555'}} />
				))}
				{BEATS.dropouts.map((d, i) => (
					<div key={i} style={{position: 'absolute', left: `${(d.start / S.audioEnd) * 100}%`, width: `${((d.end - d.start) / S.audioEnd) * 100}%`, height: 36, background: 'rgba(255,255,255,0.15)'}} />
				))}
				<div style={{position: 'absolute', left: `${(t / S.audioEnd) * 100}%`, width: 3, height: 50, bottom: -7, background: C.accentGlow}} />
			</div>
			<div style={{position: 'absolute', left: 20, bottom: 24, fontFamily: F.mono, fontSize: 22, opacity: 0.85}}>
				{t.toFixed(3)}s · f{frame} · beat {k} · {BEATS.bpm} BPM
			</div>
		</AbsoluteFill>
	);
};
