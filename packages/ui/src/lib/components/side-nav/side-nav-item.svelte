<script lang="ts">
	import type { SideNavItemProps } from './types.js';
	import { getSideNavContext } from './side-nav-context.svelte.js';

	let { exact = false, href, children, ...restProps }: SideNavItemProps = $props();

	const nav = getSideNavContext();

	const isActive = $derived(href ? nav.isActive(href, { exact }) : false);

	function handleClick() {
		nav.closeNav();
	}
</script>

<a
	{...restProps}
	{href}
	data-spectrum-sidenav-item
	aria-current={isActive ? 'page' : undefined}
	onclick={handleClick}
>
	{@render children?.()}
</a>

<style>
	[data-spectrum-sidenav-item] {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: subgrid;
		align-items: center;
		height: var(--space-10);
		color: var(--neutral-subdued-content-color-default);
		text-decoration: none;
		font-size: var(--text-75);
		font-weight: 500;
		transition: color var(--duration-100) var(--ease-out);
		overflow: hidden;
		--icon-size: 16px;
	}

	[data-spectrum-sidenav-item]:hover {
		color: var(--neutral-content-color-hover);
	}

	[data-spectrum-sidenav-item]:focus-visible {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -2px;
	}

	[data-spectrum-sidenav-item][aria-current='page'] {
		color: var(--neutral-content-color-default);
		font-weight: 600;
	}

	/*
	 * Active indicator pill — sits in col 1 (rail track), right-aligned so the
	 * pill always lands at the rail's inner edge in both expanded and collapsed
	 * modes (collapsed col 1 is `1fr`).
	 */
	[data-spectrum-sidenav-item]::before {
		content: '';
		grid-column: 1;
		justify-self: end;
		width: 3px;
		height: var(--space-5);
		background-color: transparent;
		border-radius: var(--corner-radius-small-default);
		transition: background-color var(--duration-100) var(--ease-out);
	}

	[data-spectrum-sidenav-item]:not([aria-current='page']):hover::before {
		background-color: var(--gray-400);
	}

	[data-spectrum-sidenav-item][aria-current='page']::before {
		background-color: var(--neutral-content-color-default);
	}

	/* Slot placement */
	[data-spectrum-sidenav-item] :global([data-spectrum-icon]) {
		grid-column: 2;
	}
	[data-spectrum-sidenav-item] :global([data-spectrum-text]) {
		grid-column: 3;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	/* Anything that's neither icon nor text is treated as suffix. */
	[data-spectrum-sidenav-item] :global(> :not([data-spectrum-icon]):not([data-spectrum-text])) {
		grid-column: 4;
		justify-self: end;
		color: var(--neutral-subdued-content-color-default);
	}

	@container nav (max-width: 5rem) {
		[data-spectrum-sidenav-item] :global([data-spectrum-text]),
		[data-spectrum-sidenav-item] :global(> :not([data-spectrum-icon]):not([data-spectrum-text])) {
			display: none;
		}
	}
</style>
