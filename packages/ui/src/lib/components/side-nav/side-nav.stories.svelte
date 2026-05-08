<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as SideNav from './index.js';
	import { ActionButton } from '$lib/components/action-button';
	import { Badge } from '$lib/components/badge';
	import { Text } from '$lib/components/text';
	import {
		Icon,
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
		Pin,
		Menu as MenuIcon
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

<script lang="ts">
	let drawerOpen = $state(false);
	let activeHref = $state<string>('/');
	let collapsedActiveHref = $state<string>('/projects');

	function makeMatcher(getCurrent: () => string) {
		return (href: string, opts: { exact?: boolean } = {}) => {
			const current = getCurrent();
			return opts.exact ? current === href : current.startsWith(href);
		};
	}

	function selectFactory(setter: (v: string) => void) {
		return (href: string) => (e: Event) => {
			e.preventDefault();
			setter(href);
		};
	}

	const matchActive = makeMatcher(() => activeHref);
	const selectActive = selectFactory((v) => (activeHref = v));

	const matchCollapsedActive = makeMatcher(() => collapsedActiveHref);
	const selectCollapsedActive = selectFactory((v) => (collapsedActiveHref = v));
</script>

<Story name="Example">
	{#snippet template(args)}
		<div
			style="width: 240px; height: 480px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
		>
			<SideNav.Root open={args.open}>
				<SideNav.Section>
					<SideNav.Item href="/" exact>
						<Icon icon={Home} />
						<Text>Home</Text>
					</SideNav.Item>
					<SideNav.Item href="/palette">
						<Icon icon={Palette} />
						<Text>Palette</Text>
					</SideNav.Item>
					<SideNav.Item href="/layers">
						<Icon icon={Layers} />
						<Text>Layers</Text>
					</SideNav.Item>
					<SideNav.Item href="/settings">
						<Icon icon={Settings} />
						<Text>Settings</Text>
					</SideNav.Item>
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
				<SideNav.Item href="/" exact>
					<Icon icon={LayoutDashboard} />
					<Text>Dashboard</Text>
				</SideNav.Item>
				<SideNav.Item href="/projects">
					<Icon icon={FolderOpen} />
					<Text>Projects</Text>
				</SideNav.Item>
				<SideNav.Item href="/search">
					<Icon icon={Search} />
					<Text>Search</Text>
				</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="Infrastructure">
				<SideNav.Item href="/servers">
					<Icon icon={Server} />
					<Text>Servers</Text>
				</SideNav.Item>
				<SideNav.Item href="/databases">
					<Icon icon={Database} />
					<Text>Databases</Text>
				</SideNav.Item>
				<SideNav.Item href="/layers">
					<Icon icon={Layers} />
					<Text>Layers</Text>
				</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="Account">
				<SideNav.Item href="/settings">
					<Icon icon={Settings} />
					<Text>Settings</Text>
				</SideNav.Item>
				<SideNav.Item href="/logout">
					<Icon icon={LogOut} />
					<Text>Log out</Text>
				</SideNav.Item>
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
				<SideNav.Item href="/" exact>
					<Icon icon={Home} />
					<Text>Home</Text>
				</SideNav.Item>
				<SideNav.Item href="/favorites">
					<Icon icon={Bookmark} />
					<Text>Favorites</Text>
				</SideNav.Item>
				<SideNav.Item href="/quick">
					<Icon icon={Pin} />
					<Text>Quick links</Text>
				</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="All projects" grow>
				{#each Array.from({ length: 14 }, (_, i) => i + 1) as n (n)}
					<SideNav.Item href="/project-{n}">
						<Icon icon={FolderOpen} />
						<Text>Project {n}</Text>
					</SideNav.Item>
				{/each}
			</SideNav.Section>
			<SideNav.Section>
				<SideNav.Item href="/settings">
					<Icon icon={Settings} />
					<Text>Settings</Text>
				</SideNav.Item>
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
				<SideNav.Item href="/" exact>
					<Icon icon={Home} />
					<Text>Home</Text>
				</SideNav.Item>
				<SideNav.Item href="/search">
					<Icon icon={Search} />
					<Text>Search</Text>
				</SideNav.Item>
				<SideNav.Item href="/projects">
					<Icon icon={FolderOpen} />
					<Text>Projects</Text>
				</SideNav.Item>
				<SideNav.Item href="/zap">
					<Icon icon={Zap} />
					<Text>Actions</Text>
				</SideNav.Item>
			</SideNav.Section>
			<SideNav.Section>
				<SideNav.Item href="/settings">
					<Icon icon={Settings} />
					<Text>Settings</Text>
				</SideNav.Item>
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
				<SideNav.Item href="/getting-started"><Text>Getting started</Text></SideNav.Item>
				<SideNav.Item href="/installation"><Text>Installation</Text></SideNav.Item>
				<SideNav.Item href="/theming"><Text>Theming</Text></SideNav.Item>
				<SideNav.Item href="/components"><Text>Components</Text></SideNav.Item>
			</SideNav.Section>
			<SideNav.Section heading="Reference">
				<SideNav.Item href="/api"><Text>API</Text></SideNav.Item>
				<SideNav.Item href="/tokens"><Text>Design tokens</Text></SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>
</Story>

<Story name="Active item (interactive)">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 12px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Active: <code>{activeHref}</code>
			</div>
			<div
				style="width: 240px; height: 360px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
			>
				<SideNav.Root open activeMatcher={matchActive}>
					<SideNav.Section heading="Workspace">
						<SideNav.Item href="/" exact onclick={selectActive('/')}>
							<Icon icon={Home} />
							<Text>Home</Text>
						</SideNav.Item>
						<SideNav.Item href="/projects" onclick={selectActive('/projects')}>
							<Icon icon={FolderOpen} />
							<Text>Projects</Text>
						</SideNav.Item>
						<SideNav.Item href="/search" onclick={selectActive('/search')}>
							<Icon icon={Search} />
							<Text>Search</Text>
						</SideNav.Item>
					</SideNav.Section>
					<SideNav.Section>
						<SideNav.Item href="/settings" onclick={selectActive('/settings')}>
							<Icon icon={Settings} />
							<Text>Settings</Text>
						</SideNav.Item>
					</SideNav.Section>
				</SideNav.Root>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Collapsed with active item">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 12px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Active: <code>{collapsedActiveHref}</code> — pill stays anchored to the left edge in collapsed
				mode.
			</div>
			<div
				style="width: 54px; height: 360px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
			>
				<SideNav.Root open activeMatcher={matchCollapsedActive}>
					<SideNav.Section>
						<SideNav.Item href="/" exact onclick={selectCollapsedActive('/')}>
							<Icon icon={Home} />
							<Text>Home</Text>
						</SideNav.Item>
						<SideNav.Item href="/projects" onclick={selectCollapsedActive('/projects')}>
							<Icon icon={FolderOpen} />
							<Text>Projects</Text>
						</SideNav.Item>
						<SideNav.Item href="/search" onclick={selectCollapsedActive('/search')}>
							<Icon icon={Search} />
							<Text>Search</Text>
						</SideNav.Item>
						<SideNav.Item href="/settings" onclick={selectCollapsedActive('/settings')}>
							<Icon icon={Settings} />
							<Text>Settings</Text>
						</SideNav.Item>
					</SideNav.Section>
				</SideNav.Root>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With suffix slot" asChild>
	<div
		style="width: 260px; height: 360px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; background: var(--background-layer-1-color); overflow: hidden;"
	>
		<SideNav.Root open>
			<SideNav.Section heading="Inbox">
				<SideNav.Item href="/inbox">
					<Icon icon={Home} />
					<Text>All</Text>
					<Badge size="S" variant="neutral">128</Badge>
				</SideNav.Item>
				<SideNav.Item href="/unread">
					<Icon icon={Bookmark} />
					<Text>Unread</Text>
					<Badge size="S" variant="accent">12</Badge>
				</SideNav.Item>
				<SideNav.Item href="/flagged">
					<Icon icon={Pin} />
					<Text>Flagged</Text>
					<Badge size="S" variant="notice">3</Badge>
				</SideNav.Item>
				<SideNav.Item href="/archive">
					<Icon icon={FolderOpen} />
					<Text>Archive</Text>
				</SideNav.Item>
			</SideNav.Section>
		</SideNav.Root>
	</div>
</Story>

<Story name="Mobile drawer (interactive)">
	{#snippet template()}
		<div
			style="container-type: inline-size; container-name: app; position: relative; width: 380px; height: 480px; border: 1px solid var(--neutral-border-color-default); border-radius: 8px; overflow: hidden; background: var(--background-base-color);"
		>
			<header
				style="display: flex; align-items: center; gap: 12px; height: 48px; padding-inline: 12px; border-bottom: 1px solid var(--neutral-border-color-default); background: var(--background-layer-1-color);"
			>
				<ActionButton isQuiet size="s" onclick={() => (drawerOpen = true)} aria-label="Open menu">
					<Icon icon={MenuIcon} />
				</ActionButton>
				<span style="font-weight: 600;">Drawer demo</span>
			</header>
			<div style="padding: 16px;">
				<p style="margin: 0 0 8px;">
					Open: <code>{drawerOpen}</code>
				</p>
				<p style="margin: 0; color: var(--neutral-subdued-content-color-default);">
					Tap the menu icon. Backdrop click closes the drawer.
				</p>
			</div>

			<SideNav.Root bind:open={drawerOpen}>
				<SideNav.Section heading="Workspace">
					<SideNav.Item href="/" exact>
						<Icon icon={Home} />
						<Text>Home</Text>
					</SideNav.Item>
					<SideNav.Item href="/projects">
						<Icon icon={FolderOpen} />
						<Text>Projects</Text>
					</SideNav.Item>
					<SideNav.Item href="/search">
						<Icon icon={Search} />
						<Text>Search</Text>
					</SideNav.Item>
				</SideNav.Section>
				<SideNav.Section>
					<SideNav.Item href="/settings">
						<Icon icon={Settings} />
						<Text>Settings</Text>
					</SideNav.Item>
				</SideNav.Section>
			</SideNav.Root>
		</div>
	{/snippet}
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
					<SideNav.Item href="/" exact>
						<Icon icon={LayoutDashboard} />
						<Text>Dashboard</Text>
					</SideNav.Item>
					<SideNav.Item href="/projects">
						<Icon icon={FolderOpen} />
						<Text>Projects</Text>
					</SideNav.Item>
					<SideNav.Item href="/palette">
						<Icon icon={Palette} />
						<Text>Palette</Text>
					</SideNav.Item>
				</SideNav.Section>
				<SideNav.Section heading="Account">
					<SideNav.Item href="/settings">
						<Icon icon={Settings} />
						<Text>Settings</Text>
					</SideNav.Item>
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
