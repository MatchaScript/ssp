import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import { TableColumnLayoutState } from './column-layout-state.svelte.js';

function withRoot<T>(fn: () => T): T {
	let result!: T;
	const teardown = $effect.root(() => {
		result = fn();
	});
	teardown();
	return result;
}

describe('TableColumnLayoutState', () => {
	it('returns equal widths when all columns are 1fr', () => {
		withRoot(() => {
			const layout = new TableColumnLayoutState({
				get tableWidth() {
					return 900;
				},
				get columns() {
					return [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
				}
			});
			flushSync();
			expect(layout.getWidth('a')).toBe(300);
			expect(layout.getWidth('b')).toBe(300);
			expect(layout.getWidth('c')).toBe(300);
		});
	});

	it('applies a resize and freezes left columns', () => {
		withRoot(() => {
			const layout = new TableColumnLayoutState({
				get tableWidth() {
					return 900;
				},
				get columns() {
					return [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
				}
			});
			layout.resize('b', 400);
			flushSync();
			expect(layout.getWidth('a')).toBe(300);
			expect(layout.getWidth('b')).toBe(400);
			expect(layout.getWidth('c')).toBe(200);
		});
	});

	it('exposes min and max in pixels for the current table width', () => {
		withRoot(() => {
			const layout = new TableColumnLayoutState({
				get tableWidth() {
					return 800;
				},
				get columns() {
					return [{ key: 'a', minWidth: 100, maxWidth: '50%' as const }, { key: 'b' }];
				}
			});
			flushSync();
			expect(layout.getMinWidth('a')).toBe(100);
			expect(layout.getMaxWidth('a')).toBe(400);
		});
	});

	it('tracks the resizing column key', () => {
		withRoot(() => {
			const layout = new TableColumnLayoutState({
				get tableWidth() {
					return 900;
				},
				get columns() {
					return [{ key: 'a' }, { key: 'b' }];
				}
			});
			expect(layout.resizingColumn).toBe(null);
			layout.startResize('a');
			expect(layout.resizingColumn).toBe('a');
			layout.endResize();
			expect(layout.resizingColumn).toBe(null);
		});
	});

	it('drops overrides for columns that have been removed', () => {
		let cols = $state<{ key: string }[]>([{ key: 'a' }, { key: 'b' }]);
		withRoot(() => {
			const layout = new TableColumnLayoutState({
				get tableWidth() {
					return 800;
				},
				get columns() {
					return cols;
				}
			});
			layout.resize('a', 500);
			flushSync();
			cols = [{ key: 'b' }];
			flushSync();
			expect(layout.getWidth('b')).toBe(800);
		});
	});
});
