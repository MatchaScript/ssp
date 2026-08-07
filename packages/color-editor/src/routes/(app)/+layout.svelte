<script lang="ts">
	import { page } from '$app/state';
	import { onDestroy, untrack } from 'svelte';
	import {
		Palette,
		Layers,
		Edit,
		ChartSpline,
		Sun,
		Settings,
		Menu as MenuIcon
	} from '@matchalatte/ssp-ui/components/icon';
	import { Icon, ActionButton, SideNav, Text } from '@matchalatte/ssp-ui';
	import { m } from '$lib/paraglide/messages';
	import { themeState } from '$lib/stores/theme.svelte';

	let { children } = $props();

	function matchPath(href: string, { exact }: { exact?: boolean } = {}) {
		const path = page.url.pathname;
		return exact ? path === href : path.startsWith(href);
	}

	const cleanupTheme = untrack(() => themeState.init());
	onDestroy(cleanupTheme);

	let navOpen = $state(false);
	let navCollapsed = $state(false);
</script>

<div class="app-layout" class:app-layout--collapsed={navCollapsed}>
	<!-- Col 1: desktop collapse toggle -->
	<div class="app-toggle">
		<ActionButton
			isQuiet
			size="s"
			onclick={() => (navCollapsed = !navCollapsed)}
			title={navCollapsed ? m.nav_expand_sidebar() : m.nav_collapse_sidebar()}
			aria-label={navCollapsed ? m.nav_expand_sidebar() : m.nav_collapse_sidebar()}
		>
			<Icon icon={MenuIcon} />
		</ActionButton>
	</div>

	<!-- Col 1-2: navigation -->
	<div class="app-nav-wrapper">
		<SideNav.Root bind:open={navOpen} activeMatcher={matchPath}>
			<SideNav.Section grow heading={m.nav_main()}>
				<SideNav.Item href="/create">
					<Icon icon={Palette} />
					<Text>{m.create_title()}</Text>
				</SideNav.Item>
				<SideNav.Item href="/theme-colors">
					<Icon icon={Layers} />
					<Text>{m.theme_colors_title()}</Text>
				</SideNav.Item>
				<SideNav.Item href="/editor">
					<Icon icon={Edit} />
					<Text>{m.editor_title()}</Text>
				</SideNav.Item>
				<SideNav.Item href="/lightness">
					<Icon icon={Sun} />
					<Text>{m.lightness_title()}</Text>
				</SideNav.Item>
				<SideNav.Item href="/chromaticity">
					<Icon icon={ChartSpline} />
					<Text>{m.chromaticity_title()}</Text>
				</SideNav.Item>
			</SideNav.Section>

			<SideNav.Section>
				<SideNav.Item href="/settings">
					<Icon icon={Settings} />
					<Text>{m.nav_settings()}</Text>
				</SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>

	<!-- Col 3: content area. Each page renders its own PageHeader as the top row. -->
	<div class="app-content">
		<div class="app-menu-btn">
			<ActionButton
				isQuiet
				size="s"
				onclick={() => (navOpen = true)}
				title={m.header_menu()}
				aria-label={m.header_menu()}
			>
				<Icon icon={MenuIcon} />
			</ActionButton>
		</div>

		<main class="app-main">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.app-layout {
		display: grid;
		grid-template-columns: var(--space-16) calc(12rem - var(--space-16)) 1fr;
		grid-template-rows: auto 1fr;
		height: 100dvh;
		container-type: inline-size;
		container-name: app;
		background-color: var(--background-layer-1-color);
		transition: grid-template-columns 200ms ease;
	}

	.app-layout--collapsed {
		grid-template-columns: var(--space-16) 0px 1fr;
	}

	/* Row 1 exists only to line the toggle up with each page's header bar. */
	.app-toggle {
		grid-column: 1;
		grid-row: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 3rem;
		background-color: var(--background-layer-1-color);
	}

	.app-nav-wrapper {
		grid-column: 1 / 3;
		grid-row: 2;
	}

	.app-content {
		grid-column: 3;
		grid-row: 1 / -1;
		display: grid;
		min-height: 0;
		background-color: var(--background-base-color);
		border-top-left-radius: var(--corner-radius-medium-default);
		border-bottom-left-radius: var(--corner-radius-medium-default);
		border-top: 1px solid var(--gray-200);
		border-left: 1px solid var(--gray-200);
		box-shadow: var(--drop-shadow-elevated);
		position: relative;
		z-index: 10;
	}

	.app-menu-btn {
		display: none;
	}

	.app-main {
		overflow-y: auto;
		min-height: 0;
	}

	@media (max-width: 767px) {
		.app-layout,
		.app-layout--collapsed {
			grid-template-columns: 1fr;
		}
	}

	@container app (max-width: 767px) {
		.app-toggle {
			display: none;
		}

		.app-menu-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			top: 0;
			inset-inline-start: var(--space-2);
			height: 3rem;
			z-index: 1;
		}

		.app-nav-wrapper {
			grid-column: 1 / -1;
		}

		.app-content {
			grid-column: 1;
			grid-row: 1 / -1;
			border-radius: 0;
			border-top: none;
			border-left: none;
			box-shadow: none;
		}
	}
</style>
