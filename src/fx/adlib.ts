import {spring} from 'remotion';
import {secToFrame} from '../lib/time';
import {adlibFX, f60, springPop} from '../motion';

/** adlibFX state at `frame` for an ad-lib starting at `start` (seconds). */
export const adlibState = (frame: number, fps: number, start: number) => {
	const d = frame - secToFrame(start, fps);
	if (d < 0) return {visible: false, fx: 0, pop: 0, d};
	const fx = Math.max(0, 1 - d / f60(adlibFX.rgbFrames, fps));
	// 2-frame flicker on entry: on, off, on…
	const fl = f60(adlibFX.flickerFrames, fps);
	const visible = !(d >= fl / 2 && d < fl);
	const pop = spring({frame: d, fps, config: springPop});
	return {visible, fx, pop, d};
};
