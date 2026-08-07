import { describe, expect, it } from 'vitest';
import { colorKeysFor, generatePalettes, type SpectrumConfig } from './generate.js';

describe('colorKeysFor', () => {
	const cases: {
		name: string;
		color: { baseHex: string; scaleAnchors?: Record<string, string> };
		expected: string[];
	}[] = [
		{
			name: 'no anchors falls back to the base',
			color: { baseHex: '#3b63fb' },
			expected: ['#3b63fb']
		},
		{
			name: 'empty anchor map falls back to the base',
			color: { baseHex: '#3b63fb', scaleAnchors: {} },
			expected: ['#3b63fb']
		},
		{
			name: 'anchors come out in level order, base prepended',
			color: { baseHex: '#3b63fb', scaleAnchors: { 500: '#8eb9fc', 100: '#f5f9ff' } },
			expected: ['#3b63fb', '#f5f9ff', '#8eb9fc']
		},
		{
			name: 'levels sort numerically, not as strings',
			color: {
				baseHex: '#000000',
				scaleAnchors: { 1600: '#111111', 200: '#222222', 90: '#333333' }
			},
			expected: ['#000000', '#333333', '#222222', '#111111']
		},
		{
			name: 'base is not repeated when an anchor already carries it',
			color: { baseHex: '#3b63fb', scaleAnchors: { 100: '#f5f9ff', 800: '#3b63fb' } },
			expected: ['#f5f9ff', '#3b63fb']
		},
		{
			name: 'the base match is case-insensitive',
			color: { baseHex: '#3B63FB', scaleAnchors: { 800: '#3b63fb' } },
			expected: ['#3b63fb']
		}
	];

	it.each(cases)('$name', ({ color, expected }) => {
		expect(colorKeysFor(color)).toEqual(expected);
	});
});

describe('generatePalettes', () => {
	const config: SpectrumConfig = {
		levels: [100, 200, 300],
		grayLevels: [25, 50, 75],
		colorContrastTargets: [1.2, 3, 7],
		colors: {
			blue: { baseHex: '#3b63fb', scaleAnchors: { 100: '#f5f9ff', 300: '#10288c' } },
			plain: { baseHex: '#c24e00' }
		},
		gray: {
			baseHex: '#707070',
			contrastTargets: {
				light: { lightness: 100, ratios: [1.1, 4.5] },
				dark: { lightness: 5, ratios: [1.1, 4.5] }
			}
		},
		themes: { light: { lightness: 100 }, dark: { lightness: 5 } }
	};

	it('produces one palette per configured theme', () => {
		expect(Object.keys(generatePalettes(config)).sort()).toEqual(['dark', 'light']);
	});

	it('produces one swatch per contrast target for every color', () => {
		const { light } = generatePalettes(config);
		expect(Object.keys(light.colors).sort()).toEqual(['blue', 'plain']);
		for (const swatches of Object.values(light.colors)) {
			expect(swatches).toHaveLength(config.colorContrastTargets.length);
		}
	});

	it('emits hex plus the OKLCH coordinates the stylesheet formats from', () => {
		const [first] = generatePalettes(config).light.colors.blue;
		expect(first.hex).toMatch(/^#[0-9a-f]{6}$/i);
		expect(first.l).toBeGreaterThan(0);
		expect(Number.isFinite(first.c)).toBe(true);
		expect(Number.isFinite(first.h)).toBe(true);
	});

	it('keys grays by the configured gray levels, background first', () => {
		const { grays } = generatePalettes(config).light;
		expect(
			Object.keys(grays)
				.map(Number)
				.sort((a, b) => a - b)
		).toEqual([25, 50, 75]);
		expect(grays[25].c).toBe(0);
	});

	it('darkens the light theme from top to bottom', () => {
		const swatches = generatePalettes(config).light.colors.blue;
		expect(swatches[0].l).toBeGreaterThan(swatches[swatches.length - 1].l);
	});

	it('gives light and dark different backgrounds', () => {
		const palettes = generatePalettes(config);
		expect(palettes.light.grays[25].hex).not.toBe(palettes.dark.grays[25].hex);
	});

	it('is deterministic', () => {
		expect(generatePalettes(config)).toEqual(generatePalettes(config));
	});

	it('yields only the background level when gray has no ratios', () => {
		const noRatios = {
			...config,
			gray: {
				...config.gray,
				contrastTargets: {
					light: { lightness: 100, ratios: [] },
					dark: { lightness: 5, ratios: [] }
				}
			}
		} as SpectrumConfig;

		expect(Object.keys(generatePalettes(noRatios).light.grays)).toEqual(['25']);
	});

	it('leaves grays empty for a theme with no gray targets', () => {
		const noTargets = {
			...config,
			gray: { ...config.gray, contrastTargets: { light: config.gray.contrastTargets.light } }
		} as SpectrumConfig;

		const palettes = generatePalettes(noTargets);
		expect(palettes.dark.grays).toEqual({});
		expect(Object.keys(palettes.dark.colors)).toHaveLength(2);
	});
});
