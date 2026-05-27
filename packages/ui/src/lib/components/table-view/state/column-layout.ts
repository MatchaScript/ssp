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

export interface LayoutColumn {
	key: string;
	width?: ColumnSize;
	defaultWidth?: ColumnSize;
	minWidth?: number | string;
	defaultMinWidth?: number | string;
	maxWidth?: number | string;
}

interface FlexItem {
	frozen: boolean;
	baseSize: number;
	hypotheticalMainSize: number;
	min: number;
	max: number;
	flex: number;
	targetMainSize: number;
	violation: number;
}

/**
 * Port of react-stately TableUtils.calculateColumnSizes. Implements the W3C
 * flex algorithm (https://www.w3.org/TR/css-flexbox-1/#layout-algorithm),
 * specialised for one row with whole-pixel widths via cascading rounding.
 *
 * Static (`number` / `%`) widths become frozen flex items at their resolved
 * pixel value; `fr` widths share the remainder according to their ratio.
 * `changedColumns` overrides the resolved width for a single column — used by
 * `resizeColumnWidth` to apply a drag-driven width.
 */
export function calculateColumnSizes(
	availableWidth: number,
	columns: readonly LayoutColumn[],
	changedColumns: ReadonlyMap<string, ColumnSize>
): number[] {
	const items: FlexItem[] = columns.map((col) => {
		const resolved = changedColumns.get(col.key) ?? col.width ?? col.defaultWidth ?? '1fr';
		const min = getMinWidth(col.minWidth ?? col.defaultMinWidth, availableWidth);
		const max = getMaxWidth(col.maxWidth, availableWidth);
		const isStaticWidth = isStatic(resolved);
		const baseSize = isStaticWidth
			? parseStaticWidth(resolved as number | string, availableWidth)
			: 0;
		const flex = isStaticWidth ? 0 : parseFractionalUnit(resolved);
		const hypothetical = Math.max(min, Math.min(max, baseSize));
		return {
			frozen: isStaticWidth,
			baseSize,
			hypotheticalMainSize: hypothetical,
			min,
			max,
			flex,
			targetMainSize: hypothetical,
			violation: 0
		};
	});

	// Step 1: lock frozen items at their hypothetical main size.
	for (const item of items) {
		if (item.frozen) item.targetMainSize = item.hypotheticalMainSize;
	}

	// Step 2: distribute the free space across unfrozen items, resolving
	// min/max violations iteratively until everything's frozen.
	while (items.some((i) => !i.frozen)) {
		const usedSpace = items.reduce((sum, i) => sum + (i.frozen ? i.targetMainSize : 0), 0);
		const remaining = Math.max(0, availableWidth - usedSpace);
		const totalFlex = items.reduce((sum, i) => sum + (i.frozen ? 0 : i.flex), 0);
		if (totalFlex === 0) {
			for (const i of items) if (!i.frozen) i.frozen = true;
			break;
		}

		for (const item of items) {
			if (item.frozen) continue;
			const share = (item.flex / totalFlex) * remaining;
			const clamped = Math.max(item.min, Math.min(item.max, share));
			item.violation = clamped - share;
			item.targetMainSize = clamped;
		}

		const totalViolation = items.reduce((sum, i) => sum + (i.frozen ? 0 : i.violation), 0);
		if (totalViolation === 0) {
			for (const i of items) if (!i.frozen) i.frozen = true;
		} else if (totalViolation > 0) {
			for (const i of items) if (!i.frozen && i.violation > 0) i.frozen = true;
		} else {
			for (const i of items) if (!i.frozen && i.violation < 0) i.frozen = true;
		}
	}

	// Step 3: cascade rounding so the total stays whole-pixel exact.
	const widths: number[] = [];
	let accumulatedRounded = 0;
	let accumulatedRaw = 0;
	for (const item of items) {
		accumulatedRaw += item.targetMainSize;
		const next = Math.round(accumulatedRaw) - accumulatedRounded;
		widths.push(next);
		accumulatedRounded += next;
	}

	return widths;
}

/**
 * Apply a resize: clamp `newWidth` to `[minWidth, maxWidth]`, freeze every
 * column to the left of `key` at its current pixel width, set `key` to the
 * clamped value, and let columns to the right keep their declared width
 * (controlled) or prior fr/% value (uncontrolled) so they re-flex against
 * the remainder.
 *
 * Mirrors `TableColumnLayout.resizeColumnWidth` (freeze-left contract).
 */
export function resizeColumnWidth(
	availableWidth: number,
	columns: readonly LayoutColumn[],
	currentSizes: ReadonlyMap<string, ColumnSize>,
	key: string,
	newWidth: number
): Map<string, ColumnSize> {
	const target = columns.find((c) => c.key === key);
	if (!target) return new Map(currentSizes);

	const min = getMinWidth(target.minWidth ?? target.defaultMinWidth, availableWidth);
	const max = getMaxWidth(target.maxWidth, availableWidth);
	const clamped = Math.max(min, Math.min(max, Math.floor(newWidth)));

	const pixelWidths = calculateColumnSizes(availableWidth, columns, currentSizes);
	const next = new Map<string, ColumnSize>();
	let frozen = true;

	for (let i = 0; i < columns.length; i++) {
		const col = columns[i];
		if (col.key === key) {
			next.set(col.key, clamped);
			frozen = false;
		} else if (frozen) {
			next.set(col.key, pixelWidths[i]);
		} else {
			next.set(col.key, col.width ?? currentSizes.get(col.key) ?? col.defaultWidth ?? '1fr');
		}
	}
	return next;
}
