import 'virtual:ssp/theme.css';
import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './side-nav-columns.svelte.spec-harness.svelte';

/**
 * A section drops the icon column when none of its items has an icon, so the
 * subgrid is four tracks in one case and three in the other. Text and suffix
 * are placed from the end of the subgrid to land on the right track either
 * way — pinning them to columns 3 and 4 put the label in the suffix track and
 * pushed the suffix into an implicit fifth column whenever the icon column was
 * dropped.
 */

let host: HTMLDivElement;
let component: ReturnType<typeof mount>;

const NAV_WIDTH = 240;

afterEach(() => {
	unmount(component);
	host.remove();
});

function render() {
	host = document.createElement('div');
	host.style.width = `${NAV_WIDTH}px`;
	document.body.appendChild(host);
	component = mount(Harness, { target: host });
	flushSync();
}

const rect = (selector: string) => host.querySelector(selector)!.getBoundingClientRect();

describe.each([
	{ mode: 'with an icon column', section: 'with-icon', suffix: 'suffix-with-icon' },
	{ mode: 'without an icon column', section: 'without-icon', suffix: 'suffix-without-icon' }
])('$mode', ({ section, suffix }) => {
	const item = `[data-testid="${section}"] [data-spectrum-sidenav-item]`;

	it('gives the label the flexible track', () => {
		render();
		expect(rect(`${item} [data-spectrum-text]`).width).toBeGreaterThan(rect(item).width / 2);
	});

	it('keeps the suffix on the item row at the trailing edge', () => {
		render();
		const suffixRect = rect(`[data-testid="${suffix}"]`);
		expect(suffixRect.left).toBeGreaterThan(rect(`${item} [data-spectrum-text]`).right - 1);
		expect(suffixRect.right).toBeCloseTo(rect(item).right, 0);
	});
});
