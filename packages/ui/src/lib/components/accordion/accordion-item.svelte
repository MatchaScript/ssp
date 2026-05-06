<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Accordion } from 'bits-ui';
	import { getAccordionContext } from './accordion.svelte.js';

	let {
		ref = $bindable(null),
		children,
		value,
		isDisabled = false,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
		value?: string;
		isDisabled?: boolean;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	const state = getAccordionContext();
</script>

<Accordion.Item {value} disabled={isDisabled}>
	{#snippet child({ props })}
		<div
			{...props}
			{...restProps}
			bind:this={ref}
			class={className}
			data-spectrum-accordion-item
			data-quiet={state.isQuiet || undefined}
		>
			{@render children?.()}
		</div>
	{/snippet}
</Accordion.Item>

<style>
	[data-spectrum-accordion-item] {
		border-bottom: var(--border-width-100) solid var(--gray-200);
	}

	[data-spectrum-accordion-item][data-quiet] {
		border-bottom: none;
	}
</style>
