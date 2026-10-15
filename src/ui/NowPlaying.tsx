import React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';
import cfg from '../data/config.json';
import {F} from '../fonts';
import {C} from '../theme';
import {useAbsFrame} from '../lib/time';

/** Five equaliser bars driven by the real audio spectrum. */
export const EQ: React.FC<{color?: string; height?: number; barW?: number}> = ({color = C.accentGlow, height = 28, barW = 5}) => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
		src: staticFile('audio/straight-up-full.wav'),
		frame: Math.floor(frame),
		fps,
		windowInSeconds: 10,
	});
	let vals = [0.3, 0.5, 0.4, 0.6, 0.35];
	if (audioData) {
		const f = visualizeAudio({fps, frame: Math.floor(frame), audioData, numberOfSamples: 64, optimizeFor: 'speed', dataOffsetInSeconds});
		const bands = [[0, 2], [2, 5], [5, 10], [10, 20], [20, 40]];
		vals = bands.map(([a, b]) => {
			const v = f.slice(a, b).reduce((s, x) => s + x, 0) / (b - a);
			const db = 20 * Math.log10(Math.max(v, 1e-5));
			return Math.min(1, Math.max(0.12, (db + 62) / 44));
		});
	}
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: barW * 0.7, height}}>
			{vals.map((v, i) => (
				<div key={i} style={{width: barW, height: height * v, borderRadius: barW, backgroundColor: color}} />
			))}
		</div>
	);
};

/** Live-activity content: cover thumbnail, title, artist, EQ. `p` = expansion 0..1. */
export const NowPlaying: React.FC<{p: number; scale?: number}> = ({p, scale = 1}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 16 * scale, width: '100%', height: '100%', padding: `0 ${22 * scale}px 0 ${14 * scale}px`, opacity: Math.min(1, Math.max(0, (p - 0.35) / 0.4))}}>
		<Img src={staticFile('img/cover.jpg')} style={{width: 58 * scale, height: 58 * scale, borderRadius: 14 * scale, objectFit: 'cover', flexShrink: 0}} />
		<div style={{flex: 1, minWidth: 0, fontFamily: F.ui, letterSpacing: '-0.01em'}}>
			<div style={{fontSize: 22 * scale, fontWeight: 700, color: C.label, whiteSpace: 'nowrap'}}>{cfg.songTitle}</div>
			<div style={{fontSize: 18 * scale, fontWeight: 500, color: C.labelSecondary, whiteSpace: 'nowrap'}}>{cfg.artist}</div>
		</div>
		<EQ height={30 * scale} barW={5 * scale} />
	</div>
);
