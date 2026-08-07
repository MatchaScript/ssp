import { converter } from 'culori';
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
 * How the color wheel draws and reads a polar color space.
 * Cartesian spaces borrow their polar equivalent's renderer.
 */
export interface WheelRenderer {
	/** Chroma/saturation at the wheel's rim, in the space's own unit. */
	maxChroma: number;
	/** Branch index for the wheel fragment shader's `u_colorSpace` switch. */
	shaderIndex: number;
	/** Polar coordinates from a hex color: hue in degrees, chroma as 0–100 of the rim. */
	extractPolar(hex: string): { h: number; c: number };
}

// ── Helpers ─────────────────────────────────────────────────

function nan0(v: number | undefined): number {
	return v != null && !Number.isNaN(v) ? v : 0;
}

function toCam02p(hex: string): { J: number; C: number; h: number } {
	return convertColorValue(hex, 'CAM02p', true) as { J: number; C: number; h: number };
}

/**
 * Build a renderer that normalises chroma against the rim, so each space only
 * has to say how to read its own hue and chroma.
 */
function wheelRenderer(
	shaderIndex: number,
	maxChroma: number,
	polar: (hex: string) => { h?: number; c?: number }
): WheelRenderer {
	return {
		shaderIndex,
		maxChroma,
		extractPolar(hex) {
			const { h, c } = polar(hex);
			return { h: nan0(h), c: (nan0(c) / maxChroma) * 100 };
		}
	};
}

// ── Wheel renderers (polar spaces only) ─────────────────────

export const WHEEL_RENDERERS: Partial<Record<ColorSpaceId, WheelRenderer>> = {
	cam02p: wheelRenderer(0, 120, (hex) => {
		const c = toCam02p(hex);
		return { h: c.h, c: c.C };
	}),
	oklch: wheelRenderer(1, 0.322, (hex) => toOklch(hex) ?? {}),
	lch: wheelRenderer(2, 100, (hex) => toLch(hex) ?? {}),
	hsl: wheelRenderer(3, 1, (hex) => {
		const c = toHsl(hex);
		return { h: c?.h, c: c?.s };
	}),
	hsv: wheelRenderer(4, 1, (hex) => {
		const c = toHsv(hex);
		return { h: c?.h, c: c?.s };
	})
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
			const c = toCam02p(hex);
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
 * The polar space a wheel draws for a given color space — itself when it is
 * already polar, its polar equivalent when it is cartesian.
 */
export function getWheelSpaceId(id: ColorSpaceId): ColorSpaceId {
	return COLOR_SPACES[id].wheelFallback ?? id;
}

/** Resolve which wheel renderer to use for a given color space. */
export function getWheelRenderer(id: ColorSpaceId): WheelRenderer {
	return WHEEL_RENDERERS[getWheelSpaceId(id)]!;
}
