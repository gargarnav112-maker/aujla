import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {Device, Island, LockScreen, PHONE} from '../ui/Device';
import {NowPlaying} from '../ui/NowPlaying';
import {Headphones} from '../ui/glyphs';
import {S} from '../lib/schedule';
import {secToFrame, useAbsFrame} from '../lib/time';
import {landSpring, springAt} from '../lib/anim';
import {f60, hexA, springPop, springSlam, whipIn} from '../motion';
import {Blur} from '../fx/Whip';
import {C} from '../theme';
import {F} from '../fonts';
import cfg from '../data/config.json';

// Thumbnail centre in stage coords (phone centred; island expanded) — the push-through target.
const THUMB = {x: 540 - 196 + 14 + 29, y: 540 - PHONE.h / 2 + 13 + 12 + 42};

const Inner: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const land = landSpring(frame, fps, S.s0.phoneLand, springSlam);
	const startF = secToFrame(S.s0.phoneLand, fps) - f60(10, fps);
	const visible = interpolate(frame, [startF, startF + f60(3, fps)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const island = springAt(frame, fps, S.s0.island, springPop);
	const pill = springAt(frame, fps, S.s0.pill, springPop);
	const washD = frame - secToFrame(S.s0.pill, fps);
	const wash = washD >= 0 ? Math.exp(-washD / f60(14, fps)) : 0;
	// push through the thumbnail into the map (whipIn, ends on the 808 entry)
	const cut = secToFrame(S.s1.start, fps);
	const push = interpolate(frame, [cut - f60(whipIn.frames, fps), cut], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipIn.easing});
	const zoom = Math.exp(push * Math.log(16));

	return (
		<AbsoluteFill style={{backgroundColor: '#000', perspective: 2200}}>
			<AbsoluteFill style={{transformOrigin: `${THUMB.x}px ${THUMB.y}px`, scale: String(zoom), filter: push > 0 ? `blur(${(push * 14).toFixed(2)}px) brightness(${1 + push * 0.6})` : undefined}}>
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<div
						style={{
							opacity: visible,
							transformStyle: 'preserve-3d',
							rotate: `y ${70 * (1 - land)}deg`,
							scale: String(0.86 + 0.14 * land),
							translate: `${(1 - land) * 180}px 0px`,
						}}
					>
						<Device sheen={frame < secToFrame(S.s0.phoneLand, fps) ? Math.max(0, 1 - land) : 0}>
							<LockScreen progress={Math.min(1, (165 + frame / fps) / cfg.trackSeconds)} />
							{/* red wash when the headphones connect */}
							<AbsoluteFill style={{background: `radial-gradient(ellipse 90% 45% at 50% 0%, ${hexA(C.accentGlow, 0.55 * wash)} 0%, rgba(0,0,0,0) 70%)`}} />
							<Island p={island}>
								<NowPlaying p={island} />
							</Island>
							<div
								style={{
									position: 'absolute',
									top: 116,
									left: '50%',
									translate: '-50% 0',
									scale: String(0.4 + 0.6 * pill),
									opacity: Math.min(1, pill * 2),
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									padding: '10px 22px 10px 10px',
									borderRadius: 999,
									background: `linear-gradient(180deg, #E0434D, ${C.accentGlow})`,
									boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 36px ${hexA(C.accentGlow, 0.5 * pill)}`,
									fontFamily: F.ui,
									whiteSpace: 'nowrap',
								}}
							>
								<div style={{width: 44, height: 44, borderRadius: 22, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Headphones size={26} />
								</div>
								<div style={{fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em'}}>Connected</div>
							</div>
						</Device>
					</div>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const S0ColdOpen: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const cut = secToFrame(S.s1.start, fps);
	return (
		<Blur active={frame >= cut - f60(whipIn.frames, fps) - 1}>
			<Inner />
		</Blur>
	);
};
