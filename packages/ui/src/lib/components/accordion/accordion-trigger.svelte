<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Accordion } from 'bits-ui';
	import { ChevronRight } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';
	import { getAccordionContext } from './accordion.svelte.js';

	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
	} & Omit<HTMLButtonAttributes, 'children'> = $props();

	const state = getAccordionContext();

	const iconSizeMap: Record<string, 's' | 'm'> = { s: 's', m: 's', l: 'm', xl: 'm' };
	const iconSize = $derived(iconSizeMap[state.size]);
</script>

<Accordion.Trigger>
	{#snippet child({ props })}
		<button
			{...props}
			{...restProps}
			bind:this={ref}
			class={className}
			data-spectrum-accordion-trigger
			data-size={state.size}
			data-density={state.density}
			data-quiet={state.isQuiet || undefined}
		>
			<span data-spectrum-accordion-indicator>
				<Icon icon={ChevronRight} size={iconSize} />
			</span>
			<span data-spectrum-accordion-trigger-content>
				{@render children?.()}
			</span>
		</button>
	{/snippet}
</Accordion.Trigger>

<style>
	[data-spectrum-accordion-trigger] {
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
		transition:
			color var(--duration-fast) var(--ease-default),
			background-color var(--duration-fast) var(--ease-default);
	}

	/* ── Size: font-size, gap, minHeight ── */

	[data-spectrum-accordion-trigger][data-size='s'] {
		font-size: var(--text-75);
		gap: var(--spacing-75);
	}
	[data-spectrum-accordion-trigger][data-size='m'] {
		font-size: var(--text-100);
		gap: var(--spacing-100);
	}
	[data-spectrum-accordion-trigger][data-size='l'] {
		font-size: var(--text-200);
		gap: var(--spacing-100);
	}
	[data-spectrum-accordion-trigger][data-size='xl'] {
		font-size: var(--text-300);
		gap: var(--spacing-200);
	}

	/* ── Size × Density: minHeight (RS2 matrix) ── */

	[data-spectrum-accordion-trigger][data-size='s'][data-density='compact'] {
		min-height: 18px;
	}
	[data-spectrum-accordion-trigger][data-size='s'][data-density='regular'] {
		min-height: 24px;
	}
	[data-spectrum-accordion-trigger][data-size='s'][data-density='spacious'] {
		min-height: 32px;
	}

	[data-spectrum-accordion-trigger][data-size='m'][data-density='compact'] {
		min-height: 24px;
	}
	[data-spectrum-accordion-trigger][data-size='m'][data-density='regular'] {
		min-height: 32px;
	}
	[data-spectrum-accordion-trigger][data-size='m'][data-density='spacious'] {
		min-height: 40px;
	}

	[data-spectrum-accordion-trigger][data-size='l'][data-density='compact'] {
		min-height: 32px;
	}
	[data-spectrum-accordion-trigger][data-size='l'][data-density='regular'] {
		min-height: 40px;
	}
	[data-spectrum-accordion-trigger][data-size='l'][data-density='spacious'] {
		min-height: 48px;
	}

	[data-spectrum-accordion-trigger][data-size='xl'][data-density='compact'] {
		min-height: 40px;
	}
	[data-spectrum-accordion-trigger][data-size='xl'][data-density='regular'] {
		min-height: 48px;
	}
	[data-spectrum-accordion-trigger][data-size='xl'][data-density='spacious'] {
		min-height: 56px;
	}

	/* ── Density: vertical padding (centerPadding equivalent) ── */

	[data-spectrum-accordion-trigger][data-density='compact'] {
		padding: var(--spacing-75) 0;
	}
	[data-spectrum-accordion-trigger][data-density='regular'] {
		padding: var(--spacing-200) 0;
	}
	[data-spectrum-accordion-trigger][data-density='spacious'] {
		padding: var(--spacing-300) 0;
	}

	/* ── Interaction states ── */

	[data-spectrum-accordion-trigger]:hover {
		color: var(--neutral-content-color-hover);
		background-color: light-dark(var(--transparent-black-100), var(--transparent-white-100));
	}

	[data-spectrum-accordion-trigger]:active {
		color: var(--neutral-content-color-down);
		background-color: light-dark(var(--transparent-black-300), var(--transparent-white-300));
	}

	[data-spectrum-accordion-trigger]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: -2px;
		border-radius: var(--corner-radius-100);
	}

	[data-spectrum-accordion-trigger][data-quiet]:focus-visible {
		border-radius: var(--corner-radius-100);
	}

	[data-spectrum-accordion-trigger][data-disabled] {
		color: var(--disabled-content-color);
		cursor: default;
		background-color: transparent;
	}

	/* ── Chevron indicator ── */

	[data-spectrum-accordion-indicator] {
		display: grid;
		place-items: center;
		color: var(--neutral-subdued-content-color-default);
		transition: transform var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-accordion-trigger]:hover [data-spectrum-accordion-indicator] {
		color: var(--neutral-subdued-content-color-hover);
	}

	[data-spectrum-accordion-trigger][data-disabled] [data-spectrum-accordion-indicator] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-accordion-trigger][data-state='open'] [data-spectrum-accordion-indicator] {
		transform: rotate(90deg);
	}

	[data-spectrum-accordion-trigger-content] {
		display: block;
	}
</style>
