import { converter, formatHex } from 'culori';
import { convertColorValue } from '@adobe/leonardo-contrast-colors';

// ── Converters ──────────────────────────────────────────────

const toOklch = converter('oklch');
const toLch = converter('lch');
const toHsl = converter('hsl');
const toHsv = converter('hsv');
const toLab = converter('lab');
const toOklab = converter('oklab');

// ── Types ───────────────────────────────────────────────────

export type ColorSpaceId = 'oklch' | 'oklab' | 'lch' | 'lab' | 'hsl' | 'hsv' | 'cam02p';

export interface ChannelDef {
	key: string;
	label: string;
	min: number;
	max: number;
}

export interface ColorSpaceConfig {
	id: ColorSpaceId;
	label: string;
	/** The 3 channels for interpolation charts, in display order. */
	channels: [ChannelDef, ChannelDef, ChannelDef];
	/** Extract channel values from a hex color. Returns [c1, c2, c3] matching `channels`. */
	extract(hex: string): [number, number, number];
	/**
	 * Which polar wheel mode to use for this space.
	 * LAB→LCH, OKLAB→OKLCH, etc. `null` if the space IS a wheel mode.
	 */
	wheelFallback: ColorSpaceId | null;
}

/**
 * Config for rendering the color wheel canvas gradient.
 * Only polar color spaces have a wheel renderer.
 */
export interface WheelRenderer {
	/** Maximum chroma/saturation for gradient edge. */
	maxChroma: number;
	/** Convert lightness slider (0–100) to the color space's lightness unit. */
	lightnessFromPercent(pct: number): number;
	/** Create gradient stop hex colors for a given hue and lightness. */
	gradientStops(hue: number, lightness: number): string[];
	/** Extract polar coordinates {h: 0–360, c: 0–100 normalized} from a hex color. */
	extractPolar(hex: string): { h: number; c: number };
}

// ── Helpers ─────────────────────────────────────────────────

function nan0(v: number | undefined): number {
	return v != null && !Number.isNaN(v) ? v : 0;
}

function hexSafe(color: Record<string, unknown>): string {
	return formatHex(color as unknown as Parameters<typeof formatHex>[0]) ?? '#000000';
}

const STOP_COUNT = 17;

function linspace(min: number, max: number, n: number): number[] {
	const out: number[] = [];
	for (let i = 0; i < n; i++) out.push(min + (max - min) * (i / (n - 1)));
	return out;
}

function makeStops(
	mode: string,
	build: (chroma: number) => Record<string, unknown>,
	max: number
): string[] {
	return linspace(0, max, STOP_COUNT).map((c) => hexSafe({ mode, ...build(c) }));
}

// ── Wheel renderers (polar spaces only) ─────────────────────

export const WHEEL_RENDERERS: Partial<Record<ColorSpaceId, WheelRenderer>> = {
	cam02p: {
		maxChroma: 120,
		lightnessFromPercent: (pct) => pct,
		gradientStops(hue, l) {
			return makeStops('lch', (c) => ({ l, c, h: hue }), 100);
		},
		extractPolar(hex) {
			const c = convertColorValue(hex, 'CAM02p', true) as {
				J: number;
				C: number;
				h: number;
			};
			return { h: nan0(c.h), c: (nan0(c.C) / 120) * 100 };
		}
	},
	oklch: {
		maxChroma: 0.322,
		lightnessFromPercent: (pct) => pct / 100,
		gradientStops(hue, l) {
			return makeStops('oklch', (c) => ({ l, c, h: hue }), 0.322);
		},
		extractPolar(hex) {
			const c = toOklch(hex);
			return { h: nan0(c?.h), c: (nan0(c?.c) / 0.322) * 100 };
		}
	},
	lch: {
		maxChroma: 100,
		lightnessFromPercent: (pct) => pct,
		gradientStops(hue, l) {
			return makeStops('lch', (c) => ({ l, c, h: hue }), 100);
		},
		extractPolar(hex) {
			const c = toLch(hex);
			return { h: nan0(c?.h), c: nan0(c?.c) };
		}
	},
	hsl: {
		maxChroma: 1,
		lightnessFromPercent: (pct) => pct / 100,
		gradientStops(hue, l) {
			return makeStops('hsl', (s) => ({ h: hue, s, l }), 1);
		},
		extractPolar(hex) {
			const c = toHsl(hex);
			return { h: nan0(c?.h), c: nan0(c?.s) * 100 };
		}
	},
	hsv: {
		maxChroma: 1,
		lightnessFromPercent: (pct) => pct / 100,
		gradientStops(hue, l) {
			return makeStops('hsv', (s) => ({ h: hue, s, v: l }), 1);
		},
		extractPolar(hex) {
			const c = toHsv(hex);
			return { h: nan0(c?.h), c: nan0(c?.s) * 100 };
		}
	}
};

// ── Color space configs ─────────────────────────────────────

export const COLOR_SPACES: Record<ColorSpaceId, ColorSpaceConfig> = {
	oklch: {
		id: 'oklch',
		label: 'OKLCH',
		channels: [
			{ key: 'h', label: 'Hue', min: 0, max: 360 },
			{ key: 'c', label: 'Chroma', min: 0, max: 0.4 },
			{ key: 'l', label: 'Lightness', min: 0, max: 1 }
		],
		extract(hex) {
			const c = toOklch(hex);
			return [nan0(c?.h), nan0(c?.c), nan0(c?.l)];
		},
		wheelFallback: null
	},
	oklab: {
		id: 'oklab',
		label: 'OKLAB',
		channels: [
			{ key: 'a', label: 'a (red–green)', min: -0.4, max: 0.4 },
			{ key: 'b', label: 'b (blue–yellow)', min: -0.4, max: 0.4 },
			{ key: 'l', label: 'Lightness', min: 0, max: 1 }
		],
		extract(hex) {
			const c = toOklab(hex);
			return [nan0(c?.a), nan0(c?.b), nan0(c?.l)];
		},
		wheelFallback: 'oklch'
	},
	lch: {
		id: 'lch',
		label: 'LCH',
		channels: [
			{ key: 'h', label: 'Hue', min: 0, max: 360 },
			{ key: 'c', label: 'Chroma', min: 0, max: 150 },
			{ key: 'l', label: 'Lightness', min: 0, max: 100 }
		],
		extract(hex) {
			const c = toLch(hex);
			return [nan0(c?.h), nan0(c?.c), nan0(c?.l)];
		},
		wheelFallback: null
	},
	lab: {
		id: 'lab',
		label: 'LAB',
		channels: [
			{ key: 'a', label: 'a (red–green)', min: -128, max: 127 },
			{ key: 'b', label: 'b (blue–yellow)', min: -128, max: 127 },
			{ key: 'l', label: 'Lightness', min: 0, max: 100 }
		],
		extract(hex) {
			const c = toLab(hex);
			return [nan0(c?.a), nan0(c?.b), nan0(c?.l)];
		},
		wheelFallback: 'lch'
	},
	hsl: {
		id: 'hsl',
		label: 'HSL',
		channels: [
			{ key: 'h', label: 'Hue', min: 0, max: 360 },
			{ key: 's', label: 'Saturation', min: 0, max: 1 },
			{ key: 'l', label: 'Lightness', min: 0, max: 1 }
		],
		extract(hex) {
			const c = toHsl(hex);
			return [nan0(c?.h), nan0(c?.s), nan0(c?.l)];
		},
		wheelFallback: null
	},
	hsv: {
		id: 'hsv',
		label: 'HSV',
		channels: [
			{ key: 'h', label: 'Hue', min: 0, max: 360 },
			{ key: 's', label: 'Saturation', min: 0, max: 1 },
			{ key: 'v', label: 'Value', min: 0, max: 1 }
		],
		extract(hex) {
			const c = toHsv(hex);
			return [nan0(c?.h), nan0(c?.s), nan0(c?.v)];
		},
		wheelFallback: null
	},
	cam02p: {
		id: 'cam02p',
		label: 'CAM02p',
		channels: [
			{ key: 'h', label: 'Hue', min: 0, max: 360 },
			{ key: 'C', label: 'Chroma', min: 0, max: 120 },
			{ key: 'J', label: 'Lightness', min: 0, max: 100 }
		],
		extract(hex) {
			const c = convertColorValue(hex, 'CAM02p', true) as {
				J: number;
				C: number;
				h: number;
			};
			return [nan0(c.h), nan0(c.C), nan0(c.J)];
		},
		wheelFallback: null
	}
};

/** All color space IDs in display order. */
export const COLOR_SPACE_IDS: ColorSpaceId[] = [
	'oklch',
	'oklab',
	'lch',
	'lab',
	'hsl',
	'hsv',
	'cam02p'
];

/**
 * Resolve which wheel renderer to use for a given color space.
 * Falls back to the polar equivalent for cartesian spaces.
 */
export function getWheelRenderer(id: ColorSpaceId): WheelRenderer {
	const config = COLOR_SPACES[id];
	const wheelId = config.wheelFallback ?? id;
	return WHEEL_RENDERERS[wheelId]!;
}
