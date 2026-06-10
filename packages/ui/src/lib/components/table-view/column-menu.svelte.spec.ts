import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './column-menu.svelte.spec-harness.svelte';

const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

function openColumnMenu(host: HTMLElement): HTMLElement {
	const trigger = host.querySelector(
		'[data-spectrum-table-view-column-menu-trigger]'
	) as HTMLElement;
	trigger.click();
	flushSync();
	const menu = document.querySelector('[data-spectrum-menu][data-popover]') as HTMLElement;
	expect(menu).toBeTruthy();
	return menu;
}

function resizeItem(menu: HTMLElement): HTMLElement {
	const items = Array.from(menu.querySelectorAll('[data-spectrum-menu-item]')) as HTMLElement[];
	const item = items.find((el) => el.textContent?.trim() === 'Resize column');
	expect(item).toBeTruthy();
	return item!;
}

describe('<ColumnMenu> resize entry', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	beforeEach(() => {
		host = document.createElement('div');
		host.style.width = '900px';
		document.body.appendChild(host);
		component = mount(Harness, { target: host, props: {} });
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
	});

	it('click on "Resize column" enters resize mode and focuses the resizer input', async () => {
		const menu = openColumnMenu(host);
		resizeItem(menu).click();
		flushSync();
		await flushMicrotasks();
		flushSync();

		expect(host.querySelector('[data-spectrum-table-view-resizer][data-resizing]')).toBeTruthy();
		expect(document.activeElement?.matches('[data-spectrum-table-view-resizer-input]')).toBe(true);
	});

	it('keyboard Enter on "Resize column" enters resize mode and focuses the resizer input', async () => {
		const menu = openColumnMenu(host);
		const item = resizeItem(menu);
		item.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		flushSync();
		menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		flushSync();
		await flushMicrotasks();
		flushSync();

		expect(host.querySelector('[data-spectrum-table-view-resizer][data-resizing]')).toBeTruthy();
		expect(document.activeElement?.matches('[data-spectrum-table-view-resizer-input]')).toBe(true);
	});
});
