<script lang="ts">
	import type { SegmentedControlItemProps } from './types.js';
	import { RadioGroup } from 'bits-ui';

	let {
		id,
		isDisabled = false,
		children,
		icon,
		class: className,
		...restProps
	}: SegmentedControlItemProps = $props();
</script>

<RadioGroup.Item value={id} disabled={isDisabled} {...restProps}>
	{#snippet child({ props, checked })}
		<button
			{...props}
			class={className}
			data-spectrum-segmented-control-item
			data-selected={checked || undefined}
		>
			{#if icon}
				<span data-spectrum-segmented-control-item-icon>
					{@render icon()}
				</span>
			{/if}
			{#if children}
				<span data-spectrum-segmented-control-item-label>
					{@render children()}
				</span>
			{/if}
		</button>
	{/snippet}
</RadioGroup.Item>

<style>
	[data-spectrum-segmented-control-item] {
		display: inline-grid;
		grid-auto-flow: column;
		place-items: center;
		place-content: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		min-height: var(--spacing-500);
		border-radius: var(--corner-radius-300);
		border: var(--border-width-200) solid transparent;
		background-color: transparent;
		color: var(--gray-700);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--text-100);
		line-height: var(--lh-component, 1.3);
		white-space: nowrap;
		box-sizing: border-box;
		transition:
			background-color var(--duration-fast, 0.13s) var(--ease-default, ease-out),
			border-color var(--duration-fast, 0.13s) var(--ease-default, ease-out),
			color var(--duration-fast, 0.13s) var(--ease-default, ease-out),
			box-shadow var(--duration-fast, 0.13s) var(--ease-default, ease-out);
		user-select: none;
		margin: 0;
	}

	/* Wrapper styles */
	[data-spectrum-segmented-control-item] [data-spectrum-segmented-control-item-icon] {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		font-size: 18px;
		--icon-size: 18px;
	}
	[data-spectrum-segmented-control-item-label] {
		/* TODO: 後でちゃんと検討 */
		text-box-edge: cap alphabetic;
		text-box-trim: trim-both;
	}

	/* Selected State (Checked) */
	[data-spectrum-segmented-control-item][data-selected] {
		background-color: var(--gray-25);
		color: var(--gray-800);
		border-color: var(--gray-900);
		box-shadow: var(--shadow-sm);
	}

	/* Focus Ring */
	[data-spectrum-segmented-control-item]:focus-visible {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -1px;
		z-index: 1;
	}

	/* Disabled State */
	[data-spectrum-segmented-control-item][data-disabled] {
		cursor: not-allowed;
		pointer-events: none;
		color: var(--disabled-content-color);
	}

	/* Disabled but selected */
	[data-spectrum-segmented-control-item][data-disabled][data-selected] {
		background-color: var(--disabled-background-color);
		box-shadow: none;
		border-color: transparent;
	}
</style>
