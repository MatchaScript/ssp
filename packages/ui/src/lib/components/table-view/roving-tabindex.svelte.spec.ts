import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './roving-tabindex.svelte.spec-harness.svelte';

/**
 * CHARACTERIZATION tests for TableView's roving tabindex + highlight state.
 *
 * These pin what the widget does *today*, straight off the rendered DOM, so a
 * refactor of `SelectableCollection` (controllable highlight, single internal
 * write path) cannot change observable behaviour silently. They are not a
 * statement of what the behaviour ought to be — see the notes on the disabled
 * row and on the tab-stop count below, both of which record something the
 * shared primitive's own doc comment describes differently.
 *
 * Every assertion reads the tabindex ATTRIBUTE (`getAttribute`), never the
 * `.tabIndex` property: a missing attribute and `tabindex="-1"` both report
 * `-1` as a property, and the difference between them is exactly what the
 * primitive claims to encode.
 */

type Row = { id: string; a: string; b: string; c: string };

const ROWS: Row[] = [
	{ id: 'r0', a: 'Alpha', b: 'b0', c: 'c0' },
	{ id: 'r1', a: 'Bravo', b: 'b1', c: 'c1' },
	{ id: 'r2', a: 'Charlie', b: 'b2', c: 'c2' }
];

type HarnessProps = {
	rows: Row[];
	selectionMode?: 'none' | 'single' | 'multiple';
	disabledKeys?: string[];
	withColumnFeatures?: boolean;
};

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

function render(overrides: Partial<HarnessProps> = {}): HarnessProps {
	host = document.createElement('div');
	host.style.width = '900px';
	document.body.appendChild(host);
	const props = $state<HarnessProps>({ rows: ROWS.map((r) => ({ ...r })), ...overrides });
	component = mount(Harness, { target: host, props });
	flushSync();
	return props;
}

afterEach(() => {
	unmount(component);
	host.remove();
	document.querySelector('[data-ssp-announcer]')?.remove();
});

const table = () => host.querySelector<HTMLElement>('table[role="grid"]')!;
const rows = () =>
	Array.from(host.querySelectorAll<HTMLElement>('tr[data-spectrum-table-view-row]'));
const row = (key: string) => host.querySelector<HTMLElement>(`tr[data-key="${key}"]`)!;
const cells = (scope: ParentNode = host) =>
	Array.from(scope.querySelectorAll<HTMLElement>('[data-spectrum-table-view-cell]'));
const checkboxCells = () =>
	Array.from(host.querySelectorAll<HTMLElement>('[data-spectrum-table-view-checkbox-cell]'));
const columnHeaders = () =>
	Array.from(host.querySelectorAll<HTMLElement>('[data-spectrum-table-view-column]'));
const tabindexes = (els: Element[]) => els.map((el) => el.getAttribute('tabindex'));

/** Tab into the table. `focusin` on the `<table>` rolls the highlight onto the first enabled row. */
function enterTable(): void {
	table().focus();
	flushSync();
}

function press(key: string): void {
	(document.activeElement as HTMLElement).dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true })
	);
	flushSync();
}

describe('resting state: nothing inside the table is focused', () => {
	it('the <table> carries the only tabindex="0"; rows, cells and headers are all "-1"', () => {
		render();

		expect(document.activeElement).toBe(document.body);
		expect(table().getAttribute('tabindex')).toBe('0');

		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);
		expect(tabindexes(cells())).toEqual(Array(9).fill('-1'));
		expect(tabindexes(checkboxCells())).toEqual(['-1', '-1', '-1']);
		expect(tabindexes(columnHeaders())).toEqual(['-1', '-1', '-1']);
		expect(
			host.querySelector('[data-spectrum-table-view-checkbox-header]')!.getAttribute('tabindex')
		).toBe('-1');
	});

	it('with selectionMode="none" the <table> is not a tab stop either', () => {
		render({ selectionMode: 'none' });

		// `tableTabIndex` is gated on `isInteractive`; a non-selectable table
		// keeps the attribute but parks it at -1.
		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);
	});
});

describe('highlight on a row', () => {
	it('moves the tab stop off the <table> and onto the highlighted <tr>', () => {
		render();
		enterTable();

		// Tabbing in rolls the highlight onto the first enabled row, which then
		// owns the stop; the container drops out.
		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(document.activeElement).toBe(row('r0'));
		expect(row('r0').getAttribute('data-focused')).toBe('true');

		// Row-mode highlight leaves the cells alone — they only become tab stops
		// in cell mode.
		expect(tabindexes(cells())).toEqual(Array(9).fill('-1'));
		expect(tabindexes(checkboxCells())).toEqual(['-1', '-1', '-1']);
	});

	it('ArrowDown / ArrowUp move tabindex="0" and document.activeElement together', () => {
		render();
		enterTable();

		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));
		expect(table().getAttribute('tabindex')).toBe('-1');

		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		expect(document.activeElement).toBe(row('r2'));

		// `shouldFocusWrap: false` — ArrowDown at the end is a no-op, not a wrap.
		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		expect(document.activeElement).toBe(row('r2'));

		press('ArrowUp');
		expect(tabindexes(rows())).toEqual(['-1', '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));
		expect(table().getAttribute('tabindex')).toBe('-1');
	});

	it('End / Home jump the tab stop to the last / first row', () => {
		render();
		enterTable();

		press('End');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		expect(document.activeElement).toBe(row('r2'));

		press('Home');
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(document.activeElement).toBe(row('r0'));
	});
});

describe('disabled rows', () => {
	it('a disabled row still carries tabindex="-1" — the attribute is present, not omitted', () => {
		render({ disabledKeys: ['r1'] });

		// NOTE: this is the current behaviour and it CONTRADICTS the roving-
		// tabindex contract documented on `SelectableCollection.itemTabIndex`,
		// which returns `undefined` for a disabled item so the attribute is left
		// off entirely. `<TableView.Row>` never calls `itemTabIndex`; it renders
		// `tabindex={isRowKeyboardTarget ? 0 : -1}`, so a disabled row is still
		// programmatically focusable. Pinned as-is.
		expect(row('r1').hasAttribute('tabindex')).toBe(true);
		expect(row('r1').getAttribute('tabindex')).toBe('-1');
		expect(row('r1').getAttribute('aria-disabled')).toBe('true');
		expect(tabindexes(cells(row('r1')))).toEqual(['-1', '-1', '-1']);
	});

	it('a disabled row cannot take the highlight — ArrowDown steps over it', () => {
		render({ disabledKeys: ['r1'] });
		enterTable();

		expect(document.activeElement).toBe(row('r0'));

		press('ArrowDown');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '0']);
		expect(document.activeElement).toBe(row('r2'));
		expect(row('r1').hasAttribute('data-focused')).toBe(false);

		press('ArrowUp');
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(document.activeElement).toBe(row('r0'));
		expect(row('r1').hasAttribute('data-focused')).toBe(false);
	});

	it('tabbing in skips a disabled first row and highlights the first enabled one', () => {
		render({ disabledKeys: ['r0'] });
		enterTable();

		expect(tabindexes(rows())).toEqual(['-1', '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));
	});
});

describe('unmounting the currently-highlighted row', () => {
	it('hands the tab stop back to the <table> and leaves every remaining row at "-1"', () => {
		const props = render();
		enterTable();
		press('ArrowDown');

		expect(tabindexes(rows())).toEqual(['-1', '0', '-1']);
		expect(document.activeElement).toBe(row('r1'));

		// The row's registration cleanup clears `highlightedId` when the
		// unmounting row is the highlighted one, so the container's
		// `highlightedId === null` branch takes the stop back.
		props.rows = props.rows.filter((r) => r.id !== 'r1');
		flushSync();

		expect(rows().map((el) => el.getAttribute('data-key'))).toEqual(['r0', 'r2']);
		expect(table().getAttribute('tabindex')).toBe('0');
		expect(tabindexes(rows())).toEqual(['-1', '-1']);
		expect(rows().some((el) => el.hasAttribute('data-focused'))).toBe(false);
		// Focus is not moved anywhere by the teardown — the browser drops it to
		// <body> because the focused element left the document.
		expect(document.activeElement).toBe(document.body);
	});

	it('unmounting a NON-highlighted row leaves the highlight (and the tab stop) where it was', () => {
		const props = render();
		enterTable();
		press('ArrowDown');
		expect(document.activeElement).toBe(row('r1'));

		props.rows = props.rows.filter((r) => r.id !== 'r2');
		flushSync();

		expect(table().getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['-1', '0']);
		expect(document.activeElement).toBe(row('r1'));
	});
});

describe('cell mode', () => {
	it('ArrowRight moves the tab stop off the <tr> and onto a cell', () => {
		render();
		enterTable();
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);

		press('ArrowRight');

		// Leading nav column is the synthetic selection column, so the first
		// cell-mode stop is the row's checkbox `<td>`, not the rowheader.
		const target = document.activeElement as HTMLElement;
		expect(target.hasAttribute('data-spectrum-table-view-checkbox-cell')).toBe(true);
		expect(target.closest('tr')).toBe(row('r0'));
		expect(target.getAttribute('tabindex')).toBe('0');

		// The row keeps the highlight (`data-focused`) but surrenders the stop,
		// and the container stays out because a row is still highlighted.
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);
		expect(row('r0').getAttribute('data-focused')).toBe('true');
		expect(table().getAttribute('tabindex')).toBe('-1');
		// Exactly one cell-level stop across the whole table.
		expect(tabindexes([...checkboxCells(), ...cells()]).filter((t) => t === '0')).toHaveLength(1);

		press('ArrowRight');
		const second = document.activeElement as HTMLElement;
		expect(second.getAttribute('role')).toBe('rowheader');
		expect(second.getAttribute('tabindex')).toBe('0');
		expect(checkboxCells()[0].getAttribute('tabindex')).toBe('-1');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);
	});

	it('Escape returns the tab stop from the cell to the <tr>', () => {
		render();
		enterTable();
		press('ArrowRight');
		expect(tabindexes(rows())).toEqual(['-1', '-1', '-1']);

		press('Escape');
		expect(document.activeElement).toBe(row('r0'));
		expect(tabindexes(rows())).toEqual(['0', '-1', '-1']);
		expect(tabindexes(checkboxCells())).toEqual(['-1', '-1', '-1']);
		expect(table().getAttribute('tabindex')).toBe('-1');
	});
});

describe('how many tab stops the widget actually exposes', () => {
	/** Every natively-focusable element, minus the ones explicitly parked at -1. */
	const FOCUSABLE_SELECTOR =
		'a[href], area[href], button, input, select, textarea, iframe, [tabindex], [contenteditable]';
	function tabStops(): HTMLElement[] {
		return Array.from(host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
			if (el.getAttribute('tabindex') === '-1') return false;
			return !(el as HTMLButtonElement | HTMLInputElement).disabled;
		});
	}

	it('a table with a resizable column and a column menu currently has 5 tab stops', () => {
		render({ withColumnFeatures: true });

		// EXPECTED TO CHANGE: the SelectableCollection refactor is meant to bring
		// this down to 1 (the widget as a whole being a single tab stop). Today
		// the resizer handle, the visually-hidden range input inside it, and each
		// column-menu trigger are all reachable with Tab alongside the <table>.
		// The range input carries NO tabindex attribute at all and is tabbable on
		// native focusability alone.
		expect(
			tabStops().map(
				(el) =>
					`${el.tagName.toLowerCase()}[tabindex=${el.getAttribute('tabindex')}] ${
						el.getAttribute('aria-label') ??
						(el.hasAttribute('data-spectrum-table-view-resizer') ? 'resizer handle' : el.tagName)
					}`
			)
		).toEqual([
			'table[tabindex=0] roving',
			'button[tabindex=0] Column menu',
			'div[tabindex=0] resizer handle',
			'input[tabindex=null] Column resizer',
			'button[tabindex=0] Column menu'
		]);
		expect(tabStops()).toHaveLength(5);
	});

	it('a plain table (no resizer, no column menu) is a single tab stop', () => {
		render();

		expect(tabStops()).toHaveLength(1);
		expect(tabStops()[0]).toBe(table());
	});
});
