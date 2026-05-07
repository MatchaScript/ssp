<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'inline-radio' },
				options: ['accent', 'primary', 'secondary', 'negative']
			},
			treatment: {
				control: { type: 'inline-radio' },
				options: ['fill', 'outline']
			},
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			staticColor: {
				control: { type: 'inline-radio' },
				options: [undefined, 'white', 'black']
			},
			isDisabled: { control: 'boolean' }
		},
		args: {
			variant: 'accent',
			treatment: 'fill',
			size: 'm',
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	import { Icon, Edit, Plus, Save, Trash2, Download } from '$lib/components/icon';
	import { Text } from '$lib/components/text';
</script>

<Story name="Example">
	{#snippet template(args)}
		<Button {...args}><Text>Button</Text></Button>
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent"><Text>Accent</Text></Button>
		<Button variant="primary"><Text>Primary</Text></Button>
		<Button variant="secondary"><Text>Secondary</Text></Button>
		<Button variant="negative"><Text>Negative</Text></Button>
	</div>
</Story>

<Story name="Outline treatment" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent" treatment="outline"><Text>Accent</Text></Button>
		<Button variant="primary" treatment="outline"><Text>Primary</Text></Button>
		<Button variant="secondary" treatment="outline"><Text>Secondary</Text></Button>
		<Button variant="negative" treatment="outline"><Text>Negative</Text></Button>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<Button size="s"><Text>Small</Text></Button>
		<Button size="m"><Text>Medium</Text></Button>
		<Button size="l"><Text>Large</Text></Button>
		<Button size="xl"><Text>Extra large</Text></Button>
	</div>
</Story>

<Story name="With icon" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent">
			<Icon icon={Save} />
			<Text>Save</Text>
		</Button>
		<Button variant="primary" treatment="outline">
			<Icon icon={Edit} />
			<Text>Edit</Text>
		</Button>
		<Button variant="secondary">
			<Icon icon={Download} />
			<Text>Download</Text>
		</Button>
		<Button variant="negative" treatment="outline">
			<Icon icon={Trash2} />
			<Text>Delete</Text>
		</Button>
	</div>
</Story>

<Story name="Icon only" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<Button variant="primary" size="s" aria-label="Add">
			<Icon icon={Plus} />
		</Button>
		<Button variant="primary" size="m" aria-label="Add">
			<Icon icon={Plus} />
		</Button>
		<Button variant="primary" size="l" aria-label="Add">
			<Icon icon={Plus} />
		</Button>
		<Button variant="primary" size="xl" aria-label="Add">
			<Icon icon={Plus} />
		</Button>
	</div>
</Story>

<Story name="As link" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button href="https://svelte.dev" target="_blank" variant="accent"
			><Text>External link</Text></Button
		>
		<Button href="#anchor" variant="secondary" treatment="outline"><Text>Anchor</Text></Button>
		<Button href="#disabled" variant="primary" isDisabled><Text>Disabled link</Text></Button>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent" isDisabled><Text>Fill disabled</Text></Button>
		<Button variant="primary" treatment="outline" isDisabled><Text>Outline disabled</Text></Button>
		<Button variant="negative" isDisabled><Text>Negative disabled</Text></Button>
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="display: flex; gap: 16px; padding: 24px; background: linear-gradient(135deg, #4a3aff, #9c2bff); border-radius: 8px;"
	>
		<div style="display: flex; gap: 8px;">
			<Button staticColor="white" treatment="fill"><Text>Fill</Text></Button>
			<Button staticColor="white" treatment="outline"><Text>Outline</Text></Button>
		</div>
		<div style="display: flex; gap: 8px; padding: 12px; background: #fff; border-radius: 6px;">
			<Button staticColor="black" treatment="fill"><Text>Fill</Text></Button>
			<Button staticColor="black" treatment="outline"><Text>Outline</Text></Button>
		</div>
	</div>
</Story>

<Story name="Form row (Cancel / Save)" asChild>
	<div style="display: flex; justify-content: flex-end; gap: 8px; min-width: 320px;">
		<Button variant="secondary" treatment="outline"><Text>Cancel</Text></Button>
		<Button variant="accent">
			<Icon icon={Save} />
			<Text>Save changes</Text>
		</Button>
	</div>
</Story>
