// Palette sampled from the EP cover (see docs/BUILD_LOG.md).
export const C = {
	oxblood: '#672026',
	oxbloodHi: '#803237',
	oxbloodDeep: '#391514',
	accentGlow: '#C7313B',
	slate: '#4E565C',
	slateDeep: '#3B3E42',
	bone: '#8B7F7A',
	parchment: '#CBB5A4',
	panel: '#32393A',
	earth: '#392B24',
	// iOS dark-mode surfaces
	card: '#1C1C1E',
	row: '#2C2C2E',
	separator: '#38383A',
	label: '#F2F2F7',
	labelSecondary: 'rgba(235,235,245,0.6)',
	labelTertiary: 'rgba(235,235,245,0.3)',
	bubbleBlue: '#0A84FF',
	black: '#000000',
	white: '#FFFFFF',
	// liquid (Scene 4)
	amber: '#B5651D',
	amberHi: '#E39A3B',
	// plate (Scene 6)
	plateBlue: '#1F4FA8',
} as const;

export const R = {
	sm: 14,
	md: 22,
	lg: 28,
	pill: 999,
} as const;

// Material sheet: 30 px backdrop blur at 180 % saturation.
export const material = (tint = 'rgba(28,28,30,0.72)') => ({
	backgroundColor: tint,
	backdropFilter: 'blur(30px) saturate(180%)',
	WebkitBackdropFilter: 'blur(30px) saturate(180%)',
});

export const STAGE = 1080;
export const SAFE = 64; // min margin on the 1:1 stage
