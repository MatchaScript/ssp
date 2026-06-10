<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MenuTriggerState } from './menu-trigger.svelte.js';
	import { setMenuTriggerContext } from './menu.svelte.js';

	let {
		trigger,
		children,
		open = $bindable(false)
	}: {
		/** Named snippet for the trigger element. Receives `triggerProps` to spread. */
		trigger: Snippet<[{ triggerProps: Record<string, unknown> }]>;
		/** Should contain a `<Menu>` component. */
		children: Snippet;
		open?: boolean;
	} = $props();

	const id = $props.id();
	const anchorId = `--spectrum-menu-trigger-${id}`;

	let triggerEl: HTMLElement | null = $state(null);

	// triggerEl is a display:contents wrapper — its first element child IS the user's
	// trigger (Button, ActionButton, <a>, etc).
	function triggerFocusTarget(): HTMLElement | null {
		const el = triggerEl?.firstElementChild;
		return el instanceof HTMLElement ? el : null;
	}

	// On close, return focus to the trigger — but only if nothing else has claimed
	// it. An item's onAction may move focus deliberately (e.g. the table column
	// menu's "Resize column" focuses a resizer input); stealing it back would undo
	// that. Defer one microtask so the popover finishes closing first, then check
	// whether focus is still inside our trigger/popover (or unset) before restoring.
	function restoreTriggerFocus() {
		const popover = triggerEl?.parentElement?.querySelector<HTMLElement>(
			`[data-spectrum-menu][style*="position-anchor: ${anchorId};"]`
		);
		queueMicrotask(() => {
			const active = document.activeElement;
			const ours =
				active === null ||
				active === document.body ||
				triggerEl?.contains(active) ||
				popover?.contains(active);
			if (ours) triggerFocusTarget()?.focus();
		});
	}

	const triggerState = new MenuTriggerState({
		get anchorId() {
			return anchorId;
		},
		get open() {
			return open;
		},
		onOpenChange(value) {
			open = value;
			if (!value) restoreTriggerFocus();
		}
	});

	setMenuTriggerContext(triggerState);
</script>

<span bind:this={triggerEl} style="display: contents;">
	{@render trigger({ triggerProps: triggerState.triggerProps })}
</span>

{@render children()}
