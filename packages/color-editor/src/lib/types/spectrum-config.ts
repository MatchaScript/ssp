export interface ColorConfig {
	baseHex: string;
	scaleAnchors: Record<string, string>;
}

export interface ColorEntry extends ColorConfig {
	name: string;
}

export interface GrayContrastTargets {
	lightness: number;
	ratios: number[];
}

export interface GrayConfig {
	baseHex: string;
	contrastTargets: {
		light: GrayContrastTargets;
		dark: GrayContrastTargets;
	};
}

export interface ThemesConfig {
	light: { lightness: number };
	dark: { lightness: number };
}

export type ColorFormat = 'hex' | 'oklch';

/** Full spectrum.config.json shape — typed where the UI needs it, open elsewhere. */
export interface SpectrumConfig {
	colors: Record<string, ColorConfig>;
	accentColor?: string;
	colorFormat?: ColorFormat;
	gray: GrayConfig;
	themes: ThemesConfig;
	colorContrastTargets: number[];
	[key: string]: unknown;
}
