<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy, untrack } from 'svelte';
	import {
		Palette,
		Layers,
		Edit,
		ChartSpline,
		Sun,
		Settings,
		Menu as MenuIcon,
		Save
	} from '@ssp/ui/components/icon';
	import { Icon, ActionButton, SideNav, Divider } from '@ssp/ui';
	import { Picker, PickerTrigger, PickerContent, PickerItem } from '@ssp/ui/components/picker';
	import { m } from '$lib/paraglide/messages';
	import { themeState } from '$lib/stores/theme.svelte';
	import { configState } from '$lib/stores/config.svelte';
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { COLOR_SPACES, COLOR_SPACE_IDS, type ColorSpaceId } from '$lib/types/color-space';

	function handleSave() {
		configState.save();
	}

	function handleReset() {
		configState.reset();
	}

	let { children } = $props();

	const cleanupTheme = untrack(() => themeState.init());
	onDestroy(cleanupTheme);

	let navOpen = $state(false);
	let navCollapsed = $state(false);
</script>

<div class="app-layout" class:app-layout--collapsed={navCollapsed}>
	<!-- Col 1: デスクトップ用トグルボタン -->
	<div class="app-toggle">
		<ActionButton
			isQuiet
			size="s"
			onclick={() => (navCollapsed = !navCollapsed)}
			title={navCollapsed ? m.nav_expand_sidebar() : m.nav_collapse_sidebar()}
			aria-label={navCollapsed ? m.nav_expand_sidebar() : m.nav_collapse_sidebar()}
		>
			{#snippet icon()}<Icon icon={MenuIcon} />{/snippet}
		</ActionButton>
	</div>

	<!-- Col 1-2: ナビ -->
	<div class="app-nav-wrapper">
		<SideNav.Root bind:open={navOpen}>
			<SideNav.Section grow heading={m.nav_main()}>
				<SideNav.Item href="/create" icon={Palette}>
					{m.create_title()}
				</SideNav.Item>
				<SideNav.Item href="/theme-colors" icon={Layers}>
					{m.theme_colors_title()}
				</SideNav.Item>
				<SideNav.Item href="/editor" icon={Edit}>
					{m.editor_title()}
				</SideNav.Item>
				<SideNav.Item href="/lightness" icon={Sun}>
					{m.lightness_title()}
				</SideNav.Item>
				<SideNav.Item href="/chromaticity" icon={ChartSpline}>
					{m.chromaticity_title()}
				</SideNav.Item>
			</SideNav.Section>

			<SideNav.Section>
				<SideNav.Item href="/settings" icon={Settings}>
					{m.nav_settings()}
				</SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>

	<!-- Col 3: コンテンツエリア -->
	<div class="app-content">
		<div class="app-menu-btn">
			<ActionButton
				isQuiet
				size="s"
				onclick={() => (navOpen = true)}
				title={m.header_menu()}
				aria-label={m.header_menu()}
			>
				{#snippet icon()}<Icon icon={MenuIcon} />{/snippet}
			</ActionButton>
		</div>

		<header class="app-header">
			<a href={resolve('/')} class="header-logo">Color Editor</a>
			<div class="header-actions">
				<ActionButton size="s" onclick={handleSave} aria-label={m.header_save()}>
					{#snippet icon()}<Icon icon={Save} />{/snippet}
					{m.header_save()}
				</ActionButton>
				<ActionButton size="s" isQuiet onclick={handleReset} aria-label={m.header_reset()}>
					{m.header_reset()}
				</ActionButton>
			</div>
			<div class="header-color-space">
				<Picker
					selectedKey={colorSpaceState.id}
					onSelectionChange={(v) => colorSpaceState.setId(v as ColorSpaceId)}
					label={COLOR_SPACES[colorSpaceState.id].label}
					selectionMode="single"
					size="s"
				>
					<PickerTrigger />
					<PickerContent>
						{#each COLOR_SPACE_IDS as id (id)}
							<PickerItem value={id} label={COLOR_SPACES[id].label} />
						{/each}
					</PickerContent>
				</Picker>
			</div>
		</header>
		<Divider size="s" />
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

	.app-toggle {
		grid-column: 1;
		grid-row: 1;
		display: flex;
		align-items: center;
		justify-content: center;
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
		grid-template-rows: subgrid;
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

	.app-header {
		grid-row: 1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		height: 3.5rem;
		padding-inline: var(--space-4);
		z-index: 1;
	}

	.header-color-space {
		width: 8rem;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.header-logo {
		flex: 1;
		font-size: var(--text-200);
		font-weight: 700;
		letter-spacing: -0.025em;
		color: var(--neutral-content-color-default);
		text-decoration: none;
	}

	.app-main {
		grid-row: 2;
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
			height: 3.5rem;
			z-index: 1;
		}

		.app-header {
			padding-inline-start: calc(var(--space-2) + var(--space-10));
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
