<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import { TagGroup } from '$lib/index.js';
	import { SvelteSet } from 'svelte/reactivity';

	const { Story } = defineMeta({
		title: 'Components/TagGroup',
		component: TagGroup.Root,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'inline-radio' }, options: ['s', 'm', 'l'] },
			selectionMode: {
				control: { type: 'inline-radio' },
				options: ['none', 'single', 'multiple']
			},
			isEmphasized: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			isReadOnly: { control: 'boolean' },
			isError: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			labelPosition: { control: { type: 'inline-radio' }, options: ['top', 'side'] }
		}
	});
</script>

<script lang="ts">
	// Per-story local state lives in the non-module script. Each story consumes
	// the slice it needs; the splice helpers mutate in place so the parent
	// reactive array picks up the change without reassignment.
	let removableItems = $state(['Apple', 'Banana', 'Cherry']);
	let removableSelectableItems = $state(['Apple', 'Banana', 'Cherry']);

	function removeFrom(arr: string[], keys: Set<string>) {
		for (const k of keys) {
			const i = arr.indexOf(k);
			if (i >= 0) arr.splice(i, 1);
		}
	}
</script>

<Story
	name="Default"
	args={{}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getAllByRole('row')).toHaveLength(3);
	}}
	asChild
>
	<TagGroup.Root>
		<TagGroup.Item id="a">Apple</TagGroup.Item>
		<TagGroup.Item id="b">Banana</TagGroup.Item>
		<TagGroup.Item id="c">Cherry</TagGroup.Item>
	</TagGroup.Root>
</Story>

<Story name="Sizes" args={{}}>
	{#snippet template()}
		<div style="display: flex; gap: 24px; align-items: center;">
			{#each ['s', 'm', 'l'] as const as size (size)}
				<TagGroup.Root {size}>
					<TagGroup.Item id="a">Small</TagGroup.Item>
					<TagGroup.Item id="b">Medium</TagGroup.Item>
					<TagGroup.Item id="c">Large</TagGroup.Item>
				</TagGroup.Root>
			{/each}
		</div>
	{/snippet}
</Story>

<Story
	name="Selectable"
	args={{ selectionMode: 'multiple' }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const rows = canvas.getAllByRole('row');
		expect(rows[0].getAttribute('aria-selected')).toBe('false');
		await userEvent.click(rows[0]);
		expect(rows[0].getAttribute('aria-selected')).toBe('true');
		await userEvent.click(rows[1]);
		expect(rows[1].getAttribute('aria-selected')).toBe('true');
		expect(rows[0].getAttribute('aria-selected')).toBe('true'); // multi
	}}
>
	{#snippet template(args)}
		<TagGroup.Root {...args}>
			<TagGroup.Item id="a">React</TagGroup.Item>
			<TagGroup.Item id="b">Svelte</TagGroup.Item>
			<TagGroup.Item id="c">Vue</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story name="SelectableSingle" args={{ selectionMode: 'single' }}>
	{#snippet template(args)}
		<TagGroup.Root {...args}>
			<TagGroup.Item id="a">React</TagGroup.Item>
			<TagGroup.Item id="b">Svelte</TagGroup.Item>
			<TagGroup.Item id="c">Vue</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story name="Emphasized" args={{ selectionMode: 'multiple', isEmphasized: true }}>
	{#snippet template(args)}
		{@const initial = new SvelteSet(['b'])}
		<TagGroup.Root {...args} defaultSelectedKeys={initial}>
			<TagGroup.Item id="a">React</TagGroup.Item>
			<TagGroup.Item id="b">Svelte</TagGroup.Item>
			<TagGroup.Item id="c">Vue</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story
	name="Removable"
	args={{}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const buttons = canvas.getAllByRole('button', { name: /remove/i });
		expect(buttons.length).toBe(3);
		// Click first remove
		await userEvent.click(buttons[0]);
		// After removal, two rows remain
		await new Promise((r) => setTimeout(r, 50));
		expect(canvas.getAllByRole('row').length).toBe(2);
	}}
>
	{#snippet template()}
		<TagGroup.Root onRemove={(keys) => removeFrom(removableItems, keys)}>
			{#each removableItems as name (name)}
				<TagGroup.Item id={name}>{name}</TagGroup.Item>
			{/each}
		</TagGroup.Root>
	{/snippet}
</Story>

<Story name="RemovableAndSelectable" args={{ selectionMode: 'multiple' }}>
	{#snippet template(args)}
		<TagGroup.Root {...args} onRemove={(keys) => removeFrom(removableSelectableItems, keys)}>
			{#each removableSelectableItems as name (name)}
				<TagGroup.Item id={name}>{name}</TagGroup.Item>
			{/each}
		</TagGroup.Root>
	{/snippet}
</Story>

<Story name="WithIcon" args={{}}>
	{#snippet template()}
		<TagGroup.Root>
			<TagGroup.Item id="a">
				{#snippet icon()}<span aria-hidden="true">🍎</span>{/snippet}
				Apple
			</TagGroup.Item>
			<TagGroup.Item id="b">
				{#snippet icon()}<span aria-hidden="true">🍌</span>{/snippet}
				Banana
			</TagGroup.Item>
			<TagGroup.Item id="c">No icon</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story
	name="WithLink"
	args={{}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const rows = canvas.getAllByRole('row');
		// Link tags should not have aria-selected
		expect(rows[0].hasAttribute('aria-selected')).toBe(false);
		// And should contain a stretched <a>
		const link = rows[0].querySelector<HTMLAnchorElement>('a[data-tag-link]');
		expect(link).not.toBeNull();
		expect(link?.getAttribute('href')).toBe('https://example.com/a');
	}}
>
	{#snippet template()}
		<TagGroup.Root selectionMode="multiple">
			<TagGroup.Item id="a" href="https://example.com/a">External A</TagGroup.Item>
			<TagGroup.Item id="b" href="https://example.com/b" target="_blank">
				External B (new tab)
			</TagGroup.Item>
			<TagGroup.Item id="c">Plain selectable</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story
	name="Disabled"
	args={{}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const rows = canvas.getAllByRole('row');
		// Group isDisabled => all rows disabled
		expect(rows[0].getAttribute('aria-disabled')).toBe('true');
		expect(rows[1].getAttribute('aria-disabled')).toBe('true');
	}}
>
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div>
				<strong>Group isDisabled</strong>
				<TagGroup.Root isDisabled>
					<TagGroup.Item id="a">Apple</TagGroup.Item>
					<TagGroup.Item id="b">Banana</TagGroup.Item>
				</TagGroup.Root>
			</div>
			<div>
				<strong>disabledKeys=[b]</strong>
				<TagGroup.Root disabledKeys={new Set(['b'])}>
					<TagGroup.Item id="a">Apple</TagGroup.Item>
					<TagGroup.Item id="b">Banana</TagGroup.Item>
					<TagGroup.Item id="c">Cherry</TagGroup.Item>
				</TagGroup.Root>
			</div>
			<div>
				<strong>per-tag isDisabled</strong>
				<TagGroup.Root>
					<TagGroup.Item id="a">Apple</TagGroup.Item>
					<TagGroup.Item id="b" isDisabled>Banana</TagGroup.Item>
					<TagGroup.Item id="c">Cherry</TagGroup.Item>
				</TagGroup.Root>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="WithLabel" args={{}}>
	{#snippet template()}
		<TagGroup.Root
			label="Frameworks"
			helpText="Pick anything you've shipped with."
			selectionMode="multiple"
		>
			<TagGroup.Item id="a">React</TagGroup.Item>
			<TagGroup.Item id="b">Svelte</TagGroup.Item>
			<TagGroup.Item id="c">Vue</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story name="WithLabelError" args={{}}>
	{#snippet template()}
		<TagGroup.Root
			label="Required tags"
			isRequired
			isError
			errorMessage="At least one tag is required."
			selectionMode="multiple"
		>
			<TagGroup.Item id="a">A</TagGroup.Item>
			<TagGroup.Item id="b">B</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story name="LabelSide" args={{}}>
	{#snippet template()}
		<TagGroup.Root label="Frameworks" labelPosition="side">
			<TagGroup.Item id="a">React</TagGroup.Item>
			<TagGroup.Item id="b">Svelte</TagGroup.Item>
			<TagGroup.Item id="c">Vue</TagGroup.Item>
		</TagGroup.Root>
	{/snippet}
</Story>

<Story
	name="Empty"
	args={{}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		// role transitions to "group" when empty
		const group = canvas.getByRole('group');
		expect(group).toBeInTheDocument();
		expect(canvas.queryAllByRole('row').length).toBe(0);
	}}
>
	{#snippet template()}
		<TagGroup.Root label="Empty TagGroup">
			{#snippet renderEmptyState()}
				<em>No tags yet — add some.</em>
			{/snippet}
		</TagGroup.Root>
	{/snippet}
</Story>

<Story name="LongList" args={{ selectionMode: 'multiple' }}>
	{#snippet template(args)}
		<div style="max-width: 500px;">
			<TagGroup.Root {...args}>
				{#each Array.from({ length: 30 }, (_, i) => `Tag ${i + 1}`) as name (name)}
					<TagGroup.Item id={name}>{name}</TagGroup.Item>
				{/each}
			</TagGroup.Root>
		</div>
	{/snippet}
</Story>

<Story name="RTL" args={{ selectionMode: 'multiple' }}>
	{#snippet template(args)}
		<div dir="rtl">
			<TagGroup.Root {...args}>
				<TagGroup.Item id="a">العربية</TagGroup.Item>
				<TagGroup.Item id="b">עברית</TagGroup.Item>
				<TagGroup.Item id="c">مرحبا</TagGroup.Item>
			</TagGroup.Root>
		</div>
	{/snippet}
</Story>
