<script lang="ts">
	import { untrack } from 'svelte';
	import { getTableContext } from './state/context.js';
	import { getElementDirection } from '$lib/utils/direction.js';
	import { attachPointerMove } from '$lib/utils/pointer-move/index.js';

	let { columnId }: { columnId: string } = $props();

	const tableState = getTableContext();
	let handleEl: HTMLDivElement | null = $state(null);
	let inputEl: HTMLInputElement | null = $state(null);
	// True while a pointer drag is in flight — gates the full-viewport cursor overlay.
	let showOverlay = $state(false);

	const isResizing = $derived(tableState.resizingColumn === columnId);
	const width = $derived(tableState.columnWidth(columnId));
	const minPx = $derived(Math.floor(tableState.columnMinWidth(columnId)));
	// `columnMaxWidth` returns `Number.MAX_SAFE_INTEGER` for unconstrained columns;
	// `Math.floor` is a no-op on it, so no Infinity guard is needed.
	const maxPx = $derived(Math.floor(tableState.columnMaxWidth(columnId)));

	const ariaValueText = $derived(`${width} pixels`);

	// Register the input element so the column menu's "Resize column" entry can
	// focus it directly (no document-wide DOM query).
	$effect(() => {
		const el = inputEl;
		if (!el) return;
		return untrack(() => tableState.registerResizerInput(columnId, el));
	});

	// Drag + keyboard resize, driven entirely by the pointer-move helper.
	// onMoveStart anchors widthAtMoveStart and starts edit mode; each onMove
	// resizes by the per-event deltaX (scaled ×10 for keyboard). Direction is
	// read on each onMoveStart so a runtime RTL flip is honoured. A pointer
	// move shows the cursor overlay and ends the resize on release; a keyboard
	// arrow keeps edit mode open (the input owns Esc / Enter / Tab / blur).
	$effect(() => {
		const el = handleEl;
		if (!el) return;
		let direction: 'ltr' | 'rtl' = 'ltr';
		let widthAtMoveStart = 0;
		const detach = untrack(() =>
			attachPointerMove(el, {
				onMoveStart: (pointerType) => {
					direction = getElementDirection(el);
					widthAtMoveStart = tableState.columnWidth(columnId);
					tableState.startResize(columnId);
					if (pointerType !== 'keyboard') showOverlay = true;
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
				onMoveEnd: (pointerType) => {
					if (pointerType === 'keyboard') return;
					showOverlay = false;
					if (isResizing) tableState.endResize();
				}
			})
		);
		return () => {
			detach();
			// Unmounting mid-drag (or mid keyboard edit) must not leave the
			// column stuck in resize mode.
			if (isResizing) tableState.endResize();
		};
	});

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

	// A keyboard arrow on the div edits in place without ending the resize, so
	// blurring away (Shift+Tab, click elsewhere) is the div's signal to exit
	// edit mode. Focus moving to the inner input (Enter / Space) keeps it open.
	function handleDivBlur(event: FocusEvent) {
		if (isResizing && event.relatedTarget !== inputEl) tableState.endResize();
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
		// Handles the native range-input keys that attachPointerMove leaves alone
		// (it preventDefaults only the arrows): PageUp/PageDown/Home/End change
		// the input's value directly, and this snaps the column width to match.
		const next = parseInt((event.target as HTMLInputElement).value, 10);
		if (!Number.isNaN(next) && next !== width) {
			tableState.resizeColumn(columnId, next);
		}
	}
</script>

<!-- The handle sits inside the <th>'s click target. Without `stopPropagation`
     on click + pointerdown, a tap on the resizer bubbles up and the column
     header's onclick toggles sort. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={handleEl}
	role="presentation"
	data-spectrum-table-view-resizer
	data-resizing={isResizing ? '' : undefined}
	tabindex={0}
	onkeydown={handleDivKeydown}
	onblur={handleDivBlur}
	onpointerdown={(e) => e.stopPropagation()}
	onclick={(e) => e.stopPropagation()}
>
	<input
		bind:this={inputEl}
		type="range"
		min={minPx}
		max={maxPx}
		value={width}
		aria-label="Column resizer"
		aria-valuetext={ariaValueText}
		data-spectrum-table-view-resizer-input
		onkeydown={handleInputKeydown}
		onblur={handleInputBlur}
		onchange={handleInputChange}
	/>
</div>

{#if showOverlay}
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
