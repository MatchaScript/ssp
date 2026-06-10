import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import {
	calculateColumnSizes,
	getMaxWidth,
	getMinWidth,
	resizeColumnWidth,
	type ColumnSize,
	type LayoutColumn
} from './column-layout.js';

export interface TableColumnLayoutOptions {
	readonly tableWidth: number;
	readonly columns: readonly LayoutColumn[];
}

/**
 * Owns column-width state for one TableView. Inputs (`tableWidth`, `columns`)
 * come in as live getters from `TableState`; outputs are a derived widths
 * array plus per-column accessors.
 *
 * Internal mutable state:
 *   • `#resizing`     — the key currently being dragged / keyboard-resized
 *   • `#changedSizes` — overrides written by `resize(key, newPx)`
 *
 * Remounting the same column set is idempotent. When a column key disappears
 * its override is dropped so the remaining columns re-flex.
 */
export class TableColumnLayoutState {
	#opts: TableColumnLayoutOptions;
	#changedSizes = new SvelteMap<string, ColumnSize>();
	#resizing: string | null = $state(null);

	constructor(opts: TableColumnLayoutOptions) {
		this.#opts = opts;
		$effect(() => {
			// Local membership-check Set: lives only for this tick, not observed
			// reactively. Plain Set is correct here; SvelteSet would waste tracking.
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const live = new Set(this.#opts.columns.map((c) => c.id));
			// `untrack` so deleting an obsolete key doesn't re-subscribe this
			// effect to its own writes (would re-fire once per delete otherwise).
			untrack(() => {
				for (const k of [...this.#changedSizes.keys()]) {
					if (!live.has(k)) this.#changedSizes.delete(k);
				}
			});
		});
	}

	#widths = $derived.by(() =>
		calculateColumnSizes(this.#opts.tableWidth, this.#opts.columns, this.#changedSizes)
	);

	get widths(): readonly number[] {
		return this.#widths;
	}

	getWidth(key: string): number {
		const idx = this.#opts.columns.findIndex((c) => c.id === key);
		return idx === -1 ? 0 : this.#widths[idx];
	}

	getMinWidth(key: string): number {
		const col = this.#opts.columns.find((c) => c.id === key);
		if (!col) return 0;
		return getMinWidth(col.minWidth, this.#opts.tableWidth);
	}

	getMaxWidth(key: string): number {
		const col = this.#opts.columns.find((c) => c.id === key);
		if (!col) return Number.MAX_SAFE_INTEGER;
		return getMaxWidth(col.maxWidth, this.#opts.tableWidth);
	}

	get resizingColumn(): string | null {
		return this.#resizing;
	}

	startResize(key: string): void {
		this.#resizing = key;
	}

	endResize(): void {
		this.#resizing = null;
	}

	resize(key: string, newWidth: number): void {
		const next = resizeColumnWidth(
			this.#opts.tableWidth,
			this.#opts.columns,
			this.#changedSizes,
			key,
			newWidth
		);
		this.#changedSizes.clear();
		for (const [k, v] of next) this.#changedSizes.set(k, v);
	}
}
