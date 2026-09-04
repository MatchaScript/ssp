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

	it('names each resizer after the column it resizes', () => {
		const headers = Array.from(
			host.querySelectorAll<HTMLElement>('[data-spectrum-table-view-column]')
		);
		expect(headers.map((th) => th.textContent?.trim())).toEqual(['A', 'B', 'C']);
		// Every column header carries an id, which is the only thing that lets a
		// resizer say which column it belongs to.
		expect(headers.every((th) => th.id.length > 0)).toBe(true);
		expect(new Set(headers.map((th) => th.id)).size).toBe(3);

		const inputs = Array.from(
			host.querySelectorAll<HTMLInputElement>('[data-spectrum-table-view-resizer-input]')
		);
		expect(inputs).toHaveLength(2);
		// "Column resizer" alone reads identically on both. The name is composed:
		// the input names itself first (picking up its own `aria-label`, since
		// `aria-labelledby` is not followed recursively) and then its header.
		expect(inputs.map((input) => input.getAttribute('aria-labelledby'))).toEqual([
			`${inputs[0].id} ${headers[0].id}`,
			`${inputs[1].id} ${headers[1].id}`
		]);
		expect(inputs.every((input) => input.getAttribute('aria-label') === 'Column resizer')).toBe(
			true
		);
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
		const input = resizer.querySelector(
			'[data-spectrum-table-view-resizer-input]'
		) as HTMLInputElement;
		resizer.focus();
		resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		flushSync();
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		flushSync();
		expect(resizer.hasAttribute('data-resizing')).toBe(false);
	});

	it('blurring the handle after a keyboard arrow step ends resize mode', () => {
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		resizer.focus();
		resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();
		expect(resizer.getAttribute('data-resizing')).toBe('');

		// Focus moves away from the handle (relatedTarget not the inner input).
		resizer.dispatchEvent(new FocusEvent('blur', { bubbles: false, relatedTarget: null }));
		flushSync();
		expect(resizer.hasAttribute('data-resizing')).toBe(false);
	});

	it('Enter on the div focuses the input without ending resize (blur to input)', () => {
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		const input = resizer.querySelector(
			'[data-spectrum-table-view-resizer-input]'
		) as HTMLInputElement;
		resizer.focus();
		resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		flushSync();
		// Enter focuses the input; the resulting blur on the div targets the input.
		resizer.dispatchEvent(new FocusEvent('blur', { bubbles: false, relatedTarget: input }));
		flushSync();
		expect(resizer.getAttribute('data-resizing')).toBe('');
	});

	it('pointer drag updates aria-valuetext', () => {
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		const input = resizer.querySelector(
			'[data-spectrum-table-view-resizer-input]'
		) as HTMLInputElement;

		resizer.dispatchEvent(
			new PointerEvent('pointerdown', { pointerId: 1, clientX: 200, button: 0, bubbles: true })
		);
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 280 }));
		flushSync();
		window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 280 }));
		flushSync();

		const after = input.getAttribute('aria-valuetext');
		expect(after).toBe('280 pixels');
	});

	it('pointer drag in RTL inverts deltaX when updating aria-valuetext', () => {
		host.dir = 'rtl';
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		const input = resizer.querySelector(
			'[data-spectrum-table-view-resizer-input]'
		) as HTMLInputElement;

		resizer.dispatchEvent(
			new PointerEvent('pointerdown', { pointerId: 1, clientX: 200, button: 0, bubbles: true })
		);
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 280 }));
		flushSync();
		window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 280 }));
		flushSync();

		const after = input.getAttribute('aria-valuetext');
		expect(after).toBe('120 pixels');
	});

	it('pointer drag shows the cursor overlay mid-drag and ends resize on pointerup', () => {
		const resizer = host.querySelector('[data-spectrum-table-view-resizer]') as HTMLElement;
		const overlaySelector = '[data-spectrum-table-view-resize-cursor-overlay]';

		resizer.dispatchEvent(
			new PointerEvent('pointerdown', { pointerId: 1, clientX: 200, button: 0, bubbles: true })
		);
		flushSync();
		// onMoveStart fires on the first non-zero move, not on pointerdown.
		expect(host.querySelector(overlaySelector)).toBeNull();

		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 280 }));
		flushSync();
		expect(resizer.getAttribute('data-resizing')).toBe('');
		expect(host.querySelector(overlaySelector)).toBeTruthy();

		window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 280 }));
		flushSync();
		expect(resizer.hasAttribute('data-resizing')).toBe(false);
		expect(host.querySelector(overlaySelector)).toBeNull();
	});
});
