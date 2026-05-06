<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ActionButtonGroup, ActionButtonGroupItem } from './index.js';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		title: 'Components/ActionButtonGroup',
		component: ActionButtonGroup,
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['xs', 's', 'm', 'l', 'xl']
			},
			density: {
				control: { type: 'inline-radio' },
				options: ['regular', 'compact']
			},
			orientation: {
				control: { type: 'inline-radio' },
				options: ['horizontal', 'vertical']
			},
			isQuiet: { control: 'boolean' },
			isJustified: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			staticColor: {
				control: { type: 'inline-radio' },
				options: [undefined, 'white', 'black', 'auto']
			}
		},
		args: {
			size: 'm',
			density: 'regular',
			orientation: 'horizontal',
			isQuiet: false,
			isJustified: false,
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	import {
		Icon,
		AlignLeft,
		AlignCenter,
		AlignRight,
		Copy,
		Edit,
		Trash2,
		Download,
		Save
	} from '$lib/components/icon';
</script>

<Story name="Example">
	{#snippet template(args)}
		<ActionButtonGroup {...args}>
			<ActionButtonGroupItem>
				{#snippet icon()}<Icon icon={Edit} size={args.size} />{/snippet}
				Edit
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				{#snippet icon()}<Icon icon={Copy} size={args.size} />{/snippet}
				Copy
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				{#snippet icon()}<Icon icon={Trash2} size={args.size} />{/snippet}
				Delete
			</ActionButtonGroupItem>
		</ActionButtonGroup>
	{/snippet}
</Story>

<Story name="Formatting toolbar (compact)" asChild>
	<ActionButtonGroup density="compact" aria-label="Alignment">
		<ActionButtonGroupItem aria-label="Align left">
			{#snippet icon()}<Icon icon={AlignLeft} size="m" />{/snippet}
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Align center">
			{#snippet icon()}<Icon icon={AlignCenter} size="m" />{/snippet}
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Align right">
			{#snippet icon()}<Icon icon={AlignRight} size="m" />{/snippet}
		</ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Vertical orientation" asChild>
	<ActionButtonGroup orientation="vertical" density="compact" aria-label="Tools">
		<ActionButtonGroupItem aria-label="Edit">
			{#snippet icon()}<Icon icon={Edit} size="m" />{/snippet}
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Copy">
			{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Download">
			{#snippet icon()}<Icon icon={Download} size="m" />{/snippet}
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Delete">
			{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
		</ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Justified (fill container)" asChild>
	<div style="width: 480px;">
		<ActionButtonGroup isJustified>
			<ActionButtonGroupItem>
				{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
				Save
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
				Duplicate
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
				Delete
			</ActionButtonGroupItem>
		</ActionButtonGroup>
	</div>
</Story>

<Story name="Quiet" asChild>
	<ActionButtonGroup isQuiet>
		<ActionButtonGroupItem>
			{#snippet icon()}<Icon icon={Edit} size="m" />{/snippet}
			Edit
		</ActionButtonGroupItem>
		<ActionButtonGroupItem>
			{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
			Copy
		</ActionButtonGroupItem>
		<ActionButtonGroupItem>
			{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
			Delete
		</ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Disabled group" asChild>
	<ActionButtonGroup isDisabled>
		<ActionButtonGroupItem>Cut</ActionButtonGroupItem>
		<ActionButtonGroupItem>Copy</ActionButtonGroupItem>
		<ActionButtonGroupItem>Paste</ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; align-items: start;">
		{#each ['xs', 's', 'm', 'l', 'xl'] as const as size}
			<ActionButtonGroup {size} density="compact" aria-label={`Size ${size}`}>
				<ActionButtonGroupItem aria-label="Left">
					{#snippet icon()}<Icon icon={AlignLeft} {size} />{/snippet}
				</ActionButtonGroupItem>
				<ActionButtonGroupItem aria-label="Center">
					{#snippet icon()}<Icon icon={AlignCenter} {size} />{/snippet}
				</ActionButtonGroupItem>
				<ActionButtonGroupItem aria-label="Right">
					{#snippet icon()}<Icon icon={AlignRight} {size} />{/snippet}
				</ActionButtonGroupItem>
			</ActionButtonGroup>
		{/each}
	</div>
</Story>
