<script lang="ts">
	import { untrack } from 'svelte';
	import { getTableContext } from './state/context.js';
	import { getElementDirection } from '$lib/utils/direction.js';
	import { attachPointerMove } from '$lib/utils/pointer-move/index.js';

	let { columnId }: { columnId: string } = $props();

	const tableState = getTableContext();
	let handleEl: HTMLDivElement | null = $state(null);
	let inputEl: HTMLInputElement | null = $state(null);
	let isPointerDragging = $state(false);

	const isResizing = $derived(tableState.resizingColumn === columnId);
	const width = $derived(tableState.columnWidth(columnId));
	const minPx = $derived(Math.floor(tableState.columnMinWidth(columnId)));
	const maxPxRaw = $derived(Math.floor(tableState.columnMaxWidth(columnId)));
	const maxPx = $derived(Number.isFinite(maxPxRaw) ? maxPxRaw : Number.MAX_SAFE_INTEGER);

	const ariaLabel = $derived(tableState.formatter.format('columnResizer'));
	const ariaValueText = $derived(tableState.formatter.format('columnSize', { value: width }));

	// Register the input element so the column menu's "Resize column" entry can
	// focus it directly (no document-wide DOM query).
	$effect(() => {
		const el = inputEl;
		if (!el) return;
		return untrack(() => tableState.registerResizerInput(columnId, el));
	});

	// Pointer drag — onMoveStart starts edit mode, every onMove resizes by
	// the per-event deltaX (scaled ×10 for keyboard).
	$effect(() => {
		const el = handleEl;
		if (!el) return;
		const direction = getElementDirection(el);
		let widthAtMoveStart = 0;
		return untrack(() =>
			attachPointerMove(el, {
				onMoveStart: () => {
					widthAtMoveStart = tableState.columnWidth(columnId);
					tableState.startResize(columnId);
				},
				onMove: ({ deltaX, deltaY, pointerType }) => {
					let dx = direction === 'rtl' ? -deltaX : deltaX;
					if (pointerType === 'keyboard') {
						// Keyboard: ArrowUp/Down also adjust width (Up = wider, RAC parity).
						if (dx === 0 && deltaY !== 0) dx = -deltaY;
						dx *= 10;
					}
					if (dx === 0) return;
					widthAtMoveStart += dx;
					tableState.resizeColumn(columnId, widthAtMoveStart);
				},
				onMoveEnd: () => {
					// Pointer drags end immediately; keyboard "moves" inside edit
					// mode also call onMoveEnd but we keep edit mode open — the
					// outer onKeyDown handler closes it on Esc/Enter/Tab.
				}
			})
		);
	});

	// Track pointer-down state so the cursor overlay only appears during an
	// actual mouse drag (not for the keyboard edit-mode focus ring).
	function handlePointerDown() {
		isPointerDragging = true;
		const stop = () => {
			isPointerDragging = false;
			window.removeEventListener('pointerup', stop);
			window.removeEventListener('pointercancel', stop);
			tableState.endResize();
		};
		window.addEventListener('pointerup', stop);
		window.addEventListener('pointercancel', stop);
	}

	// Keyboard edit-mode lifecycle on the OUTER div (the input owns its own
	// keystrokes — Tab/Escape/Enter end edit mode and return focus to the div).
	function handleDivKeydown(event: KeyboardEvent) {
		if (event.target !== event.currentTarget) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			tableState.startResize(columnId);
			inputEl?.focus();
		}
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (!isResizing) return;
		switch (event.key) {
			case 'Escape':
			case 'Enter':
			case 'Tab':
				event.preventDefault();
				tableState.endResize();
				handleEl?.focus();
				return;
		}
	}

	function handleInputBlur() {
		if (isResizing) tableState.endResize();
	}

	function handleInputChange(event: Event) {
		// The native range input emits change events on arrow / pageup / pagedown.
		// Since attachPointerMove already handles keyboard via the OUTER div's
		// keydown listener, we only honour the value when the user dragged the
		// internal range thumb (impossible — it's visually hidden) or when
		// something programmatically set the value. Keep this as a defensive
		// snap to the input's reported value.
		const next = parseInt((event.target as HTMLInputElement).value, 10);
		if (!Number.isNaN(next) && next !== width) {
			tableState.resizeColumn(columnId, next);
		}
	}
</script>

<div
	bind:this={handleEl}
	role="presentation"
	data-spectrum-table-view-resizer
	data-resizing={isResizing ? '' : undefined}
	tabindex={0}
	onkeydown={handleDivKeydown}
	onpointerdown={handlePointerDown}
>
	<input
		bind:this={inputEl}
		type="range"
		min={minPx}
		max={maxPx}
		value={width}
		aria-label={ariaLabel}
		aria-valuetext={ariaValueText}
		data-spectrum-table-view-resizer-input
		onkeydown={handleInputKeydown}
		onblur={handleInputBlur}
		onchange={handleInputChange}
	/>
</div>

{#if isPointerDragging}
	<!-- Full-viewport cursor overlay: keeps the cursor from flickering when
	     the pointer crosses other element edges mid-drag. Renders as a
	     sibling of <table> via Svelte's portal-less layout — fine because
	     `position: fixed` ignores ancestors. -->
	<div data-spectrum-table-view-resize-cursor-overlay aria-hidden="true"></div>
{/if}

<style>
	[data-spectrum-table-view-resizer] {
		position: absolute;
		inset-block: 0;
		inset-inline-end: -3px;
		width: 6px;
		cursor: ew-resize;
		touch-action: none;
		z-index: 1;
		outline: none;
	}

	[data-spectrum-table-view-resizer-input] {
		/* Visually hidden — the outer div is the visible affordance, but the
		   input owns the a11y semantics (slider role, valuetext, etc).
		   Matches the recipe used by checkbox/radio/switch in this package. */
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	[data-spectrum-table-view-resizer]:focus-visible::after,
	[data-spectrum-table-view-resizer][data-resizing]::after,
	[data-spectrum-table-view-resizer]:has(:focus-visible)::after {
		content: '';
		position: absolute;
		inset-block: 0;
		inset-inline-start: 50%;
		width: 2px;
		background: var(--focus-indicator-color);
		transform: translateX(-50%);
	}

	[data-spectrum-table-view-resize-cursor-overlay] {
		position: fixed;
		inset: 0;
		cursor: ew-resize;
		z-index: 9999;
	}
</style>
