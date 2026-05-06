<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Icon } from '$lib/components/icon';
	import type { SideNavItemProps } from './types.js';
	import { getSideNavContext } from './side-nav-context.svelte.js';

	let { icon, exact = false, href, children, ...restProps }: SideNavItemProps = $props();

	const nav = getSideNavContext();

	const isActive = $derived.by(() => {
		if (!href) return false;
		const path = page.url?.pathname ?? '';
		if (exact) return path === href;
		return path.startsWith(href);
	});

	function handleClick() {
		nav.closeNav();
	}
</script>

<a
	{...restProps}
	href={resolve(href as '/')}
	data-spectrum-sidenav-item
	data-active={isActive || undefined}
	aria-current={isActive ? 'page' : undefined}
	onclick={handleClick}
>
	{#if icon}
		<span data-spectrum-sidenav-item-icon>
			<Icon {icon} size="s" />
		</span>
	{/if}
	{#if children}
		<span data-spectrum-sidenav-item-label>
			{@render children()}
		</span>
	{/if}
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
	}

	[data-spectrum-sidenav-item]:hover {
		color: var(--neutral-content-color-hover);
	}

	/* Active indicator pill (left edge) */
	[data-spectrum-sidenav-item]::before {
		content: '';
		grid-column: 1;
		justify-self: end;
		width: 3px;
		height: var(--space-5);
		background-color: transparent;
		transition: background-color var(--duration-100) var(--ease-out);
	}

	[data-spectrum-sidenav-item]:not([data-active]):hover::before {
		background-color: var(--gray-400);
	}

	[data-spectrum-sidenav-item]:focus-visible {
		outline: 2px solid var(--focus-indicator-color);
		outline-offset: -2px;
	}

	[data-active] {
		color: var(--neutral-content-color-default);
		font-weight: 600;
	}

	[data-active]::before {
		background-color: var(--neutral-content-color-default);
	}

	/* Icon slot */
	[data-spectrum-sidenav-item-icon] {
		grid-column: 2;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Label slot */
	[data-spectrum-sidenav-item-label] {
		grid-column: 3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Collapsed: hide labels ──────────────────────── */
	@container nav (max-width: 5rem) {
		[data-spectrum-sidenav-item-label] {
			display: none;
		}
	}
</style>
