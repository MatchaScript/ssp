<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Accordion } from 'bits-ui';

	let {
		ref = $bindable(null),
		children,
		level = 3,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();
</script>

<Accordion.Header {level}>
	{#snippet child({ props })}
		<div {...props} {...restProps} bind:this={ref} class={className} data-spectrum-accordion-header>
			{@render children?.()}
		</div>
	{/snippet}
</Accordion.Header>

<style>
	[data-spectrum-accordion-header] {
		display: flex;
		align-items: center;
		margin: 0;
	}
</style>
