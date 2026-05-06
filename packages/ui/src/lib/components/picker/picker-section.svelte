<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getPickerContext } from './picker.svelte.js';
	import { Select } from 'bits-ui';

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

	const state = getPickerContext();
</script>

<Select.Group {...rest}>
	{#snippet child({ props })}
		<div {...props} class={className} data-spectrum-picker-section data-size={state.size}>
			{#if title}
				<Select.GroupHeading>
					{#snippet child({ props: headingProps })}
						<div {...headingProps} data-spectrum-picker-section-header>{title}</div>
					{/snippet}
				</Select.GroupHeading>
			{/if}
			{@render children()}
		</div>
	{/snippet}
</Select.Group>

<style>
	[data-spectrum-picker-section] {
		/* Span all 2 columns of the parent PickerContent */
		display: grid;
		grid-column: 1 / -1;
		/* Inherit the 2 columns exactly */
		grid-template-columns: subgrid;
		/* Add slight spacing between sections */
	}

	[data-spectrum-picker-section]:first-child {
		margin-top: 0;
	}

	[data-spectrum-picker-section-header] {
		grid-column: 1 / -1;
		padding: var(--space-2) var(--space-3);
		color: var(--neutral-subdued-content-color-default);
		font-family: var(--font-sans);
		font-size: var(--text-75);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	[data-spectrum-picker-section][data-size='s'] [data-spectrum-picker-section-header] {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-50);
	}

	[data-spectrum-picker-section][data-size='l'] [data-spectrum-picker-section-header] {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-100);
	}

	[data-spectrum-picker-section][data-size='xl'] [data-spectrum-picker-section-header] {
		padding: var(--space-4) var(--space-5);
		font-size: var(--text-200);
	}
</style>
