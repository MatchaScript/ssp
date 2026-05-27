export type PointerMoveType = 'mouse' | 'touch' | 'pen' | 'keyboard';

export interface MoveEvent {
	deltaX: number;
	deltaY: number;
	pointerType: PointerMoveType;
}

export interface PointerMoveHandlers {
	onMoveStart?: () => void;
	onMove?: (event: MoveEvent) => void;
	onMoveEnd?: () => void;
}

/**
 * Drag + keyboard helper. Mirrors `useMove` (react-aria) semantics:
 *   • `onMoveStart` fires on the first non-zero pointer move (not on
 *     pointerdown), or synthetically on a keyboard arrow.
 *   • Deltas are page-relative (`pageX` / `pageY`) so scroll mid-drag does
 *     not corrupt the sequence.
 *   • Move + up listeners are attached to `window` so the drag is robust
 *     when the pointer leaves `el` mid-flight.
 *   • Arrow keys are folded into the same `onMove` callback with
 *     `pointerType: 'keyboard'`, deltaX/Y in ±1 units. Consumers scale.
 *
 * Returns a `detach()` cleanup that removes all listeners.
 */
export function attachPointerMove(el: HTMLElement, handlers: PointerMoveHandlers): () => void {
	let pointerId: number | null = null;
	let didMove = false;
	let lastPageX = 0;
	let lastPageY = 0;

	const onPointerMove = (event: PointerEvent) => {
		if (pointerId === null || event.pointerId !== pointerId) return;
		const dx = event.pageX - lastPageX;
		const dy = event.pageY - lastPageY;
		lastPageX = event.pageX;
		lastPageY = event.pageY;
		if (dx === 0 && dy === 0) return;
		if (!didMove) {
			didMove = true;
			handlers.onMoveStart?.();
		}
		handlers.onMove?.({
			deltaX: dx,
			deltaY: dy,
			pointerType: (event.pointerType as PointerMoveType) || 'mouse'
		});
	};

	const finish = (event: PointerEvent) => {
		if (pointerId === null || event.pointerId !== pointerId) return;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', finish);
		window.removeEventListener('pointercancel', finish);
		const wasMoving = didMove;
		pointerId = null;
		didMove = false;
		if (wasMoving) handlers.onMoveEnd?.();
	};

	const onPointerDown = (event: PointerEvent) => {
		if (event.button !== 0 || pointerId !== null) return;
		pointerId = event.pointerId;
		didMove = false;
		lastPageX = event.pageX;
		lastPageY = event.pageY;
		// Pointer capture keeps the host element as the event target even when
		// the cursor leaves it — belt-and-suspenders alongside the window
		// listeners that follow.
		try {
			el.setPointerCapture(event.pointerId);
		} catch {
			/* ignore — older browsers / unit DOM */
		}
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', finish);
		window.addEventListener('pointercancel', finish);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		let dx = 0;
		let dy = 0;
		switch (event.key) {
			case 'ArrowLeft':
				dx = -1;
				break;
			case 'ArrowRight':
				dx = 1;
				break;
			case 'ArrowUp':
				dy = -1;
				break;
			case 'ArrowDown':
				dy = 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		handlers.onMoveStart?.();
		handlers.onMove?.({ deltaX: dx, deltaY: dy, pointerType: 'keyboard' });
		handlers.onMoveEnd?.();
	};

	el.addEventListener('pointerdown', onPointerDown);
	el.addEventListener('keydown', onKeyDown);

	return () => {
		el.removeEventListener('pointerdown', onPointerDown);
		el.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', finish);
		window.removeEventListener('pointercancel', finish);
	};
}
