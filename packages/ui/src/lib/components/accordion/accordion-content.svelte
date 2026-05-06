<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Accordion } from 'bits-ui';
	import { slide } from 'svelte/transition';
	import { getAccordionContext } from './accordion.svelte.js';

	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	const state = getAccordionContext();
</script>

<Accordion.Content forceMount>
	{#snippet child({ props, open })}
		{#if open}
			<div
				{...props}
				{...restProps}
				bind:this={ref}
				class={className}
				data-spectrum-accordion-content
				data-size={state.size}
				transition:slide={{ duration: 200 }}
			>
				{@render children?.()}
			</div>
		{/if}
	{/snippet}
</Accordion.Content>

<style>
	[data-spectrum-accordion-content] {
		width: 0;
		min-width: 100%;
		font-family: inherit;
		color: var(--neutral-content-color-default);
		box-sizing: border-box;
	}

	/* Size: font-size & content padding */
	[data-spectrum-accordion-content][data-size='s'] {
		font-size: var(--text-75);
		padding: var(--spacing-100) var(--spacing-75) var(--spacing-200);
	}
	[data-spectrum-accordion-content][data-size='m'] {
		font-size: var(--text-100);
		padding: var(--spacing-100) var(--spacing-100) var(--spacing-200);
	}
	[data-spectrum-accordion-content][data-size='l'] {
		font-size: var(--text-200);
		padding: var(--spacing-100) var(--spacing-200) var(--spacing-300);
	}
	[data-spectrum-accordion-content][data-size='xl'] {
		font-size: var(--text-300);
		padding: var(--spacing-200) var(--spacing-300) var(--spacing-300);
	}
</style>
