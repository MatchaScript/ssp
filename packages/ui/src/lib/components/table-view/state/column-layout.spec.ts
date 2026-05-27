import { describe, it, expect } from 'vitest';
import {
	isStatic,
	parseFractionalUnit,
	parseStaticWidth,
	getMinWidth,
	getMaxWidth
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
