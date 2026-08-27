import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './row-label.svelte.spec-harness.svelte';

/**
 * How a row gets the name the live region reads out. Two declared stages —
 * `<TableView.Row textValue>`, then the `textValue` of the rowheader cells —
 * and, only when a consumer supplied neither, the rendered text of the
 * rowheader cell.
 *
 * Each variant of the harness leaves the later stages in place with a
 * different text, so what is announced says which stage answered.
 */

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

function render(labelSource: 'row' | 'cell' | 'dom'): void {
	host = document.createElement('div');
	host.style.width = '900px';
	document.body.appendChild(host);
	component = mount(Harness, { target: host, props: { labelSource } });
	flushSync();
}

afterEach(() => {
	unmount(component);
	host.remove();
	document.querySelector('[data-ssp-announcer]')?.remove();
});

/** Tab in: focus lands on the first row and its name is announced. */
function announcementForFirstRow(): string {
	host.querySelector<HTMLElement>('table[role="grid"]')!.focus();
	flushSync();
	return document.querySelector('[data-ssp-announcer]')?.textContent?.trim() ?? '';
}

describe('a row takes its name from the first source that supplies one', () => {
	it('prefers the row own textValue over everything below it', () => {
		render('row');

		// The cells declare "Ada" / "Lovelace" and render "Ada rendered" — neither
		// is what comes out.
		expect(announcementForFirstRow()).toBe('Whole row r0, row 1 of 3');
	});

	it('falls to the rowheader cells textValue, joined, when the row declares none', () => {
		render('cell');

		// Both rowheader columns contribute, in column order. Taking only the
		// first would cut the row's name in half; reading the DOM instead would
		// pick up the "rendered" suffix.
		expect(announcementForFirstRow()).toBe('Ada Lovelace, row 1 of 3');
	});

	it('falls to the rendered rowheader text only when no prop supplied one', () => {
		render('dom');

		// Last resort, so a table written without either prop still announces
		// something a user can recognise.
		expect(announcementForFirstRow()).toBe('Ada rendered, row 1 of 3');
	});
});
