import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './source-release.svelte.spec-harness.svelte';

/**
 * Rows and columns are supplied by <Body> / <Header> rather than registered
 * per element, so their removal has to release the source. Otherwise the table
 * keeps reporting rows and columns that are no longer rendered.
 */
describe('data sources are released when Body / Header unmount', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	afterEach(() => {
		unmount(component);
		host.remove();
	});

	function render(props: { showHeader?: boolean; showBody?: boolean } = {}) {
		host = document.createElement('div');
		document.body.appendChild(host);
		const state = $state({ showHeader: true, showBody: true, ...props });
		component = mount(Harness, { target: host, props: state });
		flushSync();
		return state;
	}

	const table = () => host.querySelector('table[role="grid"]') as HTMLElement;

	it('drops the rows when the body goes away', () => {
		const props = render();
		expect(table().getAttribute('aria-rowcount')).toBe('4');

		props.showBody = false;
		flushSync();

		expect(host.querySelector('tbody')).toBeNull();
		expect(table().getAttribute('aria-rowcount')).toBe('1');
	});

	it('does not select rows that are no longer rendered', () => {
		const props = render();
		props.showBody = false;
		flushSync();

		const selectAll = host.querySelector(
			'th[data-spectrum-table-view-checkbox-header]'
		) as HTMLElement;
		selectAll.click();
		flushSync();

		expect(host.querySelectorAll('tr[data-selected]')).toHaveLength(0);
	});

	it('drops the columns when the header goes away', () => {
		const props = render();
		expect(host.querySelectorAll('col[data-column-id]')).toHaveLength(2);

		props.showHeader = false;
		flushSync();

		expect(host.querySelector('thead')).toBeNull();
		expect(host.querySelectorAll('col[data-column-id]')).toHaveLength(0);
		// The synthetic selection column survives — it comes from `selectionMode`,
		// not from the header — so one column of content is still rendered.
		expect(table().getAttribute('aria-colcount')).toBe('1');
	});
});
