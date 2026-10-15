import React, {useId} from 'react';

/**
 * RGB split + horizontal smear as one SVG filter applied to HTML content.
 * split: channel offset in px; smear: horizontal blur in px.
 */
export const RGBSplit: React.FC<{split: number; smear?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	split,
	smear = 0,
	children,
	style,
}) => {
	const id = useId().replace(/:/g, '');
	if (split < 0.05 && smear < 0.05) return <div style={style}>{children}</div>;
	return (
		<div style={{...style, filter: `url(#rgb${id})`}}>
			<svg width="0" height="0" style={{position: 'absolute'}}>
				<filter id={`rgb${id}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
					<feGaussianBlur in="SourceGraphic" stdDeviation={`${smear / 2} 0`} result="s" />
					<feColorMatrix in="s" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
					<feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
					<feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
					<feOffset in="r" dx={-split} result="ro" />
					<feOffset in="b" dx={split} result="bo" />
					<feBlend in="ro" in2="g" mode="screen" result="rg" />
					<feBlend in="rg" in2="bo" mode="screen" />
				</filter>
			</svg>
			{children}
		</div>
	);
};
