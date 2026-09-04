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

	it('drops the rows when the body goes away', () => {
		const props = render();
		expect(host.querySelectorAll('tr[data-spectrum-table-view-row]')).toHaveLength(3);
		expect(host.querySelector('[data-spectrum-table-view-empty-state]')).toBeNull();

		props.showBody = false;
		flushSync();

		// Root renders the empty state off its own reading of the row source, so
		// the message appearing is what says the source was released — an
		// unmounted `<tbody>` on its own would only say the markup is gone.
		expect(host.querySelector('[data-spectrum-table-view-body]')).toBeNull();
		expect(host.querySelector('[data-spectrum-table-view-empty-state]')?.textContent?.trim()).toBe(
			'Nothing here'
		);
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
		// The colgroup is rendered from the same column list the rest of the table
		// navigates, so what is left in it is what the table still believes it
		// has: the synthetic selection column, which comes from `selectionMode`
		// rather than from the header.
		expect(host.querySelectorAll('col')).toHaveLength(1);
		expect(host.querySelector('col[data-spectrum-table-view-checkbox-col]')).not.toBeNull();
	});
});
