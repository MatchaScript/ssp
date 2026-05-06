<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActionButton from './action-button.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		title: 'Components/ActionButton',
		component: ActionButton,
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['xs', 's', 'm', 'l', 'xl']
			},
			isQuiet: { control: 'boolean' },
			staticColor: {
				control: { type: 'inline-radio' },
				options: [undefined, 'white', 'black', 'auto']
			},
			disabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			isQuiet: false,
			disabled: false
		}
	});
</script>

<script lang="ts">
	import { Icon, Edit, Save, Plus, Download, Trash2, Settings } from '$lib/components/icon';
</script>

<Story name="Example">
	{#snippet template(args)}
		<ActionButton {...args}>
			{#snippet icon()}<Icon icon={Edit} size={args.size} />{/snippet}
			Edit
		</ActionButton>
	{/snippet}
</Story>

<Story name="Quiet vs. filled" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ActionButton>Filled</ActionButton>
		<ActionButton isQuiet>Quiet</ActionButton>
		<ActionButton disabled>Disabled</ActionButton>
		<ActionButton isQuiet disabled>Quiet disabled</ActionButton>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ActionButton size="xs">XS</ActionButton>
		<ActionButton size="s">S</ActionButton>
		<ActionButton size="m">M</ActionButton>
		<ActionButton size="l">L</ActionButton>
		<ActionButton size="xl">XL</ActionButton>
	</div>
</Story>

<Story name="With icon and label" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ActionButton>
			{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
			Save
		</ActionButton>
		<ActionButton>
			{#snippet icon()}<Icon icon={Edit} size="m" />{/snippet}
			Edit
		</ActionButton>
		<ActionButton>
			{#snippet icon()}<Icon icon={Download} size="m" />{/snippet}
			Download
		</ActionButton>
		<ActionButton>
			{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
			Delete
		</ActionButton>
	</div>
</Story>

<Story name="Icon only" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ActionButton size="s" aria-label="Settings">
			{#snippet icon()}<Icon icon={Settings} size="s" />{/snippet}
		</ActionButton>
		<ActionButton size="m" aria-label="Settings">
			{#snippet icon()}<Icon icon={Settings} size="m" />{/snippet}
		</ActionButton>
		<ActionButton size="l" aria-label="Settings">
			{#snippet icon()}<Icon icon={Settings} size="l" />{/snippet}
		</ActionButton>
		<ActionButton size="xl" aria-label="Settings">
			{#snippet icon()}<Icon icon={Settings} size="xl" />{/snippet}
		</ActionButton>
	</div>
</Story>

<Story name="As link" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ActionButton href="https://svelte.dev" target="_blank">External link</ActionButton>
		<ActionButton href="#docs" isQuiet>Docs</ActionButton>
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="display: flex; gap: 12px; padding: 24px; background: linear-gradient(135deg, #4a3aff, #9c2bff); border-radius: 8px;"
	>
		<ActionButton staticColor="white">
			{#snippet icon()}<Icon icon={Plus} size="m" />{/snippet}
			Add
		</ActionButton>
		<ActionButton staticColor="white" isQuiet aria-label="Save">
			{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
		</ActionButton>
	</div>
</Story>
