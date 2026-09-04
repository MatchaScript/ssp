import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './chrome-rows.svelte.spec-harness.svelte';
import type { TableViewLoadingState } from './index.js';

/**
 * The loader and empty-state rows are chrome, not data. `<tr>` maps to
 * `role="row"` natively, so without `role="presentation"` a table with nothing
 * in it reports one row to assistive technology and a loading table reports one
 * too many.
 */

type HarnessProps = {
	rows: { id: string; a: string; b: string }[];
	loadingState?: TableViewLoadingState;
};

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

function render(props: HarnessProps) {
	host = document.createElement('div');
	host.style.width = '900px';
	document.body.appendChild(host);
	component = mount(Harness, { target: host, props });
	flushSync();
}

afterEach(() => {
	unmount(component);
	host.remove();
});

const ROWS = [
	{ id: 'r0', a: 'a0', b: 'b0' },
	{ id: 'r1', a: 'a1', b: 'b1' }
];

/** The `<tr>` wrapped around a given chrome `<td>`. */
const chromeRow = (selector: string) => host.querySelector(selector)!.closest('tr')!;

/** Rows assistive technology is actually shown. */
const reportedRows = () => Array.from(host.querySelectorAll('tr:not([role="presentation"])'));

describe('loader and empty-state rows are not reported as rows', () => {
	it('takes the empty-state row out of the row count', () => {
		render({ rows: [] });

		expect(chromeRow('[data-spectrum-table-view-empty-state]').getAttribute('role')).toBe(
			'presentation'
		);
		// Only the header row is left to report.
		expect(reportedRows()).toEqual([host.querySelector('thead tr')]);
	});

	it('takes the loader row out of the row count', () => {
		render({ rows: [], loadingState: 'loading' });

		expect(chromeRow('[data-spectrum-table-view-loader]').getAttribute('role')).toBe(
			'presentation'
		);
		expect(reportedRows()).toEqual([host.querySelector('thead tr')]);
	});

	it('takes the loading-more row out of the row count', () => {
		render({ rows: ROWS, loadingState: 'loadingMore' });

		expect(chromeRow('[data-loading-more]').getAttribute('role')).toBe('presentation');
		// The header row plus the two data rows — the spinner appended below them
		// is not a third.
		expect(reportedRows()).toHaveLength(3);
	});
});
