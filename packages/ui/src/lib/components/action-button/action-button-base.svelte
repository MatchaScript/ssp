<script lang="ts">
	import type { ActionButtonRenderProps } from './types.js';

	let {
		bitsProps,
		restProps,
		setRef,
		href,
		type = 'button',
		disabled,
		size,
		isQuiet,
		isSelected,
		isEmphasized,
		staticColor,
		density,
		groupOrientation,
		isJustified,
		className,
		icon,
		label,
		iconOnly
	}: ActionButtonRenderProps = $props();
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{...restProps}
	{...bitsProps}
	{@attach (el: Element) => {
		setRef?.(el as HTMLElement);
		return () => setRef?.(null);
	}}
	class={className}
	data-spectrum-actionbutton
	data-size={size}
	data-quiet={isQuiet || undefined}
	data-selected={isSelected || undefined}
	data-emphasized={isEmphasized || undefined}
	data-static-color={staticColor}
	data-density={density}
	data-group-orientation={groupOrientation}
	data-justified={isJustified || undefined}
	data-icon-only={iconOnly || undefined}
	type={href ? undefined : (type ?? 'button')}
	href={href && !disabled ? href : undefined}
	disabled={href ? undefined : disabled}
	aria-disabled={href ? disabled : undefined}
	role={href && disabled ? 'link' : undefined}
	tabindex={href && disabled ? -1 : 0}
>
	{#if icon}
		<span data-spectrum-actionbutton-icon>
			{@render icon()}
		</span>
	{/if}
	{#if label}
		<span data-spectrum-actionbutton-label>
			{@render label()}
		</span>
	{/if}
</svelte:element>

<style>
	/* Shared base styles for ActionButton, ToggleButton, and their group items.
	   All variants render an element with data-spectrum-actionbutton so these
	   rules apply uniformly. Scoped via this component's hash; the wrappers
	   render <ActionButtonBase> so the CSS is emitted in production builds. */

	[data-spectrum-actionbutton] {
		display: inline-grid;
		grid-auto-flow: column;
		place-items: center;
		place-content: center;
		gap: var(--spacing-100);
		box-sizing: border-box;
		text-decoration: none;
		font-family: inherit;
		line-height: var(--lh-component);
		font-weight: 500;
		margin: 0;
		border-style: none;
		cursor: default;
		position: relative;
		transition:
			background-color var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default),
			outline-color var(--duration-fast) var(--ease-default);

		border-radius: var(--corner-radius-100);
		background-color: var(--gray-100);
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-actionbutton]:hover {
		background-color: var(--gray-200);
		color: var(--neutral-content-color-hover);
	}

	[data-spectrum-actionbutton]:active {
		background-color: var(--gray-300);
		color: var(--neutral-content-color-down);
		transform: scale(0.95);
	}

	[data-spectrum-actionbutton][href] {
		cursor: pointer;
	}

	[data-spectrum-actionbutton]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
		/* Raise focused button so the outline isn't clipped by adjacent compact siblings */
		z-index: 2;
	}

	[data-spectrum-actionbutton][data-static-color='white']:focus-visible {
		outline-color: white;
	}
	[data-spectrum-actionbutton][data-static-color='black']:focus-visible {
		outline-color: black;
	}
	[data-spectrum-actionbutton][data-static-color='auto']:focus-visible {
		outline-color: light-dark(white, black);
	}

	/* Quiet */
	[data-spectrum-actionbutton][data-quiet] {
		background-color: transparent;
	}
	[data-spectrum-actionbutton][data-quiet]:hover {
		background-color: var(--gray-100);
	}
	[data-spectrum-actionbutton][data-quiet]:active {
		background-color: var(--gray-200);
	}

	/* Selected */
	[data-spectrum-actionbutton][data-selected] {
		background-color: var(--neutral-background-color-selected-default);
		color: var(--background-base-color);
	}
	[data-spectrum-actionbutton][data-selected]:hover {
		background-color: var(--neutral-background-color-selected-hover);
	}
	[data-spectrum-actionbutton][data-selected]:active {
		background-color: var(--neutral-background-color-selected-down);
	}

	/* Selected + Emphasized */
	[data-spectrum-actionbutton][data-selected][data-emphasized] {
		background-color: var(--accent-background-color-default);
		color: white;
	}
	[data-spectrum-actionbutton][data-selected][data-emphasized]:hover {
		background-color: var(--accent-background-color-hover);
	}
	[data-spectrum-actionbutton][data-selected][data-emphasized]:active {
		background-color: var(--accent-background-color-down);
	}

	/* Disabled */
	[data-spectrum-actionbutton][disabled],
	[data-spectrum-actionbutton][aria-disabled='true'] {
		cursor: not-allowed;
		pointer-events: none;
		background-color: var(--disabled-background-color);
		color: var(--disabled-content-color);
	}
	[data-spectrum-actionbutton][disabled][data-quiet] {
		background-color: transparent;
		color: var(--disabled-content-color);
	}

	/* Static white (on dark backgrounds) */
	[data-spectrum-actionbutton][data-static-color='white'] {
		color: white;
		background-color: var(--transparent-white-100);
	}
	[data-spectrum-actionbutton][data-static-color='white']:hover,
	[data-spectrum-actionbutton][data-static-color='white']:active {
		background-color: var(--transparent-white-200);
	}
	[data-spectrum-actionbutton][data-static-color='white'][data-quiet] {
		background-color: transparent;
	}
	[data-spectrum-actionbutton][data-static-color='white'][data-quiet]:hover,
	[data-spectrum-actionbutton][data-static-color='white'][data-quiet]:active {
		background-color: var(--transparent-white-200);
	}

	/* Static black (on light backgrounds) */
	[data-spectrum-actionbutton][data-static-color='black'] {
		color: black;
		background-color: var(--transparent-black-100);
	}
	[data-spectrum-actionbutton][data-static-color='black']:hover,
	[data-spectrum-actionbutton][data-static-color='black']:active {
		background-color: var(--transparent-black-200);
	}
	[data-spectrum-actionbutton][data-static-color='black'][data-quiet] {
		background-color: transparent;
	}
	[data-spectrum-actionbutton][data-static-color='black'][data-quiet]:hover,
	[data-spectrum-actionbutton][data-static-color='black'][data-quiet]:active {
		background-color: var(--transparent-black-200);
	}

	/* Static white + disabled */
	[data-spectrum-actionbutton][data-static-color='white'][disabled],
	[data-spectrum-actionbutton][data-static-color='white'][aria-disabled='true'] {
		background-color: var(--transparent-white-100);
		color: var(--transparent-white-400);
	}
	[data-spectrum-actionbutton][data-static-color='white'][disabled][data-quiet],
	[data-spectrum-actionbutton][data-static-color='white'][aria-disabled='true'][data-quiet] {
		background-color: transparent;
	}

	/* Static black + disabled */
	[data-spectrum-actionbutton][data-static-color='black'][disabled],
	[data-spectrum-actionbutton][data-static-color='black'][aria-disabled='true'] {
		background-color: var(--transparent-black-100);
		color: var(--transparent-black-400);
	}
	[data-spectrum-actionbutton][data-static-color='black'][disabled][data-quiet],
	[data-spectrum-actionbutton][data-static-color='black'][aria-disabled='true'][data-quiet] {
		background-color: transparent;
	}

	/* Static auto + disabled */
	[data-spectrum-actionbutton][data-static-color='auto'][disabled],
	[data-spectrum-actionbutton][data-static-color='auto'][aria-disabled='true'] {
		background-color: light-dark(var(--transparent-white-100), var(--transparent-black-100));
		color: light-dark(var(--transparent-white-400), var(--transparent-black-400));
	}
	[data-spectrum-actionbutton][data-static-color='auto'][disabled][data-quiet],
	[data-spectrum-actionbutton][data-static-color='auto'][aria-disabled='true'][data-quiet] {
		background-color: transparent;
	}

	/* Static auto — adapts to light/dark mode */
	[data-spectrum-actionbutton][data-static-color='auto'] {
		color: light-dark(white, black);
		background-color: light-dark(var(--transparent-white-100), var(--transparent-black-100));
	}
	[data-spectrum-actionbutton][data-static-color='auto']:hover,
	[data-spectrum-actionbutton][data-static-color='auto']:active {
		background-color: light-dark(var(--transparent-white-200), var(--transparent-black-200));
	}
	[data-spectrum-actionbutton][data-static-color='auto'][data-quiet] {
		background-color: transparent;
	}
	[data-spectrum-actionbutton][data-static-color='auto'][data-quiet]:hover,
	[data-spectrum-actionbutton][data-static-color='auto'][data-quiet]:active {
		background-color: light-dark(var(--transparent-white-200), var(--transparent-black-200));
	}

	/* Static colors + selected */
	[data-spectrum-actionbutton][data-static-color='white'][data-selected],
	[data-spectrum-actionbutton][data-static-color='white'][data-quiet][data-selected] {
		background-color: var(--transparent-white-800);
		color: black;
	}
	[data-spectrum-actionbutton][data-static-color='white'][data-selected]:hover,
	[data-spectrum-actionbutton][data-static-color='white'][data-selected]:active {
		background-color: var(--transparent-white-900);
	}

	[data-spectrum-actionbutton][data-static-color='black'][data-selected],
	[data-spectrum-actionbutton][data-static-color='black'][data-quiet][data-selected] {
		background-color: var(--transparent-black-800);
		color: white;
	}
	[data-spectrum-actionbutton][data-static-color='black'][data-selected]:hover,
	[data-spectrum-actionbutton][data-static-color='black'][data-selected]:active {
		background-color: var(--transparent-black-900);
	}

	[data-spectrum-actionbutton][data-static-color='auto'][data-selected],
	[data-spectrum-actionbutton][data-static-color='auto'][data-quiet][data-selected] {
		background-color: light-dark(var(--transparent-white-800), var(--transparent-black-800));
		color: light-dark(black, white);
	}
	[data-spectrum-actionbutton][data-static-color='auto'][data-selected]:hover,
	[data-spectrum-actionbutton][data-static-color='auto'][data-selected]:active {
		background-color: light-dark(var(--transparent-white-900), var(--transparent-black-900));
	}

	/* Icon wrapper */
	[data-spectrum-actionbutton] [data-spectrum-actionbutton-icon] {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		order: 0;
	}

	/* Label wrapper */
	[data-spectrum-actionbutton] [data-spectrum-actionbutton-label] {
		order: 1;
	}

	/* Sizes */
	[data-spectrum-actionbutton][data-size='xs'] {
		min-height: 20px;
		font-size: var(--text-50);
		padding: 0 var(--spacing-100);
	}
	[data-spectrum-actionbutton][data-size='s'] {
		min-height: var(--spacing-400);
		font-size: var(--text-75);
		padding: 0 var(--spacing-200);
	}
	[data-spectrum-actionbutton][data-size='m'] {
		min-height: var(--spacing-500);
		font-size: var(--text-100);
		padding: 0 var(--spacing-300);
	}
	[data-spectrum-actionbutton][data-size='l'] {
		min-height: var(--spacing-600);
		font-size: var(--text-200);
		padding: 0 var(--spacing-400);
	}
	[data-spectrum-actionbutton][data-size='xl'] {
		min-height: var(--spacing-700);
		font-size: var(--text-300);
		padding: 0 var(--spacing-500);
	}

	/* Icon sizing per button size */
	[data-spectrum-actionbutton][data-size='xs'] [data-spectrum-actionbutton-icon] {
		font-size: 12px;
		--icon-size: 12px;
	}
	[data-spectrum-actionbutton][data-size='s'] [data-spectrum-actionbutton-icon] {
		font-size: 14px;
		--icon-size: 14px;
	}
	[data-spectrum-actionbutton][data-size='m'] [data-spectrum-actionbutton-icon] {
		font-size: 18px;
		--icon-size: 18px;
	}
	[data-spectrum-actionbutton][data-size='l'] [data-spectrum-actionbutton-icon] {
		font-size: 20px;
		--icon-size: 20px;
	}
	[data-spectrum-actionbutton][data-size='xl'] [data-spectrum-actionbutton-icon] {
		font-size: 22px;
		--icon-size: 22px;
	}

	/* Icon-only button */
	[data-spectrum-actionbutton][data-icon-only] {
		min-inline-size: unset;
		padding: var(--spacing-100);
		aspect-ratio: 1;
	}

	/* Justified (set by ActionButtonGroup via context) */
	[data-spectrum-actionbutton][data-justified] {
		flex: 1;
	}

	/* ===== Compact density (inside ActionButtonGroup / ToggleGroup) ===== */
	/* Mirrors RSP S2 ActionButton.tsx border-radius rules. */
	[data-spectrum-actionbutton][data-density='compact'] {
		border-radius: 0;
	}
	/* Absolute corners — direction-independent */
	[data-spectrum-actionbutton][data-density='compact']:first-child {
		border-start-start-radius: var(--corner-radius-100);
	}
	[data-spectrum-actionbutton][data-density='compact']:last-child {
		border-end-end-radius: var(--corner-radius-100);
	}
	/* Horizontal: first → bottom-start, last → top-end */
	[data-spectrum-actionbutton][data-density='compact'][data-group-orientation='horizontal']:first-child {
		border-end-start-radius: var(--corner-radius-100);
	}
	[data-spectrum-actionbutton][data-density='compact'][data-group-orientation='horizontal']:last-child {
		border-start-end-radius: var(--corner-radius-100);
	}
	/* Vertical: first → top-end, last → bottom-start */
	[data-spectrum-actionbutton][data-density='compact'][data-group-orientation='vertical']:first-child {
		border-start-end-radius: var(--corner-radius-100);
	}
	[data-spectrum-actionbutton][data-density='compact'][data-group-orientation='vertical']:last-child {
		border-end-start-radius: var(--corner-radius-100);
	}
</style>
