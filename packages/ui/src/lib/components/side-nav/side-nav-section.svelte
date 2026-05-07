<script lang="ts">
	import type { SideNavSectionProps } from './types.js';

	let { grow = false, heading, children, ...restProps }: SideNavSectionProps = $props();
</script>

<div {...restProps} data-spectrum-sidenav-section data-grow={grow || undefined}>
	{#if heading}
		<h2 data-spectrum-sidenav-heading>{heading}</h2>
	{/if}
	{@render children?.()}
</div>

<style>
	/*
	 * Four subgrid tracks: indicator rail | icon | text | suffix.
	 * - indicator rail is fixed-width and houses the active pill (placed by
	 *   each item via ::before flowing into col 1)
	 * - icon col is `auto` so it collapses when empty
	 * - text col fills available space
	 * - suffix col is `auto` and right-aligned
	 */
	[data-spectrum-sidenav-section] {
		--side-nav-col-indicator: var(--space-3);

		display: grid;
		grid-template-columns: var(--side-nav-col-indicator) auto 1fr auto;
		column-gap: var(--space-2);
		row-gap: var(--space-1);
		padding-block: var(--space-2);
	}

	[data-spectrum-sidenav-section][data-grow] {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		align-content: start;
	}

	/*
	 * If no item in this section has an icon, drop the icon column entirely so
	 * labels sit flush after the rail.
	 */
	[data-spectrum-sidenav-section]:not(:has(:global([data-spectrum-icon]))) {
		grid-template-columns: var(--side-nav-col-indicator) 1fr auto;
	}

	/* Non-SideNavItem children (Picker, ActionButton, etc.) span from icon col onwards. */
	[data-spectrum-sidenav-section]
		> :global(:not([data-spectrum-sidenav-item]):not([data-spectrum-sidenav-heading])) {
		grid-column: 2 / -1;
		padding-inline-end: var(--space-3);
	}

	[data-spectrum-sidenav-heading] {
		grid-column: 2 / -1;
		margin: 0;
		font-size: var(--text-75);
		font-weight: 600;
		line-height: var(--space-8);
		color: var(--neutral-subdued-content-color-default);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		user-select: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@container app (max-width: 767px) {
		[data-spectrum-sidenav-section]:first-child {
			border-bottom: 1px solid var(--gray-200);
		}
	}

	/*
	 * Collapsed: rail becomes a flex track on each side so the icon column
	 * (auto-sized) lands in the visual center. Pill stays in col 1 via the same
	 * subgrid + justify-self: end strategy used in expanded mode. Text + suffix
	 * are hidden by the item itself.
	 */
	@container nav (max-width: 5rem) {
		[data-spectrum-sidenav-section] {
			grid-template-columns: 1fr auto 1fr;
		}

		[data-spectrum-sidenav-section] > :global(:not([data-spectrum-sidenav-item])) {
			display: none;
		}

		[data-spectrum-sidenav-heading] {
			display: none;
		}
	}
</style>
