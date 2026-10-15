import React from 'react';

// Generic glyphs built from primitives. No brand marks.
type G = {size?: number; color?: string; style?: React.CSSProperties};

export const Plane: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M21 15.5v-2l-8-5V3.6a1.6 1.6 0 0 0-3.2 0v4.9l-8 5v2l8-2.5v5.2l-2 1.5V21l3.6-1 3.6 1v-1.3l-2-1.5V13z" /></svg>
);
export const Wave: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
		<path d="M3 9.5a13 13 0 0 1 18 0" /><path d="M6.2 13a8.4 8.4 0 0 1 11.6 0" /><circle cx="12" cy="17" r="1.6" fill={color} stroke="none" />
	</svg>
);
export const Arrow: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M20.5 3.5 3.5 10.8l7 2.2 2.2 7z" /></svg>
);
export const Moon: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>
);
export const Bolt: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M13.5 2 4.5 13.5h6l-1 8.5 9-11.5h-6z" /></svg>
);
export const Battery: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
		<rect x="2.5" y="7" width="17" height="10" rx="2.5" /><rect x="5" y="9.5" width="6" height="5" rx="1" fill={color} stroke="none" /><path d="M21.5 10.5v3" strokeLinecap="round" />
	</svg>
);
export const Hourglass: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round">
		<path d="M6 3h12M6 21h12M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9" />
	</svg>
);
export const Headphones: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
		<path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4.5" height="7" rx="1.8" fill={color} /><rect x="16.5" y="14" width="4.5" height="7" rx="1.8" fill={color} />
	</svg>
);
export const Magnifier: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round">
		<circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" />
	</svg>
);
export const Chevron: React.FC<G> = ({size = 24, color = 'rgba(235,235,245,0.3)'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
);
export const Play: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M7 4.5v15l12.5-7.5z" /></svg>
);
export const Pause: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1.2" fill={color} /><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill={color} /></svg>
);
export const Lines: React.FC<G> = ({size = 32, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={2.4} strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
/** Generic side-profile car (no make): body, cabin, two wheels. */
export const Car: React.FC<G> = ({size = 48, color = '#1C1C1E'}) => (
	<svg width={size} height={size} viewBox="0 0 48 48">
		<path fill={color} d="M5 30.5c0-2.2 1.2-3.6 3.4-4.2l5.4-1.4 5-5.6c1-1.1 2.3-1.7 3.8-1.7h8.6c1.4 0 2.7.6 3.6 1.7l4 5 3.3.9c2 .6 3 2 3 4v3.3c0 1-.8 1.8-1.8 1.8H6.8c-1 0-1.8-.8-1.8-1.8z" />
		<path fill="#fff" opacity="0.9" d="M16.5 24.6 20.4 20.4c.6-.6 1.3-.9 2.1-.9h3.4v5.1zM28.2 19.5h3.6c.8 0 1.5.4 2 1l3.2 4.1h-8.8z" />
		<circle cx="14" cy="35" r="4.4" fill={color} stroke="#fff" strokeWidth="2.2" />
		<circle cx="35" cy="35" r="4.4" fill={color} stroke="#fff" strokeWidth="2.2" />
	</svg>
);
/** Generic location-pin glyph (end card mark). */
export const PinGlyph: React.FC<G> = ({size = 40, color = '#C7313B'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M12 2a7.5 7.5 0 0 0-7.5 7.5C4.5 15 12 22 12 22s7.5-7 7.5-12.5A7.5 7.5 0 0 0 12 2zm0 10.3a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z" /></svg>
);
