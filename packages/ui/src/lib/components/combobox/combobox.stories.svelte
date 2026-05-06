<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as C from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Combobox',
		component: C.Root,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			isDisabled: { control: 'boolean' },
			isQuiet: { control: 'boolean' },
			isInvalid: { control: 'boolean' }
		},
		args: {
			size: 'm',
			isDisabled: false,
			isQuiet: false,
			isInvalid: false
		}
	});

	const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
	const countries = [
		{ group: 'Europe', items: ['France', 'Germany', 'Italy', 'Spain'] },
		{ group: 'Asia', items: ['Japan', 'Korea', 'Thailand', 'Vietnam'] },
		{ group: 'Americas', items: ['Brazil', 'Canada', 'Mexico', 'United States'] }
	];
	const longList = Array.from({ length: 80 }, (_, i) => `Option ${i + 1}`);
</script>

<script lang="ts">
	let selected = $state<string | undefined>(undefined);
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 260px; padding-bottom: 260px;">
			<C.Root
				size={args.size}
				isDisabled={args.isDisabled}
				isQuiet={args.isQuiet}
				isInvalid={args.isInvalid}
			>
				<C.Input placeholder="Pick a fruit" />
				<C.Content>
					{#each fruits as fruit (fruit)}
						<C.Item value={fruit} />
					{/each}
				</C.Content>
			</C.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic" asChild>
	<div style="width: 260px; padding-bottom: 260px;">
		<C.Root>
			<C.Input placeholder="Pick a fruit" />
			<C.Content>
				{#each fruits as fruit (fruit)}
					<C.Item value={fruit} />
				{/each}
			</C.Content>
		</C.Root>
	</div>
</Story>

<Story name="With sections" asChild>
	<div style="width: 280px; padding-bottom: 340px;">
		<C.Root>
			<C.Input placeholder="Pick a country" />
			<C.Content>
				{#each countries as section (section.group)}
					<C.Section title={section.group}>
						{#each section.items as country (country)}
							<C.Item value={country} />
						{/each}
					</C.Section>
				{/each}
			</C.Content>
		</C.Root>
	</div>
</Story>

<Story name="Quiet treatment" asChild>
	<div style="width: 260px; padding-bottom: 260px;">
		<C.Root isQuiet>
			<C.Input placeholder="Quiet style" />
			<C.Content>
				{#each fruits as fruit (fruit)}
					<C.Item value={fruit} />
				{/each}
			</C.Content>
		</C.Root>
	</div>
</Story>

<Story name="Invalid" asChild>
	<div style="width: 260px; padding-bottom: 260px;">
		<C.Root isInvalid>
			<C.Input placeholder="Required" />
			<C.Content>
				{#each fruits as fruit (fruit)}
					<C.Item value={fruit} />
				{/each}
			</C.Content>
		</C.Root>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="width: 260px;">
		<C.Root isDisabled selectedKey="Apple">
			<C.Input placeholder="Can't change" />
			<C.Content>
				{#each fruits as fruit (fruit)}
					<C.Item value={fruit} />
				{/each}
			</C.Content>
		</C.Root>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 260px; padding-bottom: 340px;">
		{#each ['s', 'm', 'l', 'xl'] as const as size (size)}
			<C.Root {size}>
				<C.Input placeholder={`Size ${size}`} />
				<C.Content>
					{#each fruits.slice(0, 4) as fruit (fruit)}
						<C.Item value={fruit} />
					{/each}
				</C.Content>
			</C.Root>
		{/each}
	</div>
</Story>

<Story name="Long list (scrolling)" asChild>
	<div style="width: 260px; padding-bottom: 360px;">
		<C.Root>
			<C.Input placeholder="Scroll me" />
			<C.Content>
				{#each longList as opt (opt)}
					<C.Item value={opt} />
				{/each}
			</C.Content>
		</C.Root>
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 260px; padding-bottom: 260px;">
			<C.Root bind:selectedKey={selected} onSelectionChange={(v) => console.log('changed:', v)}>
				<C.Input placeholder="Pick a fruit" />
				<C.Content>
					{#each fruits as fruit (fruit)}
						<C.Item value={fruit} />
					{/each}
				</C.Content>
			</C.Root>
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Selected: {selected ?? '(none)'}
			</div>
		</div>
	{/snippet}
</Story>
