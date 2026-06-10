import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { userEvent } from 'vitest/browser';
import Harness from './menu-trigger.svelte.spec-harness.svelte';

const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

function openMenu(host: HTMLElement): { trigger: HTMLElement; menu: HTMLElement } {
	const trigger = host.querySelector('[data-trigger]') as HTMLElement;
	trigger.click();
	flushSync();
	const menu = document.querySelector('[data-spectrum-menu][data-popover]') as HTMLElement;
	expect(menu).toBeTruthy();
	return { trigger, menu };
}

describe('<MenuTrigger> focus restore on close', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		component = mount(Harness, { target: host, props: {} });
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
	});

	it('restores focus to the trigger on Escape', async () => {
		const { trigger, menu } = openMenu(host);
		menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		flushSync();
		await flushMicrotasks();
		flushSync();
		expect(document.activeElement).toBe(trigger);
	});

	it('restores focus to the trigger after light-dismiss (click outside)', async () => {
		const { trigger } = openMenu(host);
		const outsideArea = host.querySelector('[data-outside-area]') as HTMLElement;
		await userEvent.click(outsideArea);
		flushSync();
		await flushMicrotasks();
		flushSync();
		expect(document.activeElement).toBe(trigger);
	});

	it('restores focus to the trigger when an item without focus side effects is selected', async () => {
		const { trigger, menu } = openMenu(host);
		const items = menu.querySelectorAll('[data-spectrum-menu-item]');
		(items[0] as HTMLElement).click();
		flushSync();
		await flushMicrotasks();
		flushSync();
		expect(document.activeElement).toBe(trigger);
	});

	it('does not steal focus when an item action moves focus elsewhere', async () => {
		unmount(component);
		component = mount(Harness, {
			target: host,
			props: { onAction: () => (host.querySelector('[data-outside]') as HTMLElement).focus() }
		});
		flushSync();
		const { trigger, menu } = openMenu(host);
		const items = menu.querySelectorAll('[data-spectrum-menu-item]');
		(items[0] as HTMLElement).click();
		flushSync();
		await flushMicrotasks();
		flushSync();
		expect(document.activeElement).toBe(host.querySelector('[data-outside]'));
		expect(document.activeElement).not.toBe(trigger);
	});
});
