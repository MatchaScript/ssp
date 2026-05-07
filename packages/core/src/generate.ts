import { oklch, parse } from 'culori';
import { Theme, Color, BackgroundColor } from '@adobe/leonardo-contrast-colors';
import type { ContrastColor, ContrastColorValue, CssColor } from '@adobe/leonardo-contrast-colors';
import { templateCss } from './template.js';

// ── Config Types ──────────────────────────────────────────────────────────────

export interface ColorConfig {
	baseHex: string;
	scaleAnchors?: Record<string, string>;
}

export interface GrayConfig {
	baseHex: string;
	contrastTargets: Record<string, { ratios: number[]; lightness: number }>;
}

export type ColorFormat = 'hex' | 'oklch';

export interface SpectrumConfig {
	levels: number[];
	grayLevels: number[];
	colorContrastTargets: number[];
	colors: Record<string, ColorConfig>;
	gray: GrayConfig;
	themes: Record<string, { lightness: number }>;
	accentColor?: string;
	colorFormat?: ColorFormat;
	staticLevels?: number[];
	typography?: { fonts?: { sans?: string; serif?: string; mono?: string } };
	borderWidth?: Record<string, string>;
	cornerRadius?: Record<string, string>;
	space?: Record<string, string>;
	cssOutputPath?: string;
}

// ── Token Types ──────────────────────────────────────────────────────────────

export interface PaletteToken {
	value?: string;
}
export type PaletteJson = Record<string, PaletteToken>;

interface TokenSetValue {
	value?: string | number;
	ref?: string;
}

interface TokenSets {
	light?: TokenSetValue;
	dark?: TokenSetValue;
}

interface ShadowColor {
	sets?: TokenSets;
	value?: string;
	ref?: string;
}

interface ShadowLayer {
	x?: string | number;
	y?: string | number;
	offsetX?: string | number;
	offsetY?: string | number;
	blur?: string | number;
	spread?: string | number;
	color?: string | ShadowColor;
}

export interface TokenEntry {
	value?: string | number | ShadowLayer[];
	ref?: string;
	sets?: TokenSets;
}
export type VariablesJson = Record<string, TokenEntry>;

export interface SpectrumTokens {
	semantic: VariablesJson;
	palette: PaletteJson;
}

// ── Palette Types ─────────────────────────────────────────────────────────────

interface PaletteColor {
	hex: string;
	l: number;
	c: number;
	h: number;
}

interface Palette {
	colors: Record<string, PaletteColor[]>;
	grays: Record<string | number, PaletteColor>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function withSuppressedLeonardoWarnings<T>(fn: () => T): T {
	const originalWarn = console.warn;
	console.warn = (...args: unknown[]) => {
		if (typeof args[0] === 'string' && args[0].includes('`colorspace` is deprecated')) return;
		originalWarn(...args);
	};
	try {
		return fn();
	} finally {
		console.warn = originalWarn;
	}
}

function getOklch(colorStr: string) {
	const c = parse(colorStr);
	if (!c) return { l: 0, c: 0, h: 0 };
	return oklch(c);
}

function fmtL(n: number) {
	return n.toFixed(4);
}
function fmtC(n: number) {
	return (n || 0).toFixed(4);
}
function fmtH(n: number) {
	return (n || 0).toFixed(2);
}

function fmtColor(color: PaletteColor, format: ColorFormat): string {
	if (format === 'hex') return color.hex;
	return `oklch(${fmtL(color.l)} ${fmtC(color.c)} ${fmtH(color.h)})`;
}

// ── Alias Resolution ─────────────────────────────────────────────────────────

const ALIAS_PATTERN = /^(accent|informative|negative|positive|notice)-color-(\d+)$/;

function buildAliasColorMap(accentColor: string): Record<string, string> {
	return {
		'accent-color': accentColor,
		'informative-color': 'blue',
		'negative-color': 'red',
		'positive-color': 'green',
		'notice-color': 'orange'
	};
}

function createTokenResolver(aliasColorMap: Record<string, string>) {
	return function resolveTokenRef(val: string): string {
		if (!(val.startsWith('{') && val.endsWith('}'))) return val;
		const name = val.slice(1, -1);

		const aliasMatch = name.match(ALIAS_PATTERN);
		if (aliasMatch) {
			const hue = aliasColorMap[`${aliasMatch[1]}-color`];
			if (hue) return `var(--${hue}-${aliasMatch[2]})`;
		}

		return `var(--${name})`;
	};
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Render the full Spectrum theme stylesheet for a given config.
 * Pure: no filesystem or network. Caller supplies the static token JSON.
 */
export function generateSpectrumCss(config: SpectrumConfig, tokens: SpectrumTokens): string {
	const { semantic: semanticTokens, palette: paletteTokens } = tokens;

	const { levels, grayLevels, colors, gray, themes, colorContrastTargets } = config;
	const accentColor = config.accentColor ?? 'blue';
	const colorFormat: ColorFormat = config.colorFormat ?? 'oklch';
	const staticLevels = config.staticLevels ?? [900, 1000, 1100, 1200];
	const transparentLevels = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

	const aliasColorMap = buildAliasColorMap(accentColor);
	const resolveTokenRef = createTokenResolver(aliasColorMap);

	function resolveTokenSets(sets: TokenSets): string | null {
		const light = sets.light?.value ?? sets.light?.ref;
		const dark = sets.dark?.value ?? sets.dark?.ref;
		if (light !== undefined && dark !== undefined) {
			const lightVal = resolveTokenRef(String(light));
			const darkVal = resolveTokenRef(String(dark));
			if (lightVal === darkVal) return lightVal;
			return `light-dark(${lightVal}, ${darkVal})`;
		}
		if (light !== undefined) return resolveTokenRef(String(light));
		if (dark !== undefined) return resolveTokenRef(String(dark));
		return null;
	}

	function resolveTokenEntry(entry: TokenEntry): string | null {
		if (entry.sets && (entry.sets.light?.ref || entry.sets.dark?.ref)) {
			return resolveTokenSets(entry.sets);
		}
		if (entry.ref) return resolveTokenRef(entry.ref);
		if (entry.sets) return resolveTokenSets(entry.sets);
		if (entry.value !== undefined && !Array.isArray(entry.value)) {
			return resolveTokenRef(String(entry.value));
		}
		return null;
	}

	function resolveShadowColor(color: string | ShadowColor | undefined): string {
		if (!color) return '';
		if (typeof color === 'string') return resolveTokenRef(color);
		if (color.sets) return resolveTokenSets(color.sets) ?? '';
		if (color.value) return resolveTokenRef(color.value);
		if (color.ref) return resolveTokenRef(color.ref);
		return '';
	}

	// --- Generate Palettes via Leonardo ---
	const palettes: Record<string, Palette> = {};

	withSuppressedLeonardoWarnings(() => {
		for (const [themeName, themeConfig] of Object.entries(themes)) {
			const ct = gray.contrastTargets[themeName];
			const grays: Record<string | number, PaletteColor> = {};
			const grayOk = getOklch(gray.baseHex);
			const grayHue = grayOk.h ?? 0;
			if (ct) {
				const bgGray = new BackgroundColor({
					name: 'gray',
					colorKeys: [gray.baseHex as CssColor],
					colorSpace: 'OKLCH',
					ratios: ct.ratios
				});
				const themeGray = new Theme({
					colors: [bgGray],
					backgroundColor: bgGray,
					lightness: ct.lightness,
					output: 'HEX',
					formula: 'wcag2'
				});
				if (themeGray.contrastColors.length < 2) {
					throw new Error(
						`[spectrum-theme] Leonardo returned fewer than 2 contrast entries for theme "${themeName}" gray. ` +
							`Check gray.contrastTargets config.`
					);
				}
				const bgHex = themeGray.contrastColors[0].background;
				const bgOk = getOklch(bgHex);
				grays[grayLevels[0]] = { hex: bgHex, l: bgOk.l, c: 0, h: grayHue };
				const grayColor = themeGray.contrastColors[1] as ContrastColor;
				for (let i = 0; i < grayColor.values.length && i < grayLevels.length - 1; i++) {
					const hex = grayColor.values[i].value;
					const ok = getOklch(hex);
					grays[grayLevels[i + 1]] = { hex, l: ok.l, c: 0, h: grayHue };
				}
			}

			palettes[themeName] = { colors: {}, grays };

			for (const [hueName, hueConfig] of Object.entries(colors)) {
				const bgHue = new BackgroundColor({
					name: 'bg',
					colorKeys: ['#888888'],
					colorSpace: 'OKLCH',
					ratios: [1]
				});
				let colorKeys: CssColor[] = [hueConfig.baseHex as CssColor];
				if (hueConfig.scaleAnchors) {
					const anchors = hueConfig.scaleAnchors;
					const sortedKeys = Object.keys(anchors)
						.map(Number)
						.sort((a, b) => a - b);
					const anchorValues = sortedKeys.map((k) => anchors[k.toString()] as CssColor);
					const baseAlreadyIncluded = anchorValues.some(
						(v) => v.toLowerCase() === hueConfig.baseHex.toLowerCase()
					);
					colorKeys = baseAlreadyIncluded
						? anchorValues
						: [hueConfig.baseHex as CssColor, ...anchorValues];
				}

				const colorHue = new Color({
					name: hueName,
					colorKeys,
					colorSpace: 'CAM02',
					ratios: colorContrastTargets
				});
				const themeHue = new Theme({
					colors: [bgHue, colorHue],
					backgroundColor: bgHue,
					lightness: themeConfig.lightness,
					output: 'HEX',
					formula: 'wcag2'
				});

				const colorData = themeHue.contrastColors.find(
					(c): c is ContrastColor => 'name' in c && c.name === hueName
				);
				palettes[themeName].colors[hueName] = colorData
					? colorData.values.map((v: ContrastColorValue) => {
							const ok = getOklch(v.value);
							return { hex: v.value, l: ok.l, c: ok.c ?? 0, h: ok.h ?? 0 };
						})
					: [];
			}
		}
	});

	const staticLevelIndices = staticLevels.map((l) => {
		const idx = levels.indexOf(l);
		if (idx === -1) {
			throw new Error(
				`[spectrum-theme] Static level ${l} not found in levels [${levels.join(', ')}].`
			);
		}
		return idx;
	});
	const maxNonAccentStaticLevel = staticLevels[staticLevels.length - 2] ?? staticLevels[0];

	// --- Generate Output Strings ---

	function genTransparentScales() {
		const lines: string[] = [];
		for (const color of ['white', 'black']) {
			const rgb = color === 'white' ? '255 255 255' : '0 0 0';
			lines.push(`    /* ── Transparent ${color.charAt(0).toUpperCase() + color.slice(1)} ── */`);
			transparentLevels.forEach((level) => {
				const tkn = paletteTokens[`transparent-${color}-${level}`];
				if (!tkn) return;
				const val = tkn.value ?? '';
				const rgbaMatch = val.match(/rgba\([^,]+,\s*[0-9]+,\s*[0-9]+,\s*([\d.]+)\)/);
				const opacity = rgbaMatch ? parseFloat(rgbaMatch[1]) : val.startsWith('rgb(') ? 1 : 0;
				lines.push(`    --transparent-${color}-${level}: rgb(${rgb} / ${opacity});`);
			});
			lines.push('');
		}
		return lines.join('\n').trimEnd();
	}

	function genColorVars() {
		const lines: string[] = [];
		const lightTheme = palettes.light;
		const darkTheme = palettes.dark;

		for (const hueName of Object.keys(lightTheme.colors)) {
			lines.push(`\n\t\t/* --- ${hueName} --- */`);
			const lightPalette = lightTheme.colors[hueName];
			const darkPalette = darkTheme?.colors?.[hueName] ?? lightPalette;

			lightPalette.forEach((color, i) => {
				if (i >= levels.length) return;
				const level = levels[i];
				const lightVal = fmtColor(color, colorFormat);
				const darkColor = darkPalette[i];
				const darkVal = darkColor ? fmtColor(darkColor, colorFormat) : lightVal;
				lines.push(`\t\t--${hueName}-${level}: light-dark(${lightVal}, ${darkVal});`);
			});
		}
		return lines.join('\n');
	}

	function genGrayVars() {
		const lightGrays = palettes.light.grays;
		const darkGrays = palettes.dark?.grays;

		const lines: string[] = [`\n\t\t/* --- Gray --- */`];
		grayLevels.forEach((level) => {
			const lightColor = lightGrays[level];
			const darkColor = darkGrays?.[level];
			const lightVal = fmtColor(lightColor, colorFormat);
			const darkVal = darkColor ? fmtColor(darkColor, colorFormat) : lightVal;
			lines.push(`\t\t--gray-${level}: light-dark(${lightVal}, ${darkVal});`);
		});
		return lines.join('\n');
	}

	function genStaticColors() {
		const lines = [`\n\t\t/* --- Static Colors (theme-independent, from light palette) --- */`];
		const hueNames = Object.keys(colors);
		const lightPalette = palettes.light.colors;

		hueNames.forEach((hue) => {
			staticLevels.forEach((level, si) => {
				const idx = staticLevelIndices[si];
				if (hue === accentColor || level <= maxNonAccentStaticLevel) {
					const color = lightPalette[hue][idx];
					if (color) {
						lines.push(`\t\t--static-${hue}-${level}: ${fmtColor(color, colorFormat)};`);
					}
				}
			});
			lines.push('');
		});
		return lines.join('\n');
	}

	function genLayoutVars() {
		const lines: string[] = ['\n\t\t/* --- Spectrum Layout Tokens --- */'];
		const prefixes = ['border-width-', 'corner-radius-', 'spacing-', 'space-'];

		for (const [key, tokenEntry] of Object.entries(semanticTokens)) {
			for (const prefix of prefixes) {
				if (!key.startsWith(prefix)) continue;

				const rawVal = tokenEntry.value;
				if (!rawVal || Array.isArray(rawVal)) break;

				let val: string;
				if (typeof rawVal === 'number') {
					if (rawVal === 0) val = '0px';
					else if (rawVal === 0.5 && prefix === 'corner-radius-') val = '100vmax';
					else val = `${rawVal}px`;
				} else {
					val = resolveTokenRef(rawVal);
				}

				const suffix = key.slice(prefix.length);
				if (prefix === 'border-width-' && config.borderWidth?.[suffix]) {
					val = config.borderWidth[suffix];
				} else if (prefix === 'corner-radius-' && config.cornerRadius?.[suffix]) {
					val = config.cornerRadius[suffix];
				} else if ((prefix === 'space-' || prefix === 'spacing-') && config.space?.[suffix]) {
					val = config.space[suffix];
				}

				lines.push(`\t\t--${key}: ${val};`);
				break;
			}
		}
		return lines.join('\n');
	}

	function genTypographyVars() {
		if (!config.typography?.fonts) return '';
		const { fonts } = config.typography;
		return [
			`\n\t\t/* ── Typography: Fonts ── */`,
			fonts.sans ? `\t\t--font-sans: ${fonts.sans};` : '',
			fonts.serif ? `\t\t--font-serif: ${fonts.serif};` : '',
			fonts.mono ? `\t\t--font-mono: ${fonts.mono};` : ''
		]
			.filter(Boolean)
			.join('\n');
	}

	function genHueSemanticVars() {
		const lines: string[] = ['\n\t\t/* --- Hue Semantic Tokens --- */'];
		const suffixes = [
			'-background-color-default',
			'-subtle-background-color-default',
			'-visual-color'
		];
		const hueNames = [...Object.keys(colors), 'gray'];

		for (const hue of hueNames) {
			for (const suffix of suffixes) {
				const key = `${hue}${suffix}`;
				const entry = semanticTokens[key];
				if (!entry) continue;
				const val = resolveTokenEntry(entry);
				if (!val) continue;
				lines.push(`\t\t--${key}: ${val};`);
			}
		}
		return lines.join('\n');
	}

	function genSemanticVars() {
		const lines: string[] = ['\n\t\t/* --- Spectrum Semantic Tokens --- */'];
		const prefixes = [
			'neutral-',
			'accent-',
			'informative-',
			'negative-',
			'positive-',
			'notice-',
			'disabled-',
			'focus-',
			'drop-shadow-',
			'opacity-',
			'background-',
			'popover-',
			'overlay-'
		];

		for (const [key, entry] of Object.entries(semanticTokens)) {
			if (ALIAS_PATTERN.test(key)) continue;

			for (const prefix of prefixes) {
				if (!key.startsWith(prefix)) continue;

				let resolved: string | null;
				if (Array.isArray(entry.value)) {
					const ensurePx = (v: string | number | undefined) =>
						v === undefined ? '0px' : typeof v === 'number' ? `${v}px` : v;
					resolved = entry.value
						.map((shadow) => {
							const x = ensurePx(shadow.x ?? shadow.offsetX);
							const y = ensurePx(shadow.y ?? shadow.offsetY);
							const blur = ensurePx(shadow.blur);
							const spread = ensurePx(shadow.spread);
							const color = resolveShadowColor(shadow.color);
							return `${x} ${y} ${blur} ${spread} ${color}`;
						})
						.join(', ');
				} else {
					resolved = resolveTokenEntry(entry);
				}

				if (!resolved) break;
				lines.push(`\t\t--${key}: ${resolved};`);
				break;
			}
		}
		return lines.join('\n');
	}

	// ── Assemble final CSS ───────────────────────────────────────────

	let finalCss = templateCss.replace(
		'/* {{ INJECT_TRANSPARENT_SCALES }} */',
		genTransparentScales()
	);

	const injectPalette = `\t:root {
${genGrayVars()}
${genColorVars()}
${genStaticColors()}
\t}

\t/* ── Explicit Theme Forcing ── */
\t[data-theme='light'] {
\t\tcolor-scheme: light;
\t}

\t[data-theme='dark'] {
\t\tcolor-scheme: dark;
\t}`;

	finalCss = finalCss.replace('/* {{ INJECT_PALETTE }} */', injectPalette);

	const injectSemantics = [
		genLayoutVars(),
		genSemanticVars(),
		genHueSemanticVars(),
		genTypographyVars()
	].join('\n');

	finalCss = finalCss.replace('/* {{ INJECT_SEMANTICS }} */', injectSemantics);

	return finalCss;
}
