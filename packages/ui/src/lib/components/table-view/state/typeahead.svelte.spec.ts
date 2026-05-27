import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from '../column-resizer.svelte.spec-harness.svelte';

describe('cell-mode typeahead', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	beforeEach(() => {
		host = document.createElement('div');
		host.style.width = '900px';
		document.body.appendChild(host);
		component = mount(Harness, { target: host, props: { selectionMode: 'multiple' } });
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
	});

	it('matches the row textValue while in cell-mode and focuses the same column', () => {
		// Use ArrowRight from the first row to enter cell mode. With selectionMode
		// 'multiple', the first ArrowRight lands on the synthetic selection column
		// (gridcell); a second ArrowRight reaches the rowheader column "a".
		const firstRow = host.querySelector('tr[data-spectrum-table-view-row]') as HTMLElement;
		firstRow.focus();
		firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();
		(document.activeElement as HTMLElement).dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
		);
		flushSync();

		const activeCell = document.activeElement as HTMLElement;
		expect(activeCell.getAttribute('role')).toBe('rowheader');

		// Type "a2" — rowheader cells contain "a0", "a1", "a2", so two chars are
		// needed to uniquely identify the third row.
		activeCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
		flushSync();
		activeCell.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
		flushSync();

		const next = document.activeElement as HTMLElement;
		expect(next.tagName.toLowerCase()).toMatch(/^(th|td)$/);
		expect(next.textContent?.trim().startsWith('a2')).toBe(true);
	});
});
