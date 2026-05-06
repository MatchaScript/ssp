<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SvelteSet } from 'svelte/reactivity';
	import * as ListView from './index.js';

	const { Story } = defineMeta({
		title: 'Components/ListView',
		component: ListView.Root,
		tags: ['autodocs'],
		argTypes: {
			selectionMode: {
				control: { type: 'inline-radio' },
				options: ['none', 'single', 'multiple']
			},
			selectionStyle: {
				control: { type: 'inline-radio' },
				options: ['checkbox', 'highlight']
			},
			density: {
				control: { type: 'inline-radio' },
				options: ['compact', 'regular', 'spacious']
			},
			isQuiet: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			isLoading: { control: 'boolean' }
		},
		args: {
			selectionMode: 'none',
			selectionStyle: 'checkbox',
			density: 'regular',
			isQuiet: false,
			isDisabled: false,
			isLoading: false
		}
	});
</script>

<script lang="ts">
	let selected = $state<Set<string>>(new Set(['2']));
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 360px;">
			<ListView.Root
				aria-label="Files"
				selectionMode={args.selectionMode}
				selectionStyle={args.selectionStyle}
				density={args.density}
				isQuiet={args.isQuiet}
				isDisabled={args.isDisabled}
				isLoading={args.isLoading}
				defaultSelectedKeys={new SvelteSet(['2'])}
				onAction={(k) => console.log('Action:', k)}
			>
				<ListView.Item key="1" description="Design system">Design specs.pdf</ListView.Item>
				<ListView.Item key="2" description="Product sync">Meeting notes.txt</ListView.Item>
				<ListView.Item key="3" description="Q4 projections">Budget report.xlsx</ListView.Item>
				<ListView.Item key="4" description="Phase 2">Project timeline.pptx</ListView.Item>
				<ListView.Item key="5" description="@ssp/ui">Source code.zip</ListView.Item>
			</ListView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic" asChild>
	<div style="width: 320px;">
		<ListView.Root aria-label="Items">
			<ListView.Item key="1">Dashboard</ListView.Item>
			<ListView.Item key="2">Projects</ListView.Item>
			<ListView.Item key="3">Team</ListView.Item>
			<ListView.Item key="4">Settings</ListView.Item>
		</ListView.Root>
	</div>
</Story>

<Story name="With descriptions" asChild>
	<div style="width: 360px;">
		<ListView.Root aria-label="Servers">
			<ListView.Item key="1" description="us-east-1 · running">api-prod-01</ListView.Item>
			<ListView.Item key="2" description="us-east-1 · running">api-prod-02</ListView.Item>
			<ListView.Item key="3" description="us-west-2 · starting">api-stage-01</ListView.Item>
			<ListView.Item key="4" description="eu-west-1 · stopped">api-dev-01</ListView.Item>
		</ListView.Root>
	</div>
</Story>

<Story name="Single selection (highlight)" asChild>
	<div style="width: 320px;">
		<ListView.Root
			aria-label="Single select"
			selectionMode="single"
			selectionStyle="highlight"
			defaultSelectedKeys={new SvelteSet(['2'])}
		>
			<ListView.Item key="1">Light</ListView.Item>
			<ListView.Item key="2">Dark</ListView.Item>
			<ListView.Item key="3">System</ListView.Item>
		</ListView.Root>
	</div>
</Story>

<Story name="Multi-select (checkbox)">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 360px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Selected: <code>{[...selected].join(', ') || '(none)'}</code>
			</div>
			<ListView.Root
				aria-label="Multi select"
				selectionMode="multiple"
				selectionStyle="checkbox"
				selectedKeys={selected}
				onSelectionChange={(keys) => (selected = keys)}
			>
				<ListView.Item key="name">Name</ListView.Item>
				<ListView.Item key="date">Date modified</ListView.Item>
				<ListView.Item key="size">Size</ListView.Item>
				<ListView.Item key="kind">Kind</ListView.Item>
				<ListView.Item key="owner">Owner</ListView.Item>
			</ListView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled items" asChild>
	<div style="width: 320px;">
		<ListView.Root
			aria-label="With disabled keys"
			selectionMode="multiple"
			disabledKeys={new SvelteSet(['2', '4'])}
		>
			<ListView.Item key="1">Selectable</ListView.Item>
			<ListView.Item key="2">Disabled via disabledKeys</ListView.Item>
			<ListView.Item key="3">Selectable</ListView.Item>
			<ListView.Item key="4" isDisabled>Disabled via prop</ListView.Item>
			<ListView.Item key="5">Selectable</ListView.Item>
		</ListView.Root>
	</div>
</Story>

<Story name="Densities" asChild>
	<div style="display: flex; gap: 16px; align-items: flex-start;">
		{#each ['compact', 'regular', 'spacious'] as const as density (density)}
			<div style="width: 220px;">
				<p
					style="margin: 0 0 6px; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
				>
					{density}
				</p>
				<ListView.Root aria-label="Density {density}" {density}>
					<ListView.Item key="1">Item one</ListView.Item>
					<ListView.Item key="2">Item two</ListView.Item>
					<ListView.Item key="3">Item three</ListView.Item>
				</ListView.Root>
			</div>
		{/each}
	</div>
</Story>

<Story name="Empty state">
	{#snippet template()}
		<div style="width: 320px; height: 200px;">
			<ListView.Root aria-label="Empty">
				{#snippet renderEmptyState()}
					<p style="margin: 0;">No files yet. Upload one to get started.</p>
				{/snippet}
			</ListView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Loading" asChild>
	<div style="width: 320px; height: 160px;">
		<ListView.Root aria-label="Loading" isLoading />
	</div>
</Story>

<Story name="Quiet" asChild>
	<div style="width: 320px;">
		<ListView.Root aria-label="Quiet" isQuiet>
			<ListView.Item key="1">No border or background</ListView.Item>
			<ListView.Item key="2">Blends with the page</ListView.Item>
			<ListView.Item key="3">Use inside another surface</ListView.Item>
		</ListView.Root>
	</div>
</Story>
