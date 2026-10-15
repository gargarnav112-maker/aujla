import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {Stage} from './Stage';
import {Grain} from './fx/Grain';

const AudioTrack: React.FC = () => <Audio src={staticFile('audio/straight-up-full.wav')} />;

export const Main1x1: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		<Stage />
		<AudioTrack />
	</AbsoluteFill>
);

/** 1080×1920: the 1:1 stage centred on blurred, darkened, grained art. */
export const Main9x16: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img
				src={staticFile('img/art-wide.png')}
				style={{position: 'absolute', height: '100%', left: '50%', translate: '-50% 0', filter: 'blur(60px) brightness(0.45)', scale: '1.15'}}
			/>
		</AbsoluteFill>
		<Grain opacity={0.05} id="grain-bg" />
		<div style={{position: 'absolute', left: 0, top: (1920 - 1080) / 2, width: 1080, height: 1080, overflow: 'hidden', boxShadow: '0 30px 120px rgba(0,0,0,0.6)'}}>
			<Stage />
		</div>
		<AudioTrack />
	</AbsoluteFill>
);
