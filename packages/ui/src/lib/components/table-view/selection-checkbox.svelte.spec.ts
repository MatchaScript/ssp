import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './selection-checkbox.svelte.spec-harness.svelte';
import type { TableViewColumn } from './index.js';

/**
 * The selection column is a real `<input type="checkbox">`, not a drawn box.
 * Assertions here read the state a screen reader would be given — accessible
 * name, checkedness, the tri-state of select-all — rather than the pixels.
 */

type Row = { id: string } & Record<string, string>;

type HarnessProps = {
	columns?: TableViewColumn[];
	items?: Row[];
	disabledKeys?: string[];
	disallowEmptySelection?: boolean;
	hideHeader?: boolean;
	selectedKeys?: string[];
};

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

function render(overrides: HarnessProps = {}): HarnessProps {
	host = document.createElement('div');
	host.style.width = '900px';
	document.body.appendChild(host);
	const props = $state<HarnessProps>({ ...overrides });
	component = mount(Harness, { target: host, props });
	flushSync();
	return props;
}

afterEach(() => {
	unmount(component);
	host.remove();
	document.querySelector('[data-ssp-announcer]')?.remove();
});

const row = (key: string) => host.querySelector<HTMLElement>(`tr[data-key="${key}"]`)!;
const rowCheckbox = (key: string) =>
	row(key).querySelector<HTMLInputElement>('input[data-spectrum-table-view-selection-checkbox]')!;
const rowCheckboxCell = (key: string) =>
	row(key).querySelector<HTMLElement>('[data-spectrum-table-view-checkbox-cell]')!;
const selectAllHeader = () =>
	host.querySelector<HTMLElement>('th[data-spectrum-table-view-checkbox-header]')!;
const selectAll = () =>
	selectAllHeader().querySelector<HTMLInputElement>(
		'input[data-spectrum-table-view-selection-checkbox]'
	)!;
const selectedKeys = () =>
	Array.from(host.querySelectorAll('tr[data-selected]')).map((el) => el.getAttribute('data-key'));
const announcerText = () =>
	document.querySelector('[data-ssp-announcer]')?.textContent?.trim() ?? '';

describe('the selection column is reachable by assistive technology', () => {
	it('names each row checkbox after the row it selects', () => {
		render();

		const checkbox = rowCheckbox('r1');
		expect(checkbox.type).toBe('checkbox');
		expect(checkbox.getAttribute('aria-label')).toBe('Select');

		// "Select" on its own says nothing about which row. The name is composed:
		// the checkbox names itself first — `aria-labelledby` is not followed
		// recursively, so that picks up its own `aria-label` — and then the
		// rowheader cells that already name the row.
		const rowHeaderIds = Array.from(
			row('r1').querySelectorAll<HTMLElement>('[data-row-header]')
		).map((cell) => cell.id);
		expect(rowHeaderIds).toHaveLength(2);
		expect(checkbox.getAttribute('aria-labelledby')).toBe(
			`${checkbox.id} ${rowHeaderIds.join(' ')}`
		);
		expect(row('r1').getAttribute('aria-labelledby')).toBe(rowHeaderIds.join(' '));
		expect(
			rowHeaderIds.map((id) => host.querySelector(`#${CSS.escape(id)}`)!.textContent?.trim())
		).toEqual(['Grace', 'Hopper']);
	});

	it('reports its checkedness from the selection, and toggles it exactly once per click', () => {
		render();

		expect(rowCheckbox('r1').checked).toBe(false);

		// The cell is the click target for the whole 40px column, and the
		// checkbox sits inside it: a click on either has to produce one toggle,
		// not two.
		rowCheckboxCell('r1').click();
		flushSync();
		expect(selectedKeys()).toEqual(['r1']);
		expect(rowCheckbox('r1').checked).toBe(true);

		rowCheckbox('r1').click();
		flushSync();
		expect(selectedKeys()).toEqual([]);
		expect(rowCheckbox('r1').checked).toBe(false);

		rowCheckbox('r1').click();
		flushSync();
		expect(selectedKeys()).toEqual(['r1']);
		expect(rowCheckbox('r1').checked).toBe(true);
	});

	it('keeps showing the selection when the toggle is refused', () => {
		render({ disallowEmptySelection: true });

		rowCheckbox('r0').click();
		flushSync();
		expect(selectedKeys()).toEqual(['r0']);

		// Deselecting the last row is refused. A checkbox left to toggle itself
		// would now read unchecked while the row is still selected.
		rowCheckbox('r0').click();
		flushSync();
		expect(selectedKeys()).toEqual(['r0']);
		expect(rowCheckbox('r0').checked).toBe(true);
	});

	// The activation must run to completion. A cancelled checkbox click makes the
	// browser restore `checked` to its pre-click value once the handlers return,
	// and under a trusted activation — a real press, a screen reader's — Svelte's
	// flush lands between the handler and that restore, so the restore is what
	// the user is left reading. This spec cannot reproduce that timing:
	// `click()` / `dispatchEvent` keep JS on the stack, so the restore happens
	// before any flush and the next flush corrects it. What is checkable, and
	// what the guarantee actually rests on, is that nothing cancels the event.
	it('lets the checkbox activation run to completion instead of cancelling it', () => {
		render({ disallowEmptySelection: true });

		const press = (input: HTMLInputElement) => {
			const event = new MouseEvent('click', { bubbles: true, cancelable: true });
			input.dispatchEvent(event);
			flushSync();
			return event;
		};

		expect(press(rowCheckbox('r0')).defaultPrevented).toBe(false);
		expect(selectedKeys()).toEqual(['r0']);
		// Refused: the row stays selected, so the box has to stay checked.
		expect(press(rowCheckbox('r0')).defaultPrevented).toBe(false);
		expect(rowCheckbox('r0').checked).toBe(true);

		expect(press(selectAll()).defaultPrevented).toBe(false);
		expect(selectedKeys()).toEqual(['r0', 'r1', 'r2']);
		expect(selectAll().checked).toBe(true);
		expect(selectAll().indeterminate).toBe(false);
		// Refused again — clearing everything is what `disallowEmptySelection`
		// forbids, and the header box must not read "unchecked" over a full table.
		expect(press(selectAll()).defaultPrevented).toBe(false);
		expect(selectedKeys()).toEqual(['r0', 'r1', 'r2']);
		expect(selectAll().checked).toBe(true);
		expect(selectAll().indeterminate).toBe(false);
	});

	it('matches the selection after a keyboard toggle in cell mode', () => {
		render();

		// ArrowRight from the row enters cell mode on the leading cell, which is
		// the selection cell. Space there toggles the row without the input ever
		// being activated natively — the checkbox has to follow anyway.
		const target = row('r1');
		target.focus();
		target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();

		expect(document.activeElement).toBe(rowCheckboxCell('r1'));

		rowCheckboxCell('r1').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		flushSync();

		expect(selectedKeys()).toEqual(['r1']);
		expect(rowCheckbox('r1').checked).toBe(true);
		expect(selectAll().indeterminate).toBe(true);
	});

	it('resolves the composed name when a column id carries whitespace', () => {
		// An `id` attribute cannot hold ASCII whitespace, and `aria-labelledby`
		// tokenizes on it — so a raw column id like this one would turn a single
		// reference into two that resolve to nothing, and every row checkbox would
		// read as a bare "Select".
		render({
			columns: [
				{ id: 'full name', label: 'Full name', isRowHeader: true },
				{ id: 'role', label: 'Role' }
			],
			items: [{ id: 'r0', 'full name': 'Ada Lovelace', role: 'Analyst' }]
		});

		const resolve = (attr: string | null) =>
			(attr ?? '')
				.split(' ')
				.filter(Boolean)
				.map((id) => host.querySelector(`#${CSS.escape(id)}`));

		const cellId = row('r0').querySelector<HTMLElement>('[data-row-header]')!.id;
		expect(cellId).not.toMatch(/\s/);
		expect(resolve(row('r0').getAttribute('aria-labelledby'))).toEqual([
			host.querySelector(`#${CSS.escape(cellId)}`)
		]);

		const checkbox = rowCheckbox('r0');
		expect(resolve(checkbox.getAttribute('aria-labelledby'))).toEqual([
			checkbox,
			host.querySelector(`#${CSS.escape(cellId)}`)
		]);
	});

	it('disables the checkbox of a disabled row', () => {
		render({ disabledKeys: ['r1'] });

		expect(rowCheckbox('r1').disabled).toBe(true);
		expect(rowCheckbox('r0').disabled).toBe(false);

		rowCheckbox('r1').click();
		flushSync();
		expect(selectedKeys()).toEqual([]);
	});
});

describe('select-all announces which of its three states it is in', () => {
	it('moves false → mixed → true as rows are selected', () => {
		render();

		const header = selectAll();
		expect(header.getAttribute('aria-label')).toBe('Select all');
		// The name belongs to the control, not to the column header around it —
		// otherwise AT reads it twice before saying anything about the state.
		expect(selectAllHeader().hasAttribute('aria-label')).toBe(false);
		expect(selectAllHeader().getAttribute('role')).toBe('columnheader');
		expect(header.getAttribute('aria-checked')).toBe('false');

		rowCheckbox('r0').click();
		flushSync();
		// Partly selected. Without `mixed` the box reads "not checked", and a
		// screen-reader user cannot tell whether pressing it selects or clears.
		expect(selectAll().getAttribute('aria-checked')).toBe('mixed');
		expect(selectAll().indeterminate).toBe(true);

		rowCheckbox('r1').click();
		rowCheckbox('r2').click();
		flushSync();
		expect(selectAll().getAttribute('aria-checked')).toBe('true');
		expect(selectAll().checked).toBe(true);
		expect(selectAll().indeterminate).toBe(false);
	});

	it('selects and clears every row from the header', () => {
		render();

		selectAllHeader().click();
		flushSync();
		expect(selectedKeys()).toEqual(['r0', 'r1', 'r2']);
		expect(selectAll().getAttribute('aria-checked')).toBe('true');

		selectAll().click();
		flushSync();
		expect(selectedKeys()).toEqual([]);
		expect(selectAll().getAttribute('aria-checked')).toBe('false');
	});

	// Left operable with nothing to select, the control invites a press that
	// changes nothing and announces nothing.
	it('is disabled on an empty table', () => {
		render({ items: [] });
		expect(selectAll().disabled).toBe(true);
	});

	it('is disabled when every row is disabled', () => {
		render({ disabledKeys: ['r0', 'r1', 'r2'] });
		expect(selectAll().disabled).toBe(true);
	});

	it('survives hideHeader — the drawn box goes, the control does not', () => {
		render({ hideHeader: true });

		// `hideHeader` takes the header row out of the visual layout and leaves it
		// in the accessibility tree. Dropping the checkbox with the box would take
		// select-all out of the tree with it.
		expect(selectAllHeader().querySelector('[data-spectrum-checkbox-box]')).toBeNull();
		expect(selectAll().getAttribute('aria-label')).toBe('Select all');
		expect(selectAll().getAttribute('aria-checked')).toBe('false');
	});
});

describe('the live region speaks for selection changes made from inside the table', () => {
	const table = () => host.querySelector<HTMLElement>('table[role="grid"]')!;

	it('stays quiet while focus has never been inside the table', () => {
		const props = render({ selectedKeys: [] });

		// A consumer's own toolbar, a filter, a "select all matching" button —
		// none of them are this table talking, and a table that narrates them
		// speaks over whatever the user is actually operating.
		props.selectedKeys = ['r0'];
		flushSync();
		expect(announcerText()).toBe('');
		expect(selectedKeys()).toEqual(['r0']);

		// The same write, once the keyboard is inside the table.
		table().focus();
		flushSync();
		props.selectedKeys = ['r0', 'r1'];
		flushSync();
		expect(announcerText()).toContain('2 items selected');
	});

	// Entering the table announces the row focus lands on, so "said nothing" is
	// "said nothing further" — the live region keeps what it has already said.
	it('goes quiet again once the user moves focus to something else', () => {
		const props = render({ selectedKeys: [] });
		const after = document.createElement('button');
		document.body.appendChild(after);

		table().focus();
		flushSync();
		after.focus();
		flushSync();
		const before = announcerText();

		props.selectedKeys = ['r0'];
		flushSync();
		expect(announcerText()).toBe(before);

		after.remove();
	});

	it('goes quiet when the user drops focus onto the page background', () => {
		const props = render({ selectedKeys: [] });

		table().focus();
		flushSync();
		// No other focusable element involved, so `activeElement` falls back to
		// `<body>` — the same place it lands when the focused row is removed. What
		// tells the two apart is when the question is asked, not where focus ends
		// up: here focus is already gone before the selection changes.
		(document.activeElement as HTMLElement).blur();
		flushSync();
		expect(document.activeElement).toBe(document.body);
		const before = announcerText();

		props.selectedKeys = ['r0'];
		flushSync();
		expect(announcerText()).toBe(before);
	});

	it('still speaks when the change removes the row that held focus', () => {
		const props = render({
			items: [
				{ id: 'r0', first: 'Ada', last: 'Lovelace', role: 'Analyst' },
				{ id: 'r1', first: 'Grace', last: 'Hopper', role: 'Admiral' },
				{ id: 'r2', first: 'Alan', last: 'Turing', role: 'Fellow' }
			],
			selectedKeys: ['r0', 'r1']
		});

		host.querySelector<HTMLElement>('tr[data-key="r1"]')!.focus();
		flushSync();

		// A "delete selected" the consumer drives from a key handler inside the
		// table: the row leaves `items` and `selectedKeys` in one update. By the
		// time the announcement effect runs the row is gone and `activeElement`
		// has fallen to `<body>` — reading focus at that point rather than before
		// the update would call the user's own deletion someone else's change and
		// stay silent.
		props.items = props.items!.filter((r) => r.id !== 'r1');
		props.selectedKeys = ['r0'];
		flushSync();

		expect(host.querySelector('tr[data-key="r1"]')).toBeNull();
		expect(announcerText()).toContain('1 item selected');
	});
});
