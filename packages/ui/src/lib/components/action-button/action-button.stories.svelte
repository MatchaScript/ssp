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
	import { Text } from '$lib/components/text';
</script>

<Story name="Example">
	{#snippet template(args)}
		<ActionButton {...args}>
			<Icon icon={Edit} />
			<Text>Edit</Text>
		</ActionButton>
	{/snippet}
</Story>

<Story name="Quiet vs. filled" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ActionButton><Text>Filled</Text></ActionButton>
		<ActionButton isQuiet><Text>Quiet</Text></ActionButton>
		<ActionButton disabled><Text>Disabled</Text></ActionButton>
		<ActionButton isQuiet disabled><Text>Quiet disabled</Text></ActionButton>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ActionButton size="xs"><Text>XS</Text></ActionButton>
		<ActionButton size="s"><Text>S</Text></ActionButton>
		<ActionButton size="m"><Text>M</Text></ActionButton>
		<ActionButton size="l"><Text>L</Text></ActionButton>
		<ActionButton size="xl"><Text>XL</Text></ActionButton>
	</div>
</Story>

<Story name="With icon and label" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ActionButton>
			<Icon icon={Save} />
			<Text>Save</Text>
		</ActionButton>
		<ActionButton>
			<Icon icon={Edit} />
			<Text>Edit</Text>
		</ActionButton>
		<ActionButton>
			<Icon icon={Download} />
			<Text>Download</Text>
		</ActionButton>
		<ActionButton>
			<Icon icon={Trash2} />
			<Text>Delete</Text>
		</ActionButton>
	</div>
</Story>

<Story name="Icon only" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ActionButton size="s" aria-label="Settings">
			<Icon icon={Settings} />
		</ActionButton>
		<ActionButton size="m" aria-label="Settings">
			<Icon icon={Settings} />
		</ActionButton>
		<ActionButton size="l" aria-label="Settings">
			<Icon icon={Settings} />
		</ActionButton>
		<ActionButton size="xl" aria-label="Settings">
			<Icon icon={Settings} />
		</ActionButton>
	</div>
</Story>

<Story name="As link" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ActionButton href="https://svelte.dev" target="_blank"><Text>External link</Text></ActionButton
		>
		<ActionButton href="#docs" isQuiet><Text>Docs</Text></ActionButton>
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="display: flex; gap: 12px; padding: 24px; background: linear-gradient(135deg, #4a3aff, #9c2bff); border-radius: 8px;"
	>
		<ActionButton staticColor="white">
			<Icon icon={Plus} />
			<Text>Add</Text>
		</ActionButton>
		<ActionButton staticColor="white" isQuiet aria-label="Save">
			<Icon icon={Save} />
		</ActionButton>
	</div>
</Story>
