<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SubmenuTriggerState } from './submenu-trigger.svelte.js';
	import { setMenuTriggerContext, setSubmenuTriggerContext } from './menu.svelte.js';

	let {
		children,
		open = $bindable(false)
	}: {
		/**
		 * Should contain a `<MenuItem>` (the trigger) and a `<Menu>` (the submenu).
		 * The MenuItem auto-detects SubmenuTriggerContext to add chevron + hover handlers.
		 * The Menu auto-detects MenuTriggerContext for popover rendering.
		 */
		children: Snippet;
		open?: boolean;
	} = $props();

	const id = $props.id();
	const anchorId = `--spectrum-submenu-${id}`;

	const state = new SubmenuTriggerState({
		get anchorId() {
			return anchorId;
		},
		get open() {
			return open;
		},
		onOpenChange(value) {
			open = value;
			if (!value) {
				queueMicrotask(() => state.triggerEl?.focus());
			}
		}
	});

	// MenuItem reads this to add chevron + hover/keyboard handlers
	setSubmenuTriggerContext(state);
	// Menu reads this for popover mode + conditional rendering
	setMenuTriggerContext(state);

	// If this SubmenuTrigger unmounts while open (typical: the root menu closes,
	// which unmounts every descendant), reset the bindable so a subsequent remount
	// doesn't come back up with open=true and pop the submenu without user intent.
	$effect(() => () => {
		if (open) open = false;
	});
</script>

{@render children()}
