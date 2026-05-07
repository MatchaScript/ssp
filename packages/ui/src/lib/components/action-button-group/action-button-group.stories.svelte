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
	import { Text } from '$lib/components/text';
</script>

<Story name="Example">
	{#snippet template(args)}
		<ActionButtonGroup {...args}>
			<ActionButtonGroupItem>
				<Icon icon={Edit} />
				<Text>Edit</Text>
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				<Icon icon={Copy} />
				<Text>Copy</Text>
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				<Icon icon={Trash2} />
				<Text>Delete</Text>
			</ActionButtonGroupItem>
		</ActionButtonGroup>
	{/snippet}
</Story>

<Story name="Formatting toolbar (compact)" asChild>
	<ActionButtonGroup density="compact" aria-label="Alignment">
		<ActionButtonGroupItem aria-label="Align left">
			<Icon icon={AlignLeft} />
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Align center">
			<Icon icon={AlignCenter} />
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Align right">
			<Icon icon={AlignRight} />
		</ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Vertical orientation" asChild>
	<ActionButtonGroup orientation="vertical" density="compact" aria-label="Tools">
		<ActionButtonGroupItem aria-label="Edit">
			<Icon icon={Edit} />
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Copy">
			<Icon icon={Copy} />
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Download">
			<Icon icon={Download} />
		</ActionButtonGroupItem>
		<ActionButtonGroupItem aria-label="Delete">
			<Icon icon={Trash2} />
		</ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Justified (fill container)" asChild>
	<div style="width: 480px;">
		<ActionButtonGroup isJustified>
			<ActionButtonGroupItem>
				<Icon icon={Save} />
				<Text>Save</Text>
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				<Icon icon={Copy} />
				<Text>Duplicate</Text>
			</ActionButtonGroupItem>
			<ActionButtonGroupItem>
				<Icon icon={Trash2} />
				<Text>Delete</Text>
			</ActionButtonGroupItem>
		</ActionButtonGroup>
	</div>
</Story>

<Story name="Quiet" asChild>
	<ActionButtonGroup isQuiet>
		<ActionButtonGroupItem>
			<Icon icon={Edit} />
			<Text>Edit</Text>
		</ActionButtonGroupItem>
		<ActionButtonGroupItem>
			<Icon icon={Copy} />
			<Text>Copy</Text>
		</ActionButtonGroupItem>
		<ActionButtonGroupItem>
			<Icon icon={Trash2} />
			<Text>Delete</Text>
		</ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Disabled group" asChild>
	<ActionButtonGroup isDisabled>
		<ActionButtonGroupItem><Text>Cut</Text></ActionButtonGroupItem>
		<ActionButtonGroupItem><Text>Copy</Text></ActionButtonGroupItem>
		<ActionButtonGroupItem><Text>Paste</Text></ActionButtonGroupItem>
	</ActionButtonGroup>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; align-items: start;">
		{#each ['xs', 's', 'm', 'l', 'xl'] as const as size (size)}
			<ActionButtonGroup {size} density="compact" aria-label={`Size ${size}`}>
				<ActionButtonGroupItem aria-label="Left">
					<Icon icon={AlignLeft} />
				</ActionButtonGroupItem>
				<ActionButtonGroupItem aria-label="Center">
					<Icon icon={AlignCenter} />
				</ActionButtonGroupItem>
				<ActionButtonGroupItem aria-label="Right">
					<Icon icon={AlignRight} />
				</ActionButtonGroupItem>
			</ActionButtonGroup>
		{/each}
	</div>
</Story>
