import { describe, expect, it } from 'vitest';
import { evenlySpacedRatios, ratiosForEvenLightness, type LightnessStop } from './contrast-targets';

/** Spacing between consecutive values, rounded to kill float noise. */
function gaps(values: number[]): number[] {
	return values.slice(1).map((v, i) => Math.round((v - values[i]) * 1000) / 1000);
}

describe('evenlySpacedRatios', () => {
	const cases: { name: string; targets: number[]; expected: number[] }[] = [
		{ name: 'empty', targets: [], expected: [] },
		{ name: 'single target is untouched', targets: [4.5], expected: [4.5] },
		{ name: 'two targets keep their ends', targets: [1, 21], expected: [1, 21] },
		{
			name: 'spreads between the extremes',
			targets: [1, 2, 3, 11],
			expected: [1, 4.333, 7.667, 11]
		},
		{
			name: 'ignores the original ordering, using min and max',
			targets: [11, 2, 3, 1],
			expected: [1, 4.333, 7.667, 11]
		}
	];

	it.each(cases)('$name', ({ targets, expected }) => {
		expect(evenlySpacedRatios(targets)).toEqual(expected);
	});

	it('produces constant spacing', () => {
		const spacing = gaps(evenlySpacedRatios([1.065, 3, 8, 19.539]));
		expect(new Set(spacing).size).toBe(1);
	});
});

describe('ratiosForEvenLightness', () => {
	it('returns the input when there is nothing to distribute', () => {
		expect(ratiosForEvenLightness([])).toEqual([]);
		expect(ratiosForEvenLightness([{ ratio: 4.5, lightness: 50 }])).toEqual([4.5]);
	});

	it('keeps the first and last stop where they were', () => {
		const stops: LightnessStop[] = [
			{ ratio: 1.1, lightness: 97 },
			{ ratio: 2, lightness: 80 },
			{ ratio: 12, lightness: 40 },
			{ ratio: 19, lightness: 12 }
		];
		const result = ratiosForEvenLightness(stops);

		expect(result[0]).toBeCloseTo(1.1, 3);
		expect(result[result.length - 1]).toBeCloseTo(19, 3);
	});

	// A scale with real curvature: contrast climbs far faster than L* falls, so
	// the two distribution strategies must not agree.
	const curved: LightnessStop[] = [
		{ ratio: 1, lightness: 100 },
		{ ratio: 1.5, lightness: 95 },
		{ ratio: 4, lightness: 70 },
		{ ratio: 21, lightness: 5 }
	];

	/** Read a lightness back out of `curved` for an arbitrary ratio. */
	function lightnessOf(ratio: number): number {
		const asc = [...curved].sort((a, b) => a.ratio - b.ratio);
		for (let i = 1; i < asc.length; i++) {
			if (ratio > asc[i].ratio) continue;
			const lo = asc[i - 1];
			const hi = asc[i];
			const t = (ratio - lo.ratio) / (hi.ratio - lo.ratio);
			return lo.lightness + (hi.lightness - lo.lightness) * t;
		}
		return asc[asc.length - 1].lightness;
	}

	it('lands the stops on evenly spaced lightness', () => {
		const result = ratiosForEvenLightness(curved);
		const step = (curved[curved.length - 1].lightness - curved[0].lightness) / (curved.length - 1);

		for (const gap of gaps(result.map(lightnessOf))) {
			expect(gap).toBeCloseTo(step, 1);
		}
	});

	it('does not land on evenly spaced lightness when ratios are spread instead', () => {
		const spread = evenlySpacedRatios(curved.map((s) => s.ratio));
		const step = (curved[curved.length - 1].lightness - curved[0].lightness) / (curved.length - 1);

		expect(gaps(spread.map(lightnessOf)).some((gap) => Math.abs(gap - step) > 1)).toBe(true);
	});

	it('differs from plain ratio spacing on a curved scale', () => {
		expect(ratiosForEvenLightness(curved)).not.toEqual(
			evenlySpacedRatios(curved.map((s) => s.ratio))
		);
	});

	it('clamps into the range the ratio fields accept', () => {
		const stops: LightnessStop[] = [
			{ ratio: 0.2, lightness: 100 },
			{ ratio: 40, lightness: 0 }
		];
		for (const ratio of ratiosForEvenLightness(stops)) {
			expect(ratio).toBeGreaterThanOrEqual(1);
			expect(ratio).toBeLessThanOrEqual(21);
		}
	});

	it('survives stops that share a lightness', () => {
		const stops: LightnessStop[] = [
			{ ratio: 1, lightness: 50 },
			{ ratio: 2, lightness: 50 },
			{ ratio: 3, lightness: 10 }
		];
		expect(ratiosForEvenLightness(stops).every(Number.isFinite)).toBe(true);
	});
});
