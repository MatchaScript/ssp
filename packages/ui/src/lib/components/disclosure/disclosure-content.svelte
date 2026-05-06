<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDisclosureContext } from './disclosure.svelte.js';

	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	const state = getDisclosureContext();
</script>

<div
	bind:this={ref}
	{...restProps}
	class={className}
	data-spectrum-disclosure-content
	data-size={state.size}
	role="region"
>
	{@render children?.()}
</div>

<style>
	[data-spectrum-disclosure-content] {
		width: 0;
		min-width: 100%;
		font-family: inherit;
		color: var(--neutral-content-color-default);
		box-sizing: border-box;
	}

	/* Size: font-size & content padding */
	[data-spectrum-disclosure-content][data-size='s'] {
		font-size: var(--text-75);
		padding: 0 0 var(--spacing-200) 0;
	}
	[data-spectrum-disclosure-content][data-size='m'] {
		font-size: var(--text-100);
		padding: 0 0 var(--spacing-200) 0;
	}
	[data-spectrum-disclosure-content][data-size='l'] {
		font-size: var(--text-200);
		padding: 0 0 var(--spacing-300) 0;
	}
	[data-spectrum-disclosure-content][data-size='xl'] {
		font-size: var(--text-300);
		padding: 0 0 var(--spacing-300) 0;
	}
</style>
