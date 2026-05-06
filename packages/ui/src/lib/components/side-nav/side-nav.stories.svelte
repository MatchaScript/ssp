<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as SideNav from './index.js';
	import {
		Home,
		Palette,
		Layers,
		Settings,
		Search,
		LayoutDashboard,
		FolderOpen,
		Database,
		Server,
		LogOut,
		Zap,
		Bookmark,
		Pin
	} from '$lib/components/icon';

	const { Story } = defineMeta({
		title: 'Components/SideNav',
		component: SideNav.Root,
		tags: ['autodocs'],
		argTypes: {
			open: { control: 'boolean' }
		},
		args: {
			open: true
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div
			style="width: 240px; height: 480px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
		>
			<SideNav.Root open={args.open}>
				<SideNav.Section>
					<SideNav.Item href="/" exact icon={Home}>Home</SideNav.Item>
					<SideNav.Item href="/palette" icon={Palette}>Palette</SideNav.Item>
					<SideNav.Item href="/layers" icon={Layers}>Layers</SideNav.Item>
					<SideNav.Item href="/settings" icon={Settings}>Settings</SideNav.Item>
				</SideNav.Section>
			</SideNav.Root>
		</div>
	{/snippet}
</Story>

<Story name="With sections" asChild>
	<div
		style="width: 260px; height: 520px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
	>
		<SideNav.Root open>
			<SideNav.Section heading="Workspace">
				<SideNav.Item href="/" exact icon={LayoutDashboard}>Dashboard</SideNav.Item>
				<SideNav.Item href="/projects" icon={FolderOpen}>Projects</SideNav.Item>
				<SideNav.Item href="/search" icon={Search}>Search</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="Infrastructure">
				<SideNav.Item href="/servers" icon={Server}>Servers</SideNav.Item>
				<SideNav.Item href="/databases" icon={Database}>Databases</SideNav.Item>
				<SideNav.Item href="/layers" icon={Layers}>Layers</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="Account">
				<SideNav.Item href="/settings" icon={Settings}>Settings</SideNav.Item>
				<SideNav.Item href="/logout" icon={LogOut}>Log out</SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>
</Story>

<Story name="With pinned + growing section" asChild>
	<div
		style="width: 260px; height: 520px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
	>
		<SideNav.Root open>
			<SideNav.Section heading="Pinned">
				<SideNav.Item href="/" exact icon={Home}>Home</SideNav.Item>
				<SideNav.Item href="/favorites" icon={Bookmark}>Favorites</SideNav.Item>
				<SideNav.Item href="/quick" icon={Pin}>Quick links</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="All projects" grow>
				{#each Array.from({ length: 14 }, (_, i) => i + 1) as n (n)}
					<SideNav.Item href="/project-{n}" icon={FolderOpen}>Project {n}</SideNav.Item>
				{/each}
			</SideNav.Section>
			<SideNav.Section>
				<SideNav.Item href="/settings" icon={Settings}>Settings</SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>
</Story>

<Story name="Collapsed (icon only)" asChild>
	<div
		style="width: 54px; height: 520px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
	>
		<SideNav.Root open>
			<SideNav.Section>
				<SideNav.Item href="/" exact icon={Home}>Home</SideNav.Item>
				<SideNav.Item href="/search" icon={Search}>Search</SideNav.Item>
				<SideNav.Item href="/projects" icon={FolderOpen}>Projects</SideNav.Item>
				<SideNav.Item href="/zap" icon={Zap}>Actions</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section>
				<SideNav.Item href="/settings" icon={Settings}>Settings</SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>
</Story>

<Story name="Without icons" asChild>
	<div
		style="width: 240px; height: 480px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
	>
		<SideNav.Root open>
			<SideNav.Section heading="Documentation">
				<SideNav.Item href="/getting-started">Getting started</SideNav.Item>
				<SideNav.Item href="/installation">Installation</SideNav.Item>
				<SideNav.Item href="/theming">Theming</SideNav.Item>
				<SideNav.Item href="/components">Components</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="Reference">
				<SideNav.Item href="/api">API</SideNav.Item>
				<SideNav.Item href="/tokens">Design tokens</SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>
</Story>

<Story name="In an app shell" asChild>
	<div
		style="display: grid; grid-template-columns: 240px 1fr; width: 760px; height: 480px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; overflow: hidden;"
	>
		<div
			style="background: var(--background-layer-1-color); border-right: 1px solid var(--neutral-border-color-default);"
		>
			<SideNav.Root open>
				<SideNav.Section heading="Workspace">
					<SideNav.Item href="/" exact icon={LayoutDashboard}>Dashboard</SideNav.Item>
					<SideNav.Item href="/projects" icon={FolderOpen}>Projects</SideNav.Item>
					<SideNav.Item href="/palette" icon={Palette}>Palette</SideNav.Item>
				</SideNav.Section>
				<SideNav.Section heading="Account">
					<SideNav.Item href="/settings" icon={Settings}>Settings</SideNav.Item>
				</SideNav.Section>
			</SideNav.Root>
		</div>
		<main style="padding: 24px; background: var(--background-base-color);">
			<h2 style="margin: 0 0 8px;">Dashboard</h2>
			<p style="margin: 0; color: var(--neutral-subdued-content-color-default);">
				Main content renders next to the side-nav.
			</p>
		</main>
	</div>
</Story>
