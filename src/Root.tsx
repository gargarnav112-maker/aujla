import React from 'react';
import {Composition} from 'remotion';
import {SyncProof} from './SyncProof';
import {S} from './lib/schedule';
import './fonts';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="SyncProof"
			component={SyncProof}
			width={540}
			height={540}
			fps={30}
			durationInFrames={Math.round(S.audioEnd * 30)}
		/>
	</>
);
