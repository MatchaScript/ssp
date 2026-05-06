<script lang="ts">
	import type { ButtonRootProps } from './types.js';

	let {
		href,
		type = 'button',
		children,
		icon,
		isDisabled = false,
		ref = $bindable(null),
		variant = 'primary',
		treatment = 'fill',
		size = 'm',
		staticColor,
		class: className,
		...restProps
	}: ButtonRootProps = $props();

	let iconOnly = $derived(!!icon && !children);
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{...restProps}
	bind:this={ref}
	class={className}
	data-spectrum-button
	data-variant={variant}
	data-treatment={treatment}
	data-size={size}
	data-static-color={staticColor}
	data-icon-only={iconOnly || undefined}
	type={href ? undefined : type}
	href={href && !isDisabled ? href : undefined}
	disabled={href ? undefined : isDisabled}
	aria-disabled={href ? isDisabled : undefined}
	role={href && isDisabled ? 'link' : undefined}
	tabindex={href && isDisabled ? -1 : undefined}
>
	{#if icon}
		<span data-spectrum-button-icon>
			{@render icon()}
		</span>
	{/if}
	{#if children}
		<span data-spectrum-button-label>
			{@render children()}
		</span>
	{/if}
</svelte:element>

<style>
	/* Base Settings - applying Grid layout */
	[data-spectrum-button] {
		display: inline-grid;
		grid-auto-flow: column;
		place-items: center;
		place-content: center;
		gap: var(--space-2);
		box-sizing: border-box;
		text-decoration: none;
		font-family: inherit;
		line-height: var(--lh-component);
		font-weight: 700;
		margin: 0;
		border-width: var(--border-width-200);
		border-style: solid;
		cursor: default;
		position: relative; /* Required for ::after overlay */
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default),
			outline-color var(--duration-fast) var(--ease-default);

		border-radius: 9999px;
	}

	/* Subtle Hover Overlay - Replaces aggressive background color overrides */
	[data-spectrum-button]::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background-color: var(--neutral-content-color-default);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	/* Apply overlay specifically to secondary, outline, and static-color (Primary/Accent/Negative fill have explicit semantic hover tokens) */
	[data-spectrum-button][data-treatment='outline']:hover::after,
	[data-spectrum-button][data-variant='secondary'][data-treatment='fill']:hover::after,
	[data-spectrum-button][data-static-color]:hover::after {
		opacity: var(--background-opacity-hover);
	}
	[data-spectrum-button][data-treatment='outline']:active::after,
	[data-spectrum-button][data-variant='secondary'][data-treatment='fill']:active::after,
	[data-spectrum-button][data-static-color]:active::after {
		opacity: var(--background-opacity-down);
	}

	/* href buttons use pointer cursor */
	[data-spectrum-button][href] {
		cursor: pointer;
	}

	/* Focus visible */
	[data-spectrum-button]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	/* Press scale */
	[data-spectrum-button]:active:not([disabled]):not([aria-disabled='true']) {
		transform: scale(0.95);
	}

	[data-spectrum-button][disabled],
	[data-spectrum-button][aria-disabled='true'] {
		pointer-events: none;
	}

	/* Icon wrapper */
	[data-spectrum-button] [data-spectrum-button-icon] {
		display: grid;
		place-items: center;
		order: 0;
	}

	/* Label wrapper */
	[data-spectrum-button] [data-spectrum-button-label] {
		order: 1;

		/* TODO: 後でちゃんと検討、line-height: var(--lh-component);で対策済み 
		text-box-edge: cap alphabetic;
		text-box-trim: trim-both;*/
	}

	/* Icon sizing per button size */
	[data-spectrum-button][data-size='s'] [data-spectrum-button-icon] {
		font-size: 14px;
		--icon-size: 14px;
	}
	[data-spectrum-button][data-size='m'] [data-spectrum-button-icon] {
		font-size: 18px;
		--icon-size: 18px;
	}
	[data-spectrum-button][data-size='l'] [data-spectrum-button-icon] {
		font-size: 20px;
		--icon-size: 20px;
	}
	[data-spectrum-button][data-size='xl'] [data-spectrum-button-icon] {
		font-size: 22px;
		--icon-size: 22px;
	}

	/* Icon-only button */
	[data-spectrum-button][data-icon-only] {
		min-inline-size: unset;
		padding: var(--space-2);
		aspect-ratio: 1;
	}

	/* Accent Fill */
	[data-spectrum-button][data-variant='accent'][data-treatment='fill'] {
		background-color: var(--accent-background-color-default);
		border-color: var(--accent-background-color-default);
		color: white;
	}
	[data-spectrum-button][data-variant='accent'][data-treatment='fill']:hover {
		background-color: var(--accent-background-color-hover);
		border-color: var(--accent-background-color-hover);
	}
	[data-spectrum-button][data-variant='accent'][data-treatment='fill']:active {
		background-color: var(--accent-background-color-down);
		border-color: var(--accent-background-color-down);
	}

	/* Primary Fill */
	[data-spectrum-button][data-variant='primary'][data-treatment='fill'] {
		background-color: var(--neutral-background-color-default);
		border-color: var(--neutral-background-color-default);
		color: white;
	}
	[data-spectrum-button][data-variant='primary'][data-treatment='fill']:hover {
		background-color: var(--neutral-background-color-hover);
		border-color: var(--neutral-background-color-hover);
	}
	[data-spectrum-button][data-variant='primary'][data-treatment='fill']:active {
		background-color: var(--neutral-background-color-down);
		border-color: var(--neutral-background-color-down);
	}

	/* Secondary Fill */
	[data-spectrum-button][data-variant='secondary'][data-treatment='fill'] {
		/* Note: Directly uses global gray-100 just like the official SWC system-theme-bridge.css mapping */
		background-color: var(--gray-100);
		border-color: transparent;
		color: var(--neutral-content-color-default);
	}

	/* Negative Fill */
	[data-spectrum-button][data-variant='negative'][data-treatment='fill'] {
		background-color: var(--negative-background-color-default);
		border-color: var(--negative-background-color-default);
		color: white;
	}
	[data-spectrum-button][data-variant='negative'][data-treatment='fill']:hover {
		background-color: var(--negative-background-color-hover);
		border-color: var(--negative-background-color-hover);
	}
	[data-spectrum-button][data-variant='negative'][data-treatment='fill']:active {
		background-color: var(--negative-background-color-down);
		border-color: var(--negative-background-color-down);
	}

	/* Outline Treatments */
	[data-spectrum-button][data-treatment='outline'] {
		background-color: transparent;
	}
	[data-spectrum-button][data-variant='accent'][data-treatment='outline'] {
		border-color: var(--accent-background-color-default);
		color: var(--accent-background-color-default);
	}

	[data-spectrum-button][data-variant='primary'][data-treatment='outline'] {
		border-color: var(--neutral-content-color-default);
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-button][data-variant='secondary'][data-treatment='outline'] {
		/* Note: Matches system-button-secondary-outline-border-color-default */
		border-color: var(--gray-300);
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-button][data-variant='negative'][data-treatment='outline'] {
		border-color: var(--negative-background-color-default);
		color: var(--negative-background-color-default);
	}

	/* Disabled */
	[data-spectrum-button][disabled][data-treatment='fill'],
	[data-spectrum-button][aria-disabled='true'][data-treatment='fill'] {
		background-color: var(--disabled-background-color);
		border-color: var(--disabled-border-color);
		color: var(--disabled-content-color);
	}
	[data-spectrum-button][disabled][data-treatment='outline'],
	[data-spectrum-button][aria-disabled='true'][data-treatment='outline'] {
		border-color: var(--disabled-border-color);
		color: var(--disabled-content-color);
	}

	/* Static Colors */
	[data-spectrum-button][data-static-color='white'][data-treatment='fill'] {
		background-color: var(--transparent-white-800);
		border-color: transparent;
		color: black;
	}
	[data-spectrum-button][data-static-color='white'][data-treatment='outline'] {
		background-color: transparent;
		border-color: var(--transparent-white-800);
		color: white;
	}
	[data-spectrum-button][data-static-color='black'][data-treatment='fill'] {
		background-color: var(--transparent-black-800);
		border-color: transparent;
		color: white;
	}
	[data-spectrum-button][data-static-color='black'][data-treatment='outline'] {
		background-color: transparent;
		border-color: var(--transparent-black-800);
		color: black;
	}

	/* Sizes */
	[data-spectrum-button][data-size='s'] {
		min-height: var(--space-6);
		min-inline-size: calc(var(--space-6) * 2.25);
		font-size: var(--text-75);
		padding: 0 calc(var(--space-3) - var(--border-width-200));
	}
	[data-spectrum-button][data-size='m'] {
		min-height: var(--space-8);
		min-inline-size: calc(var(--space-8) * 2.25);
		font-size: var(--text-100);
		padding: 0 calc(var(--space-4) - var(--border-width-200));
	}
	[data-spectrum-button][data-size='l'] {
		min-height: var(--space-10);
		min-inline-size: calc(var(--space-10) * 2.25);
		font-size: var(--text-200);
		padding: 0 calc(var(--space-5) - var(--border-width-200));
	}
	[data-spectrum-button][data-size='xl'] {
		min-height: var(--space-12);
		min-inline-size: calc(var(--space-12) * 2.25);
		font-size: var(--text-300);
		padding: 0 calc(var(--space-6) - var(--border-width-200));
	}
</style>
