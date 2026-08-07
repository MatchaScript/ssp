import { describe, expect, it } from 'vitest';
import { crossSectionTicks, nearestTickIndex } from './cross-section';
import { COLOR_SPACES } from '$lib/types/color-space';

describe('nearestTickIndex', () => {
	const ticks = [10, 40, 41, 90];
	const cases: { name: string; value: number; ticks: number[]; expected: number }[] = [
		{ name: 'no ticks', value: 50, ticks: [], expected: 0 },
		{ name: 'exact hit', value: 40, ticks, expected: 1 },
		{ name: 'below the range', value: -5, ticks, expected: 0 },
		{ name: 'above the range', value: 200, ticks, expected: 3 },
		{ name: 'picks the closer of two neighbours', value: 40.4, ticks, expected: 1 },
		{ name: 'picks the other side past the midpoint', value: 40.6, ticks, expected: 2 },
		{ name: 'ties resolve to the first', value: 25, ticks, expected: 0 }
	];

	it.each(cases)('$name', ({ value, ticks: t, expected }) => {
		expect(nearestTickIndex(value, t)).toBe(expected);
	});
});

describe('crossSectionTicks', () => {
	const oklch = COLOR_SPACES.oklch;

	it('is empty without scales or levels', () => {
		expect(crossSectionTicks([], 4, oklch)).toEqual([]);
		expect(crossSectionTicks([{ swatches: ['#ffffff'] }], 0, oklch)).toEqual([]);
	});

	it('reports each level as a percentage of the space lightness range', () => {
		const ticks = crossSectionTicks([{ swatches: ['#ffffff', '#000000'] }], 2, oklch);

		expect(ticks).toHaveLength(2);
		expect(ticks[0]).toBeCloseTo(100, 0);
		expect(ticks[1]).toBeCloseTo(0, 0);
	});

	it('averages a level across scales', () => {
		const [averaged] = crossSectionTicks(
			[{ swatches: ['#ffffff'] }, { swatches: ['#000000'] }],
			1,
			oklch
		);
		const [white] = crossSectionTicks([{ swatches: ['#ffffff'] }], 1, oklch);
		const [black] = crossSectionTicks([{ swatches: ['#000000'] }], 1, oklch);

		expect(averaged).toBeCloseTo((white + black) / 2, 6);
	});

	it('skips scales that are missing a level rather than counting them as zero', () => {
		const withGap = crossSectionTicks(
			[{ swatches: ['#ffffff', '#808080'] }, { swatches: ['#ffffff'] }],
			2,
			oklch
		);
		const withoutGap = crossSectionTicks([{ swatches: ['#ffffff', '#808080'] }], 2, oklch);

		expect(withGap).toEqual(withoutGap);
	});

	it('drops levels no scale defines', () => {
		expect(crossSectionTicks([{ swatches: ['#ffffff'] }], 3, oklch)).toHaveLength(1);
	});

	it('descends as the scale darkens', () => {
		const ticks = crossSectionTicks([{ swatches: ['#ffffff', '#808080', '#000000'] }], 3, oklch);
		expect(ticks[0]).toBeGreaterThan(ticks[1]);
		expect(ticks[1]).toBeGreaterThan(ticks[2]);
	});
});
