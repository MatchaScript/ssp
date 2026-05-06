<script lang="ts">
	import type { SideNavProps } from './types.js';
	import { setSideNavContext } from './side-nav-context.svelte.js';

	let { open = $bindable(false), children, i18n, ...restProps }: SideNavProps = $props();

	function closeNav() {
		open = false;
	}

	setSideNavContext({
		get closeNav() {
			return closeNav;
		}
	});
</script>

{#if open}
	<button
		type="button"
		data-spectrum-sidenav-backdrop
		onclick={closeNav}
		aria-label={i18n?.closeMenu ?? 'Close menu'}
	></button>
{/if}

<aside {...restProps} data-spectrum-sidenav data-open={open || undefined}>
	{@render children?.()}
</aside>

<style>
	/* ── Shell: flex column ──────────────────────── */
	[data-spectrum-sidenav] {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 40;
		container-type: inline-size;
		container-name: nav;
	}

	/* ── Drawer mode (mobile) ────────────────────── */
	@container app (max-width: 767px) {
		[data-spectrum-sidenav] {
			position: fixed;
			inset-block: 0;
			left: 0;
			z-index: 50;
			width: 100%;
			max-width: 18rem;
			transform: translateX(-100%);
			background-color: var(--background-layer-1-color);
			transition: transform var(--duration-normal) var(--ease-out);
		}

		[data-spectrum-sidenav][data-open] {
			transform: translateX(0);
		}
	}

	/* ── Backdrop (mobile only) ──────────────────── */
	[data-spectrum-sidenav-backdrop] {
		display: none;
	}

	@container app (max-width: 767px) {
		[data-spectrum-sidenav-backdrop] {
			display: block;
			position: fixed;
			inset: 0;
			padding: 0;
			border: none;
			background: oklch(0 0 0 / 0.4);
			backdrop-filter: blur(4px);
			z-index: 49;
		}
	}
</style>
