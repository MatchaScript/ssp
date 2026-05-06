<script lang="ts">
	import type { LabelProps } from './types.js';

	let {
		for: forId,
		isRequired = false,
		necessityIndicator = 'icon',
		children,
		...restProps
	}: LabelProps = $props();

	const showNecessity = $derived(
		necessityIndicator === 'text' || (necessityIndicator === 'icon' && isRequired)
	);
</script>

<label for={forId} data-spectrum-label {...restProps}>
	{@render children?.()}
	{#if showNecessity}
		{#if necessityIndicator === 'icon'}
			<span data-spectrum-label-necessity-icon aria-label="required">*</span>
		{:else if isRequired}
			<span data-spectrum-label-necessity-text aria-hidden="true">(required)</span>
		{:else}
			<span data-spectrum-label-necessity-text aria-hidden="true">(optional)</span>
		{/if}
	{/if}
</label>

<style>
	[data-spectrum-label] {
		display: inline-flex;
		align-items: baseline;
		font-family: var(--font-sans);
		font-weight: 500;
		line-height: var(--lh-component);
		color: inherit;
		font-size: inherit;
	}

	/* Necessity indicator: asterisk icon */
	[data-spectrum-label-necessity-icon] {
		color: var(--negative-content-color-default);
		margin-inline-start: var(--spacing-75);
		user-select: none;
	}

	/* Necessity indicator: text */
	[data-spectrum-label-necessity-text] {
		color: var(--neutral-subdued-content-color-default);
		font-weight: 400;
		font-style: italic;
		margin-inline-start: var(--spacing-75);
		user-select: none;
	}
</style>
