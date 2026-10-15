import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {SettingsList, type Row} from '../ui/SettingsList';
import {AdlibCard} from '../ui/AdlibCard';
import {OutlineCard} from '../ui/OutlineCard';
import {Arrow, Battery, Bolt, Hourglass, Moon, Plane, Wave} from '../ui/glyphs';
import {S} from '../lib/schedule';
import {heroWord, adlibText} from '../lib/lyrics';
import {secToFrame, useAbsFrame} from '../lib/time';
import {landSpring, springAt} from '../lib/anim';
import {f60, springPop, springSlam, whipIn, whipOut} from '../motion';
import {adlibState} from '../fx/adlib';
import {Blur, useWhip} from '../fx/Whip';
import {C} from '../theme';

const Inner: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const F = (t: number) => secToFrame(t, fps);
	// phase A: the Punjab card snaps to full frame on the slam
	const snap = springAt(frame, fps, S.s3.slam, springSlam);
	const e8F = F(S.s3.slam + S.e8);
	const aOut = interpolate(frame, [e8F - f60(whipIn.frames, fps), e8F], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipIn.easing});
	// phase B: settings list decelerates in from below
	const bIn = interpolate(frame, [e8F, e8F + f60(whipOut.frames, fps)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: whipOut.easing});
	const showList = frame >= e8F;
	const exit = useWhip(S.s3.end, 'exit', 'left');

	const rowAt = (i: number) => landSpring(frame, fps, S.s3.rowsFrom + i * S.e8, springPop);
	const on = landSpring(frame, fps, S.s3.toggle, springPop);
	const dT = frame - F(S.s3.toggle);
	const bloom = dT < 0 ? 0 : 0.45 + 0.55 * Math.exp(-dT / f60(14, fps));
	const ad = adlibState(frame, fps, S.s3.adlib);
	const dim = ad.d >= 0 ? 0.55 : 0;

	const ic = (n: React.ReactNode) => n;
	const groups: Row[][] = [
		[
			{label: 'Airplane Mode', icon: ic(<Plane size={36} />), tint: '#B5651D', kind: 'toggle', on: 0, appear: rowAt(0)},
			{label: 'Wi-Fi', icon: ic(<Wave size={36} />), tint: C.slate, kind: 'chevron', value: 'Off', appear: rowAt(1)},
			{label: 'Location', icon: ic(<Arrow size={34} />), tint: '#5D6B70', kind: 'chevron', value: 'Always', appear: rowAt(2)},
		],
		[
			{label: 'Focus', icon: ic(<Moon size={34} />), tint: '#6B5546', kind: 'chevron', appear: rowAt(3)},
			{label: heroWord('L2'), icon: ic(<Bolt size={36} />), tint: C.accentGlow, kind: 'toggle', on, glow: bloom, appear: rowAt(4), capitalize: true},
			{label: 'Low Power Mode', icon: ic(<Battery size={36} />), tint: C.bone, kind: 'toggle', on: 0, appear: rowAt(5)},
			{label: 'Screen Time', icon: ic(<Hourglass size={34} />), tint: C.oxbloodHi, kind: 'chevron', appear: rowAt(6)},
		],
	];

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{!showList ? (
				<AbsoluteFill style={{translate: `0px ${-1200 * aOut}px`}}>
					<AbsoluteFill style={{scale: String(1 + 1.25 * snap)}}>
						<OutlineCard from={[540, 540]} draw={1} morph={1} card={1} />
					</AbsoluteFill>
				</AbsoluteFill>
			) : (
				<AbsoluteFill style={{translate: `${exit.x}px ${700 * bIn}px`}}>
					<AbsoluteFill style={{opacity: 1 - dim, scale: String(1 - 0.03 * (ad.d >= 0 ? 1 : 0))}}>
						<SettingsList title="Settings" groups={groups} />
					</AbsoluteFill>
				</AbsoluteFill>
			)}
			{ad.d >= 0 ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', translate: `${exit.x}px 0px`, scale: String(0.6 + 0.4 * ad.pop)}}>
					<AdlibCard text={adlibText(1)} fx={ad.fx} visible={ad.visible} />
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

export const S3Settings: React.FC = () => {
	const frame = useAbsFrame();
	const {fps} = useVideoConfig();
	const exit = useWhip(S.s3.end, 'exit', 'left');
	const e8F = secToFrame(S.s3.slam + S.e8, fps);
	const blurOn = (frame >= e8F - f60(whipIn.frames, fps) - 1 && frame < e8F + f60(whipOut.frames, fps)) || exit.active;
	return (
		<Blur active={blurOn}>
			<Inner />
		</Blur>
	);
};
