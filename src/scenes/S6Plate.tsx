import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import cfg from '../data/config.json';
import {NumberPlate} from '../ui/NumberPlate';
import {S} from '../lib/schedule';
import {secToFrame, useAbsFrame} from '../lib/time';
import {clamp01, landSpring} from '../lib/anim';
import {f60, hexA, springSlam} from '../motion';
import {C} from '../theme';

/** Scene 6: plate slams in on L7; columns roll like an odometer and lock on the grid. */
export const S6Plate: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const F = (t: number) => secToFrame(t, fps);
	const slam = landSpring(frame, fps, S.s6.slam, springSlam);
	const bgOn = frame >= F(S.s6.slam);
	const cols = cfg.plateText.replace(/\s/g, '').length;
	const rolls: number[] = [];
	const blurs: number[] = [];
	for (let i = 0; i < cols; i++) {
		const lock = F(S.s6.locks[i]);
		const d = lock - frame; // frames until this column locks
		if (d > 0) {
			// fast roll that decelerates into the lock
			const speed = 0.55 * Math.min(1, d / f60(10, fps)) + 0.12;
			rolls.push(d * speed);
			blurs.push(Math.min(10, speed * 14));
		} else {
			const a = -d;
			rolls.push(-0.18 * Math.exp(-a / f60(4, fps)) * Math.cos(a / f60(2.2, fps)));
			blurs.push(0);
		}
	}
	const glint = clamp01((frame - F(S.s6.lastLock) - f60(1, fps)) / f60(18, fps));
	const hold = Math.max(0, frame - F(S.s6.slam)) / fps;
	return (
		<AbsoluteFill>
			{bgOn ? (
				<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${C.panel} 0%, #121415 60%, #050505 100%)`}}>
					<AbsoluteFill style={{background: `radial-gradient(ellipse 60% 18% at 50% 64%, ${hexA(C.accentGlow, 0.18)} 0%, rgba(0,0,0,0) 70%)`}} />
				</AbsoluteFill>
			) : null}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1600}}>
				<div
					style={{
						opacity: clamp01(slam * 3),
						scale: String((1.9 - 0.9 * slam) * (1 + 0.006 * hold)),
						rotate: `x ${(1 - slam) * 28}deg`,
						filter: slam < 0.85 ? `blur(${(1 - slam) * 8}px)` : undefined,
					}}
				>
					<NumberPlate text={cfg.plateText} rolls={rolls} blurs={blurs} glint={glint} />
				</div>
			</AbsoluteFill>
			{/* plate shadow on the ground plane */}
			{bgOn ? <div style={{position: 'absolute', left: 140, right: 140, top: 680, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', filter: 'blur(20px)', opacity: interpolate(slam, [0, 1], [0, 1])}} /> : null}
		</AbsoluteFill>
	);
};
