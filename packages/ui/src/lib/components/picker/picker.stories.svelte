<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as P from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Picker',
		component: P.Root,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			selectionMode: {
				control: { type: 'inline-radio' },
				options: ['single', 'multiple']
			},
			isDisabled: { control: 'boolean' },
			isQuiet: { control: 'boolean' },
			isInvalid: { control: 'boolean' }
		},
		args: {
			size: 'm',
			selectionMode: 'single',
			isDisabled: false,
			isQuiet: false,
			isInvalid: false
		}
	});

	const frequencies = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
	const tzSections = [
		{ title: 'Americas', items: ['America/Los_Angeles', 'America/New_York', 'America/Sao_Paulo'] },
		{ title: 'Europe', items: ['Europe/London', 'Europe/Paris', 'Europe/Berlin'] },
		{ title: 'Asia', items: ['Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore'] }
	];
	const longList = Array.from({ length: 60 }, (_, i) => `Item ${i + 1}`);
</script>

<script lang="ts">
	let single = $state<string | undefined>(undefined);
	let multi = $state<string[]>([]);
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 240px; padding-bottom: 260px;">
			<P.Root
				size={args.size}
				selectionMode={args.selectionMode}
				isDisabled={args.isDisabled}
				isQuiet={args.isQuiet}
				isInvalid={args.isInvalid}
			>
				<P.Trigger placeholder="Select frequency" aria-label="Frequency" />
				<P.Content>
					{#each frequencies as freq (freq)}
						<P.Item value={freq} />
					{/each}
				</P.Content>
			</P.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic" asChild>
	<div style="width: 240px; padding-bottom: 260px;">
		<P.Root>
			<P.Trigger placeholder="Select frequency" aria-label="Frequency" />
			<P.Content>
				{#each frequencies as freq (freq)}
					<P.Item value={freq} />
				{/each}
			</P.Content>
		</P.Root>
	</div>
</Story>

<Story name="With sections" asChild>
	<div style="width: 280px; padding-bottom: 360px;">
		<P.Root>
			<P.Trigger placeholder="Select timezone" aria-label="Timezone" />
			<P.Content>
				{#each tzSections as section (section.title)}
					<P.Section title={section.title}>
						{#each section.items as tz (tz)}
							<P.Item value={tz} />
						{/each}
					</P.Section>
				{/each}
			</P.Content>
		</P.Root>
	</div>
</Story>

<Story name="Quiet treatment" asChild>
	<div style="width: 240px; padding-bottom: 260px;">
		<P.Root isQuiet selectedKey="Weekly">
			<P.Trigger aria-label="Frequency" />
			<P.Content>
				{#each frequencies as freq (freq)}
					<P.Item value={freq} />
				{/each}
			</P.Content>
		</P.Root>
	</div>
</Story>

<Story name="Invalid" asChild>
	<div style="width: 240px; padding-bottom: 260px;">
		<P.Root isInvalid>
			<P.Trigger placeholder="Please select" aria-label="Required" />
			<P.Content>
				{#each frequencies as freq (freq)}
					<P.Item value={freq} />
				{/each}
			</P.Content>
		</P.Root>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="width: 240px;">
		<P.Root isDisabled selectedKey="Monthly">
			<P.Trigger aria-label="Frequency" />
			<P.Content>
				{#each frequencies as freq (freq)}
					<P.Item value={freq} />
				{/each}
			</P.Content>
		</P.Root>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 240px; padding-bottom: 340px;">
		{#each ['s', 'm', 'l', 'xl'] as const as size (size)}
			<P.Root {size}>
				<P.Trigger placeholder={`Size ${size}`} aria-label={`Size ${size}`} />
				<P.Content>
					{#each frequencies as freq (freq)}
						<P.Item value={freq} />
					{/each}
				</P.Content>
			</P.Root>
		{/each}
	</div>
</Story>

<Story name="Long list (scrolling)" asChild>
	<div style="width: 240px; padding-bottom: 360px;">
		<P.Root>
			<P.Trigger placeholder="Pick an item" aria-label="Long list" />
			<P.Content>
				{#each longList as item (item)}
					<P.Item value={item} />
				{/each}
			</P.Content>
		</P.Root>
	</div>
</Story>

<Story name="Controlled (single)">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 240px; padding-bottom: 260px;">
			<P.Root bind:selectedKey={single}>
				<P.Trigger placeholder="Pick one" aria-label="Controlled single" />
				<P.Content>
					{#each frequencies as freq (freq)}
						<P.Item value={freq} />
					{/each}
				</P.Content>
			</P.Root>
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Selected: {single ?? '(none)'}
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Controlled (multiple)">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 260px; padding-bottom: 260px;">
			<P.Root bind:selectedKey={multi} selectionMode="multiple" label={multi.length ? multi.join(', ') : undefined}>
				<P.Trigger placeholder="Pick several" aria-label="Controlled multiple" />
				<P.Content>
					{#each frequencies as freq (freq)}
						<P.Item value={freq} />
					{/each}
				</P.Content>
			</P.Root>
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Selected: {multi.length ? multi.join(', ') : '(none)'}
			</div>
		</div>
	{/snippet}
</Story>
