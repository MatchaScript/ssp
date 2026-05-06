<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getComboboxContext } from './combobox.svelte.js';
	import { Combobox } from 'bits-ui';

	let {
		title,
		children,
		class: className = '',
		...rest
	}: {
		title?: string;
		children: Snippet;
		class?: string;
		[key: string]: unknown;
	} = $props();

	const state = getComboboxContext();
</script>

<Combobox.Group {...rest}>
	{#snippet child({ props })}
		<div {...props} class={className} data-spectrum-combobox-section data-size={state.size}>
			{#if title}
				<Combobox.GroupHeading>
					{#snippet child({ props: headingProps })}
						<div {...headingProps} data-spectrum-combobox-section-header>{title}</div>
					{/snippet}
				</Combobox.GroupHeading>
			{/if}
			{@render children()}
		</div>
	{/snippet}
</Combobox.Group>

<style>
	[data-spectrum-combobox-section] {
		/* Span all 2 columns defined by Content */
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: subgrid;
	}

	[data-spectrum-combobox-section]:first-child {
		margin-top: 0;
	}

	[data-spectrum-combobox-section-header] {
		grid-column: 1 / -1;
		padding: var(--space-2) var(--space-3);
		color: var(--neutral-subdued-content-color-default);
		font-family: var(--font-sans);
		font-size: var(--text-75);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	[data-spectrum-combobox-section][data-size='s'] [data-spectrum-combobox-section-header] {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-50);
	}

	[data-spectrum-combobox-section][data-size='l'] [data-spectrum-combobox-section-header] {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-100);
	}

	[data-spectrum-combobox-section][data-size='xl'] [data-spectrum-combobox-section-header] {
		padding: var(--space-4) var(--space-5);
		font-size: var(--text-200);
	}
</style>
