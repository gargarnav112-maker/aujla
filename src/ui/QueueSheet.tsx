import React from 'react';
import {F} from '../fonts';
import {C} from '../theme';
import {hexA} from '../motion';

/** "Playing Next" sheet chrome (material sheet with grabber and title). Rows are children. */
export const QueueSheet: React.FC<{y: number; children: React.ReactNode; nowPlaying: React.ReactNode}> = ({y, children, nowPlaying}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			right: 0,
			top: y,
			height: 1080,
			borderRadius: '40px 40px 0 0',
			background: 'rgba(28,28,30,0.94)',
			backdropFilter: 'blur(30px) saturate(180%)',
			boxShadow: `0 -20px 60px rgba(0,0,0,0.6), inset 0 1px 0 ${hexA('#ffffff', 0.08)}`,
			padding: '18px 64px 0',
		}}
	>
		<div style={{width: 72, height: 8, borderRadius: 4, background: '#5A5A5E', margin: '0 auto 26px'}} />
		{nowPlaying}
		<div style={{fontFamily: F.ui, fontSize: 38, fontWeight: 700, letterSpacing: '-0.01em', color: C.label, margin: '18px 0 6px'}}>Playing Next</div>
		<div style={{position: 'relative'}}>{children}</div>
	</div>
);
