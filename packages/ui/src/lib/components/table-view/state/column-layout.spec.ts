import { describe, it, expect } from 'vitest';
import {
	isStatic,
	parseFractionalUnit,
	parseStaticWidth,
	getMinWidth,
	getMaxWidth,
	calculateColumnSizes,
	resizeColumnWidth,
	type LayoutColumn
} from './column-layout.js';

describe('column-layout parse helpers', () => {
	it('isStatic accepts numbers and percentages, rejects fr and nullish', () => {
		expect(isStatic(150)).toBe(true);
		expect(isStatic('40%')).toBe(true);
		expect(isStatic('1fr')).toBe(false);
		expect(isStatic(undefined)).toBe(false);
		expect(isStatic(null)).toBe(false);
	});

	it('parseFractionalUnit extracts the fr value, defaulting to 1', () => {
		expect(parseFractionalUnit('2fr')).toBe(2);
		expect(parseFractionalUnit('0.5fr')).toBe(0.5);
		expect(parseFractionalUnit(undefined)).toBe(1);
		expect(parseFractionalUnit(150)).toBe(1);
	});

	it('parseStaticWidth converts percentages against table width', () => {
		expect(parseStaticWidth(200, 800)).toBe(200);
		expect(parseStaticWidth('25%', 800)).toBe(200);
	});

	it('parseStaticWidth throws on unsupported strings', () => {
		expect(() => parseStaticWidth('150px', 800)).toThrow();
	});

	it('getMinWidth defaults to 0 and getMaxWidth defaults to MAX_SAFE_INTEGER', () => {
		expect(getMinWidth(undefined, 800)).toBe(0);
		expect(getMinWidth(75, 800)).toBe(75);
		expect(getMaxWidth(undefined, 800)).toBe(Number.MAX_SAFE_INTEGER);
		expect(getMaxWidth('50%', 800)).toBe(400);
	});
});

const COL = (key: string, overrides: Partial<LayoutColumn> = {}): LayoutColumn => ({
	key,
	defaultWidth: '1fr',
	defaultMinWidth: 75,
	...overrides
});

describe('calculateColumnSizes', () => {
	it('distributes available width across 1fr columns evenly', () => {
		expect(calculateColumnSizes(900, [COL('a'), COL('b'), COL('c')], new Map())).toEqual([
			300, 300, 300
		]);
	});

	it('honours static pixel widths and flexes the remainder', () => {
		expect(
			calculateColumnSizes(800, [COL('a', { width: 200 }), COL('b'), COL('c')], new Map())
		).toEqual([200, 300, 300]);
	});

	it('clamps against minWidth even when over-constrained', () => {
		const widths = calculateColumnSizes(
			200,
			[COL('a', { minWidth: 100 }), COL('b', { minWidth: 100 }), COL('c', { minWidth: 100 })],
			new Map()
		);
		expect(widths).toEqual([100, 100, 100]);
	});

	it('applies a changed width then re-flexes the rest', () => {
		const widths = calculateColumnSizes(900, [COL('a'), COL('b'), COL('c')], new Map([['a', 450]]));
		expect(widths[0]).toBe(450);
		expect(widths[1]).toBe(225);
		expect(widths[2]).toBe(225);
	});

	it('respects fr ratios (2fr : 1fr : 1fr against 800px → 400/200/200)', () => {
		expect(
			calculateColumnSizes(800, [COL('a', { defaultWidth: '2fr' }), COL('b'), COL('c')], new Map())
		).toEqual([400, 200, 200]);
	});

	it('preserves total width via cascading rounding', () => {
		const widths = calculateColumnSizes(1000, [COL('a'), COL('b'), COL('c')], new Map());
		expect(widths.reduce((a, b) => a + b, 0)).toBe(1000);
	});

	it('parses percentage widths against the table width', () => {
		expect(
			calculateColumnSizes(1000, [COL('a', { width: '25%' }), COL('b'), COL('c')], new Map())
		).toEqual([250, 375, 375]);
	});
});

describe('resizeColumnWidth', () => {
	it('returns all columns with the target at the requested size', () => {
		const next = resizeColumnWidth(900, [COL('a'), COL('b'), COL('c')], new Map(), 'b', 400);
		expect([...next.keys()]).toEqual(['a', 'b', 'c']);
		expect(next.get('b')).toBe(400);
	});

	it('freezes columns to the left at their previous pixel width', () => {
		const next = resizeColumnWidth(900, [COL('a'), COL('b'), COL('c')], new Map(), 'b', 400);
		expect(next.get('a')).toBe(300);
	});

	it('preserves right-side declared widths and fr units', () => {
		const next = resizeColumnWidth(
			900,
			[COL('a'), COL('b'), COL('c', { defaultWidth: '2fr' })],
			new Map(),
			'a',
			200
		);
		// `c` retains its '2fr' declaration so the right side keeps flexing.
		expect(next.get('c')).toBe('2fr');
	});

	it('clamps the requested width to [minWidth, maxWidth]', () => {
		const next = resizeColumnWidth(
			900,
			[COL('a'), COL('b', { minWidth: 200, maxWidth: 350 }), COL('c')],
			new Map(),
			'b',
			500
		);
		expect(next.get('b')).toBe(350);
	});

	it('floors fractional pixel inputs', () => {
		const next = resizeColumnWidth(900, [COL('a'), COL('b'), COL('c')], new Map(), 'b', 317.7);
		expect(next.get('b')).toBe(317);
	});
});
