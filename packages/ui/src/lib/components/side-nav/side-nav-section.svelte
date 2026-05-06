<script lang="ts">
	import type { SideNavSectionProps } from './types.js';

	let { grow = false, heading, children, ...restProps }: SideNavSectionProps = $props();
</script>

<div {...restProps} data-spectrum-sidenav-section data-grow={grow || undefined}>
	{#if heading}
		<span data-spectrum-sidenav-heading>{heading}</span>
	{/if}
	{@render children?.()}
</div>

<style>
	[data-spectrum-sidenav-section] {
		display: grid;
		grid-template-columns: var(--space-3) var(--space-8) minmax(var(--space-3), 1fr);
		row-gap: var(--space-1);
		padding-block: var(--space-2);
	}

	[data-spectrum-sidenav-section][data-grow] {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		align-content: start;
	}

	/* Non-SideNavItem children (Picker, ActionButton, etc.) default to icon+label columns */
	[data-spectrum-sidenav-section]
		> :global(:not([data-spectrum-sidenav-item]):not([data-spectrum-sidenav-heading])) {
		grid-column: 2 / -1;
		padding-inline-end: var(--space-3);
	}

	/* Section heading (caption) */
	[data-spectrum-sidenav-heading] {
		grid-column: 2 / -1;
		font-size: var(--text-75);
		font-weight: 600;
		color: var(--neutral-subdued-content-color-default);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding-inline-start: var(--space-2);
		user-select: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Mobile: border on first section (header separator) */
	@container app (max-width: 767px) {
		[data-spectrum-sidenav-section]:first-child {
			border-bottom: 1px solid var(--gray-200);
		}
	}

	/* Collapsed: hide non-SideNavItem children and headings */
	@container nav (max-width: 5rem) {
		[data-spectrum-sidenav-section] > :global(:not([data-spectrum-sidenav-item])) {
			display: none;
		}

		[data-spectrum-sidenav-heading] {
			display: none;
		}
	}
</style>
