import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './row-order.svelte.spec-harness.svelte';

type Row = { id: string; a: string; b: string; c: string };

function rowEls(host: HTMLElement): HTMLElement[] {
	return Array.from(host.querySelectorAll('tr[data-spectrum-table-view-row]'));
}

function announcerText(): string {
	const root = document.querySelector('[data-ssp-announcer]');
	return root?.textContent?.trim() ?? '';
}

describe('TableView row order follows `items`, not registration order', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;
	const props = $state<{ rows: Row[] }>({ rows: [] });

	const initial: Row[] = [
		{ id: 'A', a: 'A', b: 'b0', c: 'c0' },
		{ id: 'B', a: 'B', b: 'b1', c: 'c1' },
		{ id: 'C', a: 'C', b: 'b2', c: 'c2' }
	];

	// Keyed `{#each}` moves the existing `<tr>` nodes instead of re-creating
	// them, so registration order stays at mount order. Everything
	// position-aware has to read the `items` array to see the new order.
	function reorder(next: Row[]): void {
		props.rows = next;
		flushSync();
	}

	beforeEach(() => {
		host = document.createElement('div');
		host.style.width = '900px';
		document.body.appendChild(host);
		props.rows = [...initial];
		component = mount(Harness, { target: host, props });
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
		document.querySelector('[data-ssp-announcer]')?.remove();
	});

	it('cell-mode typeahead matches the first row in `items` after a reorder', () => {
		// Two rows share the textValue prefix "Foo": the later-mounted one is
		// made first by the reorder. Typeahead must land on the first match in
		// `items` order.
		const foo: Row[] = [
			{ id: 'first', a: 'Foo One', b: 'x', c: 'x' },
			{ id: 'second', a: 'Foo Two', b: 'y', c: 'y' }
		];
		reorder(foo);
		// Reorder so "second" (Foo Two) comes first.
		reorder([foo[1], foo[0]]);

		const rows = rowEls(host);
		expect(rows[0].getAttribute('data-key')).toBe('second');

		// Enter cell mode on the first row via ArrowRight, then type the shared
		// prefix. The match should be that same row's cell.
		const firstRow = rows[0];
		firstRow.focus();
		firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();

		const activeCell = document.activeElement as HTMLElement;
		expect(activeCell.getAttribute('role')).toBe('rowheader');

		activeCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'F', bubbles: true }));
		flushSync();

		const matchedRow = (document.activeElement as HTMLElement).closest(
			'tr[data-spectrum-table-view-row]'
		);
		expect(matchedRow?.getAttribute('data-key')).toBe('second');
	});
});

describe('TableView.announceRowFocus uses `items` order', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;
	const props = $state<{ rows: Row[]; selectionMode: 'multiple' }>({
		rows: [],
		selectionMode: 'multiple'
	});

	const initial: Row[] = [
		{ id: 'A', a: 'Alpha', b: 'b0', c: 'c0' },
		{ id: 'B', a: 'Bravo', b: 'b1', c: 'c1' },
		{ id: 'C', a: 'Charlie', b: 'b2', c: 'c2' }
	];

	function reorder(next: Row[]): void {
		props.rows = next;
		flushSync();
	}

	beforeEach(() => {
		host = document.createElement('div');
		host.style.width = '900px';
		document.body.appendChild(host);
		props.rows = [...initial];
		component = mount(Harness, { target: host, props });
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
		document.querySelector('[data-ssp-announcer]')?.remove();
	});

	it('announces the first row as "row 1 of 3" after a reorder', () => {
		// Reorder to [C, B, A]. "Charlie" mounted last but is now first in
		// `items`. Tabbing into the table rolls focus onto the first row and
		// announces its position: announceRowFocus must report the `items`
		// position — "row 1 of 3" — not Charlie's registration position.
		reorder([initial[2], initial[1], initial[0]]);

		const rows = rowEls(host);
		expect(rows[0].getAttribute('data-key')).toBe('C');

		const table = host.querySelector('table[role="grid"]') as HTMLElement;
		table.focus();
		table.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		flushSync();

		expect(announcerText()).toContain('Charlie, row 1 of 3');
	});
});

describe('ARIA index attributes belong to a virtualized collection only', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	beforeEach(() => {
		host = document.createElement('div');
		host.style.width = '900px';
		document.body.appendChild(host);
		component = mount(Harness, {
			target: host,
			props: {
				rows: [
					{ id: 'r0', a: 'a0', b: 'b0', c: 'c0' },
					{ id: 'r1', a: 'a1', b: 'b1', c: 'c1' }
				],
				selectionMode: 'multiple'
			}
		});
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
	});

	it('a fully rendered table emits none of them, and its column headers all keep aria-colindex', () => {
		// They describe a collection larger than the DOM. A table that renders
		// every row it has is not one, and the counts go wrong the moment they
		// disagree with what is rendered.
		const table = host.querySelector('table[role="grid"]')!;
		expect(table.hasAttribute('aria-rowcount')).toBe(false);
		expect(table.hasAttribute('aria-colcount')).toBe(false);
		expect(host.querySelectorAll('tr[aria-rowindex]')).toHaveLength(0);

		// The column headers are the exception — upstream emits theirs
		// unconditionally too, and the selection column is one of them.
		const withColIndex = Array.from(host.querySelectorAll('[aria-colindex]'));
		const headers = Array.from(
			host.querySelectorAll(
				'[data-spectrum-table-view-column], [data-spectrum-table-view-checkbox-header]'
			)
		);
		expect(headers).toHaveLength(4);
		expect(withColIndex).toEqual(headers);
	});
});

describe('TableView hidden columns keep cells and <col> aligned', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;
	const props = $state<{ rows: Row[]; hiddenColumns: string[] }>({ rows: [], hiddenColumns: [] });

	const rows: Row[] = [
		{ id: 'r0', a: 'a0', b: 'b0', c: 'c0' },
		{ id: 'r1', a: 'a1', b: 'b1', c: 'c1' }
	];

	function colIds(): (string | null)[] {
		return Array.from(host.querySelectorAll('col[data-spectrum-table-view-col]')).map((col) =>
			col.getAttribute('data-column-id')
		);
	}

	function firstRowCells(): HTMLElement[] {
		return Array.from(rowEls(host)[0].querySelectorAll('[data-spectrum-table-view-cell]'));
	}

	// Every cell carries `${rowDomId}-cell-${columnId}`, so the tail of its id is
	// the column it claims to belong to. That is the binding the row's
	// `aria-labelledby` and the keyboard delegate both rely on.
	function cellColumnIds(): string[] {
		return firstRowCells().map((cell) => cell.id.slice(cell.id.lastIndexOf('-cell-') + 6));
	}

	beforeEach(() => {
		host = document.createElement('div');
		host.style.width = '900px';
		document.body.appendChild(host);
		props.rows = [...rows];
		props.hiddenColumns = [];
		component = mount(Harness, { target: host, props });
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
	});

	it('drops a hidden middle column from the cells and the colgroup together', () => {
		expect(colIds()).toEqual(['a', 'b', 'c']);
		expect(cellColumnIds()).toEqual(['a', 'b', 'c']);

		// Hiding the middle column removes both its `<col>` and its cells. The
		// trailing column must slide into the vacated slot on both sides at
		// once — cells name their column, so nothing is resolved by markup
		// position.
		props.hiddenColumns = ['b'];
		flushSync();

		expect(colIds()).toEqual(['a', 'c']);
		expect(firstRowCells().map((cell) => cell.textContent?.trim())).toEqual(['a0', 'c0']);
		// The surviving cells still name 'a' and 'c'. Position moved; binding did
		// not — which is the property the removed `aria-colindex` used to stand in
		// for, and the one the row's `aria-labelledby` actually needs.
		expect(cellColumnIds()).toEqual(['a', 'c']);
		expect(rowEls(host)[0].getAttribute('aria-labelledby')).toBe(firstRowCells()[0].id);
	});
});
