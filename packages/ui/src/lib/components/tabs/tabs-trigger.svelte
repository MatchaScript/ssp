<script lang="ts">
	import { getTabsContext } from './tabs.svelte.js';
	import type { TabsTriggerProps } from './types.js';
	import { Tabs } from 'bits-ui';

	let { value, isDisabled, children, class: className, ...restProps }: TabsTriggerProps = $props();

	const state = getTabsContext();
</script>

<Tabs.Trigger value={String(value)} disabled={isDisabled}>
	{#snippet child({ props })}
		<button
			{...props}
			{...restProps}
			class={className}
			data-spectrum-tabs-trigger
			data-density={state.density}
		>
			<span class="content">
				{@render children?.()}
			</span>
		</button>
	{/snippet}
</Tabs.Trigger>

<style>
	[data-spectrum-tabs-trigger] {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		cursor: pointer;
		font-family: inherit;
		font-size: var(--text-100);
		font-weight: 400; /* Regular weight by default */
		color: var(--neutral-subdued-content-color-default);
		padding: 0;
		position: relative;
		transition: color var(--duration-100) var(--ease-out);
	}

	[data-spectrum-tabs-trigger][data-density='regular'] {
		height: 38px;
	}

	[data-spectrum-tabs-trigger][data-density='compact'] {
		height: 32px;
	}

	[data-spectrum-tabs-trigger]:hover:not(:disabled) {
		color: var(--neutral-content-color-hover);
	}

	[data-spectrum-tabs-trigger][data-state='active'] {
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-tabs-trigger]:disabled {
		color: var(--disabled-content-color);
		cursor: default;
	}

	/* The underline indicator */
	[data-spectrum-tabs-trigger]::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		height: 2px;
		width: 100%;
		background-color: transparent;
		border-radius: 9999px; /* "full" radius */
		transition: background-color var(--duration-100) var(--ease-out);
	}

	[data-spectrum-tabs-trigger][data-state='active']::after {
		background-color: var(--neutral-content-color-default);
	}

	[data-spectrum-tabs-trigger]:focus-visible {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -2px;
	}

	/* Inner content wrapping */
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-100);
	}
</style>
