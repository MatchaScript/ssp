import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './column-resizer.svelte.spec-harness.svelte';

describe('<ColumnResizer>', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	beforeEach(() => {
		host = document.createElement('div');
		host.style.width = '900px';
		document.body.appendChild(host);
		if (!('setPointerCapture' in HTMLElement.prototype)) {
			const proto = HTMLElement.prototype as unknown as {
				setPointerCapture: (id: number) => void;
				releasePointerCapture: (id: number) => void;
			};
			proto.setPointerCapture = () => {};
			proto.releasePointerCapture = () => {};
		}
		component = mount(Harness, { target: host, props: {} });
		flushSync();
	});
	afterEach(() => {
		unmount(component);
		host.remove();
	});

	it('renders one resizer per allowsResizing column', () => {
		expect(host.querySelectorAll('[data-spectrum-table-view-resizer]')).toHaveLength(2);
	});

	it('renders a hidden range input with min/max/value', () => {
		const input = host.querySelector(
			'[data-spectrum-table-view-resizer-input]'
		) as HTMLInputElement | null;
		expect(input).toBeTruthy();
		expect(input!.type).toBe('range');
		expect(parseInt(input!.value, 10)).toBeGreaterThan(0);
	});

	it('Enter on the outer div starts resize and focuses the input', () => {
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		resizer.focus();
		resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		flushSync();
		expect(resizer.getAttribute('data-resizing')).toBe('');
		expect(document.activeElement?.matches('[data-spectrum-table-view-resizer-input]')).toBe(true);
	});

	it('Escape on the input exits resize mode', () => {
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		const input = resizer.querySelector('[data-spectrum-table-view-resizer-input]') as HTMLInputElement;
		resizer.focus();
		resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		flushSync();
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		flushSync();
		expect(resizer.hasAttribute('data-resizing')).toBe(false);
	});

	it('pointer drag updates aria-valuetext', () => {
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		const input = resizer.querySelector('[data-spectrum-table-view-resizer-input]') as HTMLInputElement;
		const before = input.getAttribute('aria-valuetext');

		resizer.dispatchEvent(
			new PointerEvent('pointerdown', { pointerId: 1, clientX: 200, button: 0, bubbles: true })
		);
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 280 }));
		flushSync();
		window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 280 }));
		flushSync();

		const after = input.getAttribute('aria-valuetext');
		expect(after).not.toBe(before);
	});
});
