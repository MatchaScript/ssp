<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SearchField } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/SearchField',
		component: SearchField,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			labelPosition: {
				control: { type: 'inline-radio' },
				options: ['top', 'side']
			},
			isDisabled: { control: 'boolean' },
			hideLabel: { control: 'boolean' }
		},
		args: {
			size: 'm',
			label: 'Search',
			placeholder: 'Search…',
			hideLabel: true,
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	import { Globe } from '$lib/components/icon';

	const allItems = [
		'Accordion',
		'Action Bar',
		'Action Button',
		'Avatar',
		'Badge',
		'Button',
		'Card',
		'Checkbox',
		'Combobox',
		'Dialog',
		'Divider',
		'Icon',
		'List View',
		'Menu',
		'Number Field',
		'Picker',
		'Radio Group',
		'Search Field',
		'Switch',
		'TextArea',
		'TextField'
	];
	let query = $state('');
	const filtered = $derived(
		query.length === 0
			? allItems
			: allItems.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
	);
	let lastSubmit = $state<string | null>(null);
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<SearchField {...args} />
		</div>
	{/snippet}
</Story>

<Story name="With visible label" asChild>
	<div style="width: 320px;">
		<SearchField label="Find a component" hideLabel={false} placeholder="Try: button" />
	</div>
</Story>

<Story name="With help text" asChild>
	<div style="width: 320px;">
		<SearchField placeholder="Search docs" helpText="Press Enter to search, Esc to clear." />
	</div>
</Story>

<Story name="Custom icon" asChild>
	<div style="width: 320px;">
		<SearchField placeholder="Search the web" icon={Globe} />
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="width: 320px;">
		<SearchField placeholder="Search disabled" isDisabled />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<SearchField size="s" placeholder="Small" />
		<SearchField size="m" placeholder="Medium" />
		<SearchField size="l" placeholder="Large" />
		<SearchField size="xl" placeholder="Extra large" />
	</div>
</Story>

<Story name="Filtering a list">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 320px;">
			<SearchField
				bind:value={query}
				placeholder="Filter components…"
				onSubmit={(v) => (lastSubmit = v)}
				onClear={() => (lastSubmit = null)}
			/>
			<ul
				style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: var(--space-1); max-height: 220px; overflow-y: auto;"
			>
				{#each filtered as item (item)}
					<li
						style="padding: var(--space-2) var(--space-3); border-radius: var(--corner-radius-small-default); background: var(--neutral-subtle-background-color-default); font-size: var(--text-75);"
					>
						{item}
					</li>
				{:else}
					<li
						style="padding: var(--space-2); color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);"
					>
						No matches.
					</li>
				{/each}
			</ul>
			{#if lastSubmit}
				<div
					style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
				>
					Last submitted: "{lastSubmit}"
				</div>
			{/if}
		</div>
	{/snippet}
</Story>
