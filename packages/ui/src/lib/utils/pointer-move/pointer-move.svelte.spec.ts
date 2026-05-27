import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { attachPointerMove } from './pointer-move.js';

describe('attachPointerMove', () => {
	let host: HTMLElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		// happy-dom / jsdom may lack these. Stub to no-op.
		if (!('setPointerCapture' in HTMLElement.prototype)) {
			const proto = HTMLElement.prototype as unknown as {
				setPointerCapture: (id: number) => void;
				releasePointerCapture: (id: number) => void;
			};
			proto.setPointerCapture = () => {};
			proto.releasePointerCapture = () => {};
		}
	});
	afterEach(() => host.remove());

	it('emits onMoveStart on the first non-zero move (not on pointerdown)', () => {
		const onMoveStart = vi.fn();
		const onMove = vi.fn();
		const detach = attachPointerMove(host, { onMoveStart, onMove });

		host.dispatchEvent(
			new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 0, button: 0, bubbles: true })
		);
		expect(onMoveStart).not.toHaveBeenCalled();

		window.dispatchEvent(
			new PointerEvent('pointermove', { pointerId: 1, clientX: 150, clientY: 0 })
		);
		expect(onMoveStart).toHaveBeenCalledTimes(1);
		expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 50, pointerType: 'mouse' }));

		detach();
	});

	it('emits cumulative deltas across multiple moves', () => {
		const onMove = vi.fn();
		const detach = attachPointerMove(host, { onMove });

		host.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, button: 0, bubbles: true }));
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 10 }));
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 25 }));

		expect(onMove).toHaveBeenNthCalledWith(1, expect.objectContaining({ deltaX: 10 }));
		expect(onMove).toHaveBeenNthCalledWith(2, expect.objectContaining({ deltaX: 15 }));

		detach();
	});

	it('emits onMoveEnd on pointerup and removes window listeners', () => {
		const onMove = vi.fn();
		const onMoveEnd = vi.fn();
		const detach = attachPointerMove(host, { onMove, onMoveEnd });

		host.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, button: 0, bubbles: true }));
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 50 }));
		window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 50 }));

		expect(onMoveEnd).toHaveBeenCalledTimes(1);

		onMove.mockClear();
		// Subsequent moves after up should not fire.
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 200 }));
		expect(onMove).not.toHaveBeenCalled();

		detach();
	});

	it('forwards arrow keys as moves with pointerType "keyboard" and ±1 deltas', () => {
		const onMoveStart = vi.fn();
		const onMove = vi.fn();
		const onMoveEnd = vi.fn();
		const detach = attachPointerMove(host, { onMoveStart, onMove, onMoveEnd });

		host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		expect(onMoveStart).toHaveBeenCalled();
		expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 1, pointerType: 'keyboard' }));
		expect(onMoveEnd).toHaveBeenCalled();

		onMove.mockClear();
		host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ deltaX: -1 }));

		detach();
	});
});
