import * as Leo from '@adobe/leonardo-contrast-colors';
import type { CssColor, ContrastFormula } from '@adobe/leonardo-contrast-colors';
import { configState } from './config.svelte';
import { buildColorKeys } from '$lib/utils/color-keys';

export interface ThemeColorOutput {
	background: string;
	colorScales: {
		name: string;
		values: { name: string; value: string; contrast: number }[];
	}[];
}

/**
 * Reactive Leonardo theme state.
 *
 * Constructs a `Leo.Theme` from `configState` data and exposes
 * contrast-based color generation for the UI preview.
 */
class ThemeColorsState {
	backgroundColorName = $state<string>('gray');
	lightness = $state<number>(100);
	contrast = $state<number>(1);
	saturation = $state<number>(100);
	contrastFormula = $state<ContrastFormula>('wcag2');
	previewTheme = $state<'light' | 'dark'>('light');

	private theme = $derived.by<Leo.Theme>(() => {
		const { gray, colorContrastTargets } = configState.raw;

		// Build BackgroundColor for gray
		const grayBgColor = new Leo.BackgroundColor({
			name: 'gray',
			colorKeys: [gray.baseHex] as CssColor[],
			ratios: gray.contrastTargets[this.previewTheme].ratios,
			colorSpace: 'CAM02p',
			output: 'HEX'
		});

		// Build Color objects for each chromatic color
		const chromaticColors = configState.colors.map(
			(color) =>
				new Leo.Color({
					name: color.name,
					colorKeys: buildColorKeys(color),
					ratios: colorContrastTargets,
					colorSpace: 'CAM02p',
					output: 'HEX'
				})
		);

		// Determine which object is the background
		const backgroundColor =
			this.backgroundColorName === 'gray'
				? grayBgColor
				: // If backgroundColorName matches a chromatic color, build a BackgroundColor for it
					(() => {
						const entry = configState.colors.find((c) => c.name === this.backgroundColorName);
						if (!entry) return grayBgColor;
						return new Leo.BackgroundColor({
							name: entry.name,
							colorKeys: buildColorKeys(entry),
							ratios: colorContrastTargets,
							colorSpace: 'CAM02p',
							output: 'HEX'
						});
					})();

		// All colors except the background go in the colors array
		const allColors: Leo.Color[] =
			this.backgroundColorName === 'gray'
				? chromaticColors
				: [grayBgColor, ...chromaticColors.filter((c) => c.name !== this.backgroundColorName)];

		return new Leo.Theme({
			colors: allColors,
			backgroundColor,
			lightness: this.lightness,
			contrast: this.contrast,
			saturation: this.saturation,
			output: 'HEX',
			formula: this.contrastFormula
		});
	});

	contrastColors = $derived.by(() => this.theme.contrastColors);

	output = $derived.by<ThemeColorOutput>(() => {
		const [backgroundEntry, ...colorEntries] = this.theme.contrastColors;

		return {
			background: backgroundEntry.background,
			colorScales: colorEntries.map((entry) => ({
				name: entry.name,
				values: entry.values.map((v) => ({
					name: v.name,
					value: v.value,
					contrast: v.contrast
				}))
			}))
		};
	});

	setPreviewTheme(theme: 'light' | 'dark') {
		this.previewTheme = theme;
		this.lightness = configState.raw.themes[theme].lightness;
	}
}

export const themeColorsState = new ThemeColorsState();
