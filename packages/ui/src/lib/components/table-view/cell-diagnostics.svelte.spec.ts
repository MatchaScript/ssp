import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './cell-diagnostics.svelte.spec-harness.svelte';

/**
 * Binding a cell to a column by id moves two mistakes out of the type system's
 * reach, and both are silent at runtime: an unknown id drops the cell out of
 * the nav order, and a duplicate id inside one row gives two cells the same
 * keyboard slot. Dev builds warn about each.
 */
describe('cell column diagnostics (dev only)', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;
	let warn: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});
	afterEach(() => {
		unmount(component);
		host.remove();
		warn.mockRestore();
	});

	it('warns about a column id no column declares', () => {
		component = mount(Harness, { target: host, props: { duplicate: false } });
		flushSync();

		expect(warn.mock.calls.flat().join('\n')).toContain('column="typo"');
	});

	it('warns when one row renders two cells for the same column', () => {
		component = mount(Harness, { target: host, props: { duplicate: true } });
		flushSync();

		expect(warn.mock.calls.flat().join('\n')).toContain('more than one cell for column "a"');
	});
});
