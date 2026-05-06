<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ChevronRight } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';
	import { getDisclosureContext } from './disclosure.svelte.js';

	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLElement>, 'children'> = $props();

	const state = getDisclosureContext();

	const iconSizeMap: Record<string, 's' | 'm'> = { s: 's', m: 's', l: 'm', xl: 'm' };
	const iconSize = $derived(iconSizeMap[state.size]);
</script>

<summary
	bind:this={ref}
	{...restProps}
	class={className}
	data-spectrum-disclosure-trigger
	data-size={state.size}
	data-density={state.density}
	data-disabled={state.isDisabled || undefined}
	aria-disabled={state.isDisabled || undefined}
	onclick={state.isDisabled ? (e) => e.preventDefault() : undefined}
>
	<span data-spectrum-disclosure-indicator>
		<Icon icon={ChevronRight} size={iconSize} />
	</span>
	<span data-spectrum-disclosure-trigger-content>
		{@render children?.()}
	</span>
</summary>

<style>
	[data-spectrum-disclosure-trigger] {
		list-style: none;
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		width: 100%;
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-weight: 700;
		color: var(--neutral-content-color-default);
		text-align: start;
		box-sizing: border-box;
		transition: color var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-disclosure-trigger]::-webkit-details-marker {
		display: none;
	}

	/* Size: font-size & gap */
	[data-spectrum-disclosure-trigger][data-size='s'] {
		font-size: var(--text-75);
		gap: var(--spacing-75);
	}
	[data-spectrum-disclosure-trigger][data-size='m'] {
		font-size: var(--text-100);
		gap: var(--spacing-100);
	}
	[data-spectrum-disclosure-trigger][data-size='l'] {
		font-size: var(--text-200);
		gap: var(--spacing-100);
	}
	[data-spectrum-disclosure-trigger][data-size='xl'] {
		font-size: var(--text-300);
		gap: var(--spacing-200);
	}

	/* Density: vertical padding */
	[data-spectrum-disclosure-trigger][data-density='compact'] {
		padding: var(--spacing-75) 0;
	}
	[data-spectrum-disclosure-trigger][data-density='regular'] {
		padding: var(--spacing-200) 0;
	}
	[data-spectrum-disclosure-trigger][data-density='spacious'] {
		padding: var(--spacing-300) 0;
	}

	/* Interaction states */
	[data-spectrum-disclosure-trigger]:hover {
		color: var(--neutral-content-color-hover);
	}

	[data-spectrum-disclosure-trigger]:active {
		color: var(--neutral-content-color-down);
	}

	[data-spectrum-disclosure-trigger]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: calc(var(--focus-indicator-gap) * -1);
		border-radius: var(--corner-radius-100);
	}

	[data-spectrum-disclosure-trigger][data-disabled] {
		color: var(--disabled-content-color);
		cursor: default;
	}

	/* Chevron indicator */
	[data-spectrum-disclosure-indicator] {
		display: grid;
		place-items: center;
		color: var(--neutral-subdued-content-color-default);
		transition: transform var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-disclosure-trigger]:hover [data-spectrum-disclosure-indicator] {
		color: var(--neutral-subdued-content-color-hover);
	}

	[data-spectrum-disclosure-trigger][data-disabled] [data-spectrum-disclosure-indicator] {
		color: var(--disabled-content-color);
	}

	:global(details[open]) [data-spectrum-disclosure-indicator] {
		transform: rotate(90deg);
	}

	[data-spectrum-disclosure-trigger-content] {
		display: block;
	}
</style>
