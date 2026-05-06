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
</script>

<Story name="Example">
	{#snippet template(args)}
		<Button {...args}>Button</Button>
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent">Accent</Button>
		<Button variant="primary">Primary</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="negative">Negative</Button>
	</div>
</Story>

<Story name="Outline treatment" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent" treatment="outline">Accent</Button>
		<Button variant="primary" treatment="outline">Primary</Button>
		<Button variant="secondary" treatment="outline">Secondary</Button>
		<Button variant="negative" treatment="outline">Negative</Button>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<Button size="s">Small</Button>
		<Button size="m">Medium</Button>
		<Button size="l">Large</Button>
		<Button size="xl">Extra large</Button>
	</div>
</Story>

<Story name="With icon" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent">
			{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
			Save
		</Button>
		<Button variant="primary" treatment="outline">
			{#snippet icon()}<Icon icon={Edit} size="m" />{/snippet}
			Edit
		</Button>
		<Button variant="secondary">
			{#snippet icon()}<Icon icon={Download} size="m" />{/snippet}
			Download
		</Button>
		<Button variant="negative" treatment="outline">
			{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
			Delete
		</Button>
	</div>
</Story>

<Story name="Icon only" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<Button variant="primary" size="s" aria-label="Add">
			{#snippet icon()}<Icon icon={Plus} size="s" />{/snippet}
		</Button>
		<Button variant="primary" size="m" aria-label="Add">
			{#snippet icon()}<Icon icon={Plus} size="m" />{/snippet}
		</Button>
		<Button variant="primary" size="l" aria-label="Add">
			{#snippet icon()}<Icon icon={Plus} size="l" />{/snippet}
		</Button>
		<Button variant="primary" size="xl" aria-label="Add">
			{#snippet icon()}<Icon icon={Plus} size="xl" />{/snippet}
		</Button>
	</div>
</Story>

<Story name="As link" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button href="https://svelte.dev" target="_blank" variant="accent">External link</Button>
		<Button href="#anchor" variant="secondary" treatment="outline">Anchor</Button>
		<Button href="#disabled" variant="primary" isDisabled>Disabled link</Button>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Button variant="accent" isDisabled>Fill disabled</Button>
		<Button variant="primary" treatment="outline" isDisabled>Outline disabled</Button>
		<Button variant="negative" isDisabled>Negative disabled</Button>
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="display: flex; gap: 16px; padding: 24px; background: linear-gradient(135deg, #4a3aff, #9c2bff); border-radius: 8px;"
	>
		<div style="display: flex; gap: 8px;">
			<Button staticColor="white" treatment="fill">Fill</Button>
			<Button staticColor="white" treatment="outline">Outline</Button>
		</div>
		<div
			style="display: flex; gap: 8px; padding: 12px; background: #fff; border-radius: 6px;"
		>
			<Button staticColor="black" treatment="fill">Fill</Button>
			<Button staticColor="black" treatment="outline">Outline</Button>
		</div>
	</div>
</Story>

<Story name="Form row (Cancel / Save)" asChild>
	<div style="display: flex; justify-content: flex-end; gap: 8px; min-width: 320px;">
		<Button variant="secondary" treatment="outline">Cancel</Button>
		<Button variant="accent">
			{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
			Save changes
		</Button>
	</div>
</Story>
