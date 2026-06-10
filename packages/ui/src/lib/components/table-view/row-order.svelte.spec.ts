import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './row-order.svelte.spec-harness.svelte';

type Row = { id: string; a: string; b: string };

const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

function rowEls(host: HTMLElement): HTMLElement[] {
	return Array.from(host.querySelectorAll('tr[data-spectrum-table-view-row]'));
}

function announcerText(): string {
	const root = document.querySelector('[data-ssp-announcer]');
	return root?.textContent?.trim() ?? '';
}

describe('TableView row order follows the DOM, not registration order', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;
	const props = $state<{ rows: Row[] }>({ rows: [] });

	const initial: Row[] = [
		{ id: 'A', a: 'A', b: 'b0' },
		{ id: 'B', a: 'B', b: 'b1' },
		{ id: 'C', a: 'C', b: 'b2' }
	];

	// The MutationObserver that drives DOM-order re-derivation fires on a
	// microtask after the DOM mutation. Flush the Svelte reorder, let the
	// observer callback run, then flush again so consumers re-read the bumped
	// version.
	async function reorder(next: Row[]): Promise<void> {
		props.rows = next;
		flushSync();
		await flushMicrotasks();
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

	it('aria-rowindex tracks DOM order after a keyed reorder', async () => {
		// Reorder the rows to C, B, A. Keyed `{#each}` moves the existing `<tr>`
		// nodes without re-registering, so registration order still reads A,B,C.
		await reorder([initial[2], initial[1], initial[0]]);

		const rows = rowEls(host);
		// Body rows start at aria-rowindex 2 (the header row is 1).
		expect(rows[0].getAttribute('data-key')).toBe('C');
		expect(rows[0].getAttribute('aria-rowindex')).toBe('2');
		expect(rows[1].getAttribute('aria-rowindex')).toBe('3');
		expect(rows[2].getAttribute('data-key')).toBe('A');
		expect(rows[2].getAttribute('aria-rowindex')).toBe('4');
	});

	it('cell-mode typeahead matches the visually-first row after a reorder', async () => {
		// Two rows share the textValue prefix "Foo": the later-mounted one is
		// made visually first by the reorder. Typeahead must land on the
		// visually-first match.
		await reorder([
			{ id: 'first', a: 'Foo One', b: 'x' },
			{ id: 'second', a: 'Foo Two', b: 'y' }
		]);
		// Reorder so "second" (Foo Two) is visually first.
		await reorder([
			{ id: 'second', a: 'Foo Two', b: 'y' },
			{ id: 'first', a: 'Foo One', b: 'x' }
		]);

		const rows = rowEls(host);
		expect(rows[0].getAttribute('data-key')).toBe('second');

		// Enter cell mode on the visually-first row via ArrowRight, then type the
		// shared prefix. The match should be the visually-first row's cell.
		const firstVisualRow = rows[0];
		firstVisualRow.focus();
		firstVisualRow.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
		);
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

describe('TableView.announceRowFocus uses DOM order', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;
	const props = $state<{ rows: Row[]; selectionMode: 'multiple' }>({
		rows: [],
		selectionMode: 'multiple'
	});

	const initial: Row[] = [
		{ id: 'A', a: 'Alpha', b: 'b0' },
		{ id: 'B', a: 'Bravo', b: 'b1' },
		{ id: 'C', a: 'Charlie', b: 'b2' }
	];

	async function reorder(next: Row[]): Promise<void> {
		props.rows = next;
		flushSync();
		await flushMicrotasks();
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

	it('announces the visually-first row as "row 1 of 3" after a reorder', async () => {
		// Reorder to [C, B, A]. "Charlie" mounted last but is now visually first.
		// Tabbing into the table rolls focus onto the first DOM row and announces
		// its position. announceRowFocus must report DOM order — "row 1 of 3" —
		// not Charlie's mount position (it mounted third). Pre-fix it read mount
		// order off #rowEntries and announced "row 3 of 3".
		await reorder([initial[2], initial[1], initial[0]]);

		const rows = rowEls(host);
		expect(rows[0].getAttribute('data-key')).toBe('C');

		const table = host.querySelector('table[role="grid"]') as HTMLElement;
		table.focus();
		table.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		flushSync();

		expect(announcerText()).toContain('Charlie, row 1 of 3');
	});
});
