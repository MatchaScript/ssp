import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import { TableState, SELECTION_COLUMN_ID, type TableStateOptions } from './table-state.svelte.js';
import type { ColumnDescriptor } from './collection.js';

function withRoot<T>(fn: () => T): T {
	let result!: T;
	const teardown = $effect.root(() => {
		result = fn();
	});
	teardown();
	return result;
}

const COLUMN = (id: string): ColumnDescriptor => ({
	id,
	isRowHeader: false,
	allowsSorting: false,
	allowsHiding: false,
	allowsResizing: false
});

function createState(overrides: Partial<TableStateOptions> = {}): TableState<unknown> {
	return new TableState<unknown>({
		density: 'regular',
		isQuiet: false,
		overflowMode: 'truncate',
		isDisabled: false,
		disabledKeys: new Set<string>(),
		selectionMode: 'multiple',
		selectedKeys: new Set<string>(),
		setSelectedKeys: () => {},
		disallowEmptySelection: false,
		sortDescriptor: undefined,
		setSortDescriptor: () => {},
		hiddenColumns: new Set<string>(),
		setHiddenColumns: () => {},
		columnFilters: [],
		setColumnFilters: () => {},
		tableWidth: 900,
		...overrides
	});
}

describe('TableState column layout integration', () => {
	it('sizes the selection column in the layout so widths sum to the table width', () => {
		withRoot(() => {
			const state = createState({ selectionMode: 'multiple' });
			state.registerColumn(COLUMN('a'));
			state.registerColumn(COLUMN('b'));
			state.registerColumn(COLUMN('c'));
			flushSync();

			expect(state.columnWidth(SELECTION_COLUMN_ID)).toBe(40);
			const userSum = state.columnWidth('a') + state.columnWidth('b') + state.columnWidth('c');
			expect(userSum).toBe(860);
		});
	});

	it('gives user columns the full table width when selection is off', () => {
		withRoot(() => {
			const state = createState({ selectionMode: 'none' });
			state.registerColumn(COLUMN('a'));
			state.registerColumn(COLUMN('b'));
			state.registerColumn(COLUMN('c'));
			flushSync();

			expect(state.columnWidth('a')).toBe(300);
			expect(state.columnWidth('b')).toBe(300);
			expect(state.columnWidth('c')).toBe(300);
		});
	});
});
