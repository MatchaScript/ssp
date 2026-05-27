/**
 * Column width as accepted on the public API:
 *   • `number`         → pixels
 *   • `${number}%`     → percentage of the table's available width
 *   • `${number}fr`    → fractional unit (shares of the remainder)
 *
 * Mirrors `ColumnSize` in react-stately/src/table/Column.ts.
 */
export type ColumnSize = number | `${number}%` | `${number}fr`;

export function isStatic(width: ColumnSize | null | undefined): boolean {
	if (width == null) return false;
	if (typeof width === 'number') return !Number.isNaN(width);
	return /^\d+(\.\d+)?%$/.test(width);
}

export function parseFractionalUnit(width: ColumnSize | null | undefined): number {
	if (width == null || typeof width === 'number') return 1;
	const match = width.match(/^(\d+(?:\.\d+)?)fr$/);
	if (!match) return 1;
	return parseFloat(match[1]);
}

export function parseStaticWidth(width: number | string, tableWidth: number): number {
	if (typeof width === 'number') return width;
	const match = width.match(/^(\d+(?:\.\d+)?)%$/);
	if (!match) {
		throw new Error(
			`Only numbers (pixels) and "%" strings are supported as static column widths; got ${width}`
		);
	}
	return tableWidth * (parseFloat(match[1]) / 100);
}

export function getMinWidth(
	minWidth: number | string | null | undefined,
	tableWidth: number
): number {
	return minWidth != null ? parseStaticWidth(minWidth, tableWidth) : 0;
}

export function getMaxWidth(
	maxWidth: number | string | null | undefined,
	tableWidth: number
): number {
	return maxWidth != null ? parseStaticWidth(maxWidth, tableWidth) : Number.MAX_SAFE_INTEGER;
}
