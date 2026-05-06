<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Tabs from './index.js';
	import Root from './tabs.svelte';
	import { Icon, Home, FolderOpen, Search, Settings, Bookmark } from '$lib/components/icon';
	import { Badge } from '$lib/components/badge';
	import { Card } from '$lib/components/card';

	const { Story } = defineMeta({
		title: 'Components/Tabs',
		component: Root,
		tags: ['autodocs'],
		argTypes: {
			density: {
				control: { type: 'inline-radio' },
				options: ['compact', 'regular']
			},
			isDisabled: { control: 'boolean' }
		},
		args: {
			density: 'regular',
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	let controlledKey = $state<string | number>('files');
</script>

<Story name="Example">
	{#snippet template(args)}
		<Tabs.Root {...args} defaultSelectedKey="home" style="width: 420px;">
			<Tabs.List aria-label="Navigation">
				<Tabs.Trigger value="home">Home</Tabs.Trigger>
				<Tabs.Trigger value="files">Files</Tabs.Trigger>
				<Tabs.Trigger value="search">Search</Tabs.Trigger>
				<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="home">Welcome home.</Tabs.Content>
			<Tabs.Content value="files">View your files.</Tabs.Content>
			<Tabs.Content value="search">Search your content.</Tabs.Content>
			<Tabs.Content value="settings">Manage your settings.</Tabs.Content>
		</Tabs.Root>
	{/snippet}
</Story>

<Story name="With icons" asChild>
	<Tabs.Root defaultSelectedKey="home" style="width: 480px;">
		<Tabs.List aria-label="Sections with icons">
			<Tabs.Trigger value="home">
				<Icon icon={Home} size="m" />
				Home
			</Tabs.Trigger>
			<Tabs.Trigger value="files">
				<Icon icon={FolderOpen} size="m" />
				Files
			</Tabs.Trigger>
			<Tabs.Trigger value="search">
				<Icon icon={Search} size="m" />
				Search
			</Tabs.Trigger>
			<Tabs.Trigger value="settings">
				<Icon icon={Settings} size="m" />
				Settings
			</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="home">Home content.</Tabs.Content>
		<Tabs.Content value="files">Files content.</Tabs.Content>
		<Tabs.Content value="search">Search content.</Tabs.Content>
		<Tabs.Content value="settings">Settings content.</Tabs.Content>
	</Tabs.Root>
</Story>

<Story name="With badges" asChild>
	<Tabs.Root defaultSelectedKey="inbox" style="width: 480px;">
		<Tabs.List aria-label="Mailboxes">
			<Tabs.Trigger value="inbox">
				Inbox
				<Badge variant="accent" size="S">12</Badge>
			</Tabs.Trigger>
			<Tabs.Trigger value="drafts">
				Drafts
				<Badge variant="neutral" size="S">3</Badge>
			</Tabs.Trigger>
			<Tabs.Trigger value="archive">Archive</Tabs.Trigger>
			<Tabs.Trigger value="spam">
				Spam
				<Badge variant="negative" size="S">8</Badge>
			</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="inbox">12 unread messages.</Tabs.Content>
		<Tabs.Content value="drafts">3 saved drafts.</Tabs.Content>
		<Tabs.Content value="archive">Archived messages.</Tabs.Content>
		<Tabs.Content value="spam">Filtered as spam.</Tabs.Content>
	</Tabs.Root>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 12px; width: 420px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Active: <code>{controlledKey}</code>
			</div>
			<Tabs.Root
				selectedKey={controlledKey}
				onSelectionChange={(k) => (controlledKey = k)}
			>
				<Tabs.List aria-label="Controlled tabs">
					<Tabs.Trigger value="home">Home</Tabs.Trigger>
					<Tabs.Trigger value="files">Files</Tabs.Trigger>
					<Tabs.Trigger value="search">Search</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="home">Welcome home.</Tabs.Content>
				<Tabs.Content value="files">View your files.</Tabs.Content>
				<Tabs.Content value="search">Search your content.</Tabs.Content>
			</Tabs.Root>
		</div>
	{/snippet}
</Story>

<Story name="Compact density" asChild>
	<Tabs.Root density="compact" defaultSelectedKey="overview" style="width: 480px;">
		<Tabs.List aria-label="Compact density">
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="metrics">Metrics</Tabs.Trigger>
			<Tabs.Trigger value="logs">Logs</Tabs.Trigger>
			<Tabs.Trigger value="traces">Traces</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="overview">High-level summary.</Tabs.Content>
		<Tabs.Content value="metrics">Service metrics.</Tabs.Content>
		<Tabs.Content value="logs">Log stream.</Tabs.Content>
		<Tabs.Content value="traces">Distributed traces.</Tabs.Content>
	</Tabs.Root>
</Story>

<Story name="Disabled tab" asChild>
	<Tabs.Root defaultSelectedKey="home" style="width: 480px;">
		<Tabs.List aria-label="With disabled trigger">
			<Tabs.Trigger value="home">Home</Tabs.Trigger>
			<Tabs.Trigger value="saved">
				<Icon icon={Bookmark} size="m" />
				Saved
			</Tabs.Trigger>
			<Tabs.Trigger value="premium" isDisabled>Premium</Tabs.Trigger>
			<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="home">Home content.</Tabs.Content>
		<Tabs.Content value="saved">Saved items.</Tabs.Content>
		<Tabs.Content value="premium">Requires upgrade.</Tabs.Content>
		<Tabs.Content value="settings">Settings content.</Tabs.Content>
	</Tabs.Root>
</Story>

<Story name="Inside a card" asChild>
	<div style="width: 520px;">
		<Card variant="primary">
			{#snippet heading()}Deployment details{/snippet}
			{#snippet description()}
				<Tabs.Root defaultSelectedKey="summary">
					<Tabs.List aria-label="Deployment views">
						<Tabs.Trigger value="summary">Summary</Tabs.Trigger>
						<Tabs.Trigger value="env">Environment</Tabs.Trigger>
						<Tabs.Trigger value="logs">Logs</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="summary">
						Deployed 3 minutes ago to <strong>production</strong>.
					</Tabs.Content>
					<Tabs.Content value="env">12 variables configured.</Tabs.Content>
					<Tabs.Content value="logs">No errors in the last hour.</Tabs.Content>
				</Tabs.Root>
			{/snippet}
		</Card>
	</div>
</Story>
