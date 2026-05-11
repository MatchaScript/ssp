<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { tick } from 'svelte';
	import {
		MenuState,
		type MenuSize,
		type SelectionMode,
		setMenuContext,
		getMenuTriggerContext,
		getSubmenuTriggerContext,
		clearSubmenuTriggerContext
	} from './menu.svelte.js';

	let {
		children,
		size = 'm',
		selectionMode = 'none',
		selectedKeys = $bindable(new Set<string>()),
		onAction,
		onSelectionChange,
		onClose,
		ref = $bindable(null),
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, 'onkeydown' | 'role'> & {
		children: Snippet;
		size?: MenuSize;
		selectionMode?: SelectionMode;
		selectedKeys?: Set<string>;
		onAction?: (id: string) => void;
		onSelectionChange?: (keys: Set<string>) => void;
		onClose?: () => void;
		ref?: HTMLDivElement | null;
	} = $props();

	const triggerCtx = getMenuTriggerContext();
	const isTriggered = !!triggerCtx;

	// Capture the SubmenuTriggerContext BEFORE shadowing it for children.
	// Menu itself needs it (for ArrowLeft close), but its MenuItem descendants
	// must not see it — otherwise they'd all render as sub-triggers.
	const submenuCtx = getSubmenuTriggerContext();
	clearSubmenuTriggerContext();

	const menuState = new MenuState({
		get size() {
			return size;
		},
		get selectionMode() {
			return selectionMode;
		},
		get selectedKeys() {
			return selectedKeys;
		},
		get onAction() {
			return onAction;
		},
		get onSelectionChange() {
			return (keys: Set<string>) => {
				selectedKeys = keys;
				onSelectionChange?.(keys);
			};
		},
		get onClose() {
			return onClose ?? (triggerCtx ? () => triggerCtx.closeMenu() : undefined);
		}
	});

	setMenuContext(menuState);

	// Apply the pending focus strategy each time the menu opens. Reading
	// `triggerCtx.open` makes this effect reactive to open transitions.
	// tick() defers focusFirst until after MenuItem $effects have registered.
	$effect(() => {
		if (!triggerCtx?.open) return;
		const pending = triggerCtx.consumeFocusStrategy?.();
		if (!pending) return;
		const { strategy, focusVisible } = pending;
		let cancelled = false;
		tick().then(() => {
			if (cancelled) return;
			if (strategy === 'first') menuState.focusFirst({ focusVisible });
			else if (strategy === 'last') menuState.focusLast({ focusVisible });
		});
		return () => {
			cancelled = true;
		};
	});

	function handleKeyDown(event: KeyboardEvent) {
		// ArrowLeft in a submenu closes it and returns focus to the trigger.
		// handleSubmenuKeydown is a no-op for other keys, so always call first.
		submenuCtx?.handleSubmenuKeydown(event);
		if (event.defaultPrevented) return;
		menuState.handleKeyDown(event);
	}

	// popover="auto" handles light-dismiss (outside click, Escape) natively.
	// Sync our `open` state when the browser closes the popover for any reason.
	function handleToggle(event: ToggleEvent) {
		if (event.newState === 'closed') triggerCtx?.closeMenu();
	}
</script>

<!--
  When inside a MenuTrigger/SubmenuTrigger, the menu is conditionally rendered
  and wrapped with popover chrome. When standalone, it renders as a plain list.
-->
{#if isTriggered && !triggerCtx.open}
	<!-- Menu is closed — don't render -->
{:else}
	<div
		bind:this={ref}
		role="menu"
		tabindex="-1"
		data-spectrum-menu
		data-popover={isTriggered || undefined}
		data-variant={triggerCtx?.variant ?? undefined}
		data-size={size}
		popover={isTriggered ? 'auto' : undefined}
		style={isTriggered ? `position-anchor: ${triggerCtx.anchorId};` : undefined}
		{...restProps}
		onkeydown={handleKeyDown}
		ontoggle={isTriggered ? handleToggle : undefined}
		onpointerenter={() => submenuCtx?.handleContentPointerEnter()}
		onpointerleave={() => submenuCtx?.handleContentPointerLeave()}
		{@attach (node) => {
			if (isTriggered) (node as HTMLElement).showPopover();
		}}
	>
		{@render children()}
	</div>
{/if}

<style>
	/* 8-column subgrid matching S2 menu anatomy.
	   Columns: [edge | checkmark | icon | label(1fr) | value | keyboard | descriptor | edge]
	   --edge = controlSize * 3/8 (S2's edgeToText formula). */
	[data-spectrum-menu] {
		gap: 0;
		display: grid;
		grid-template-columns: var(--edge) auto auto minmax(0, 1fr) auto auto auto var(--edge);
		grid-auto-rows: min-content;
		outline: none;
		padding: var(--spacing-100);
		--edge: calc(32px * 3 / 8);
	}

	[data-spectrum-menu][data-size='s'] {
		--edge: calc(24px * 3 / 8);
	}

	[data-spectrum-menu][data-size='m'] {
		--edge: calc(32px * 3 / 8);
	}

	[data-spectrum-menu][data-size='l'] {
		--edge: calc(40px * 3 / 8);
	}

	[data-spectrum-menu][data-size='xl'] {
		--edge: calc(48px * 3 / 8);
	}

	/* ── Popover mode (inside MenuTrigger/SubmenuTrigger) ── */

	[data-spectrum-menu][data-popover] {
		position: fixed;
		/* Reset UA popover defaults (inset: 0; margin: auto) so position-area drives placement. */
		inset: auto;
		margin: 0;
		background-color: var(--background-layer-2-color);
		border: var(--border-width-100) solid var(--popover-border-color);
		border-radius: var(--corner-radius-medium-default);
		box-shadow: var(--drop-shadow-elevated);
		width: max-content;
		max-width: 320px;
		overflow-y: auto;
		box-sizing: border-box;
	}

	/* Root dropdown positioning */
	[data-spectrum-menu][data-variant='root'] {
		position-area: bottom span-right;
		position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		margin: var(--spacing-100) 0;
		z-index: 1000;
	}

	/* Submenu positioning */
	[data-spectrum-menu][data-variant='submenu'] {
		position-area: right span-bottom;
		position-try-fallbacks: flip-inline, flip-block, flip-inline flip-block;
		margin: 0 var(--spacing-100);
		z-index: 1100;
	}
</style>
