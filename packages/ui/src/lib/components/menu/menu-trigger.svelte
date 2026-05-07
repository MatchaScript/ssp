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

	const triggerState = new MenuTriggerState({
		get anchorId() {
			return anchorId;
		},
		get open() {
			return open;
		},
		onOpenChange(value) {
			open = value;
			if (!value) {
				// triggerEl is a display:contents wrapper — its first element child IS the user's
				// trigger (Button, ActionButton, <a>, etc). Focus it directly rather than relying
				// on a button-specific selector that misses non-button triggers.
				queueMicrotask(() => {
					const el = triggerEl?.firstElementChild;
					if (el instanceof HTMLElement) el.focus();
				});
			}
		}
	});

	setMenuTriggerContext(triggerState);
</script>

<span bind:this={triggerEl} style="display: contents;">
	{@render trigger({ triggerProps: triggerState.triggerProps })}
</span>

{@render children()}
