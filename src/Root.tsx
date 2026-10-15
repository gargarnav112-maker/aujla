import React from 'react';
import {Composition, type CalculateMetadataFunction} from 'remotion';
import {Main1x1, Main9x16} from './Main';
import {SyncProof} from './SyncProof';
import {S} from './lib/schedule';
import './fonts';

// Duration = audio clip + tail + end card (from beats.json / config.json).
const byDuration: CalculateMetadataFunction<Record<string, unknown>> = async ({compositionId}) => ({
	durationInFrames: Math.round(S.end * (compositionId.endsWith('At30') ? 30 : 60)),
});
const proofDuration: CalculateMetadataFunction<Record<string, unknown>> = async () => ({
	durationInFrames: Math.round(S.audioEnd * 30),
});

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="Main1x1" component={Main1x1} width={1080} height={1080} fps={60} durationInFrames={1200} calculateMetadata={byDuration} />
		<Composition id="Main9x16" component={Main9x16} width={1080} height={1920} fps={60} durationInFrames={1200} calculateMetadata={byDuration} />
		<Composition id="Main1x1At30" component={Main1x1} width={1080} height={1080} fps={30} durationInFrames={600} calculateMetadata={byDuration} />
		<Composition id="SyncProof" component={SyncProof} width={540} height={540} fps={30} durationInFrames={564} calculateMetadata={proofDuration} />
	</>
);
