<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ToggleGroup, ToggleGroupItem } from './index.js';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		title: 'Components/ToggleGroup',
		component: ToggleGroup,
		argTypes: {
			selectionMode: {
				control: { type: 'inline-radio' },
				options: ['single', 'multiple']
			},
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
			isEmphasized: { control: 'boolean' },
			isJustified: { control: 'boolean' },
			isDisabled: { control: 'boolean' }
		},
		args: {
			selectionMode: 'single',
			size: 'm',
			density: 'regular',
			orientation: 'horizontal',
			isQuiet: false,
			isEmphasized: false,
			isJustified: false,
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	import {
		Icon,
		AlignCenter,
		AlignLeft,
		AlignRight,
		Edit,
		Star,
		Bookmark,
		Pin
	} from '$lib/components/icon';

	let alignment = $state<string[]>(['center']);
	let formatting = $state<string[]>(['bold']);
</script>

<Story name="Example">
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="left" aria-label="Align left">
				{#snippet icon()}<Icon icon={AlignLeft} size={args.size} />{/snippet}
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
				{#snippet icon()}<Icon icon={AlignCenter} size={args.size} />{/snippet}
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
				{#snippet icon()}<Icon icon={AlignRight} size={args.size} />{/snippet}
			</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>

<Story name="Single selection (controlled)" asChild>
	<div style="display: flex; flex-direction: column; gap: 8px;">
		<ToggleGroup
			selectionMode="single"
			value={alignment}
			onValueChange={(v) => (alignment = v)}
			aria-label="Alignment"
		>
			<ToggleGroupItem value="left" aria-label="Align left">
				{#snippet icon()}<Icon icon={AlignLeft} size="m" />{/snippet}
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
				{#snippet icon()}<Icon icon={AlignCenter} size="m" />{/snippet}
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
				{#snippet icon()}<Icon icon={AlignRight} size="m" />{/snippet}
			</ToggleGroupItem>
		</ToggleGroup>
		<span style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			value: [{alignment.join(', ')}]
		</span>
	</div>
</Story>

<Story name="Multi selection (formatting)" asChild>
	<div style="display: flex; flex-direction: column; gap: 8px;">
		<ToggleGroup
			selectionMode="multiple"
			value={formatting}
			onValueChange={(v) => (formatting = v)}
			aria-label="Text formatting"
		>
			<ToggleGroupItem value="bold">Bold</ToggleGroupItem>
			<ToggleGroupItem value="italic">Italic</ToggleGroupItem>
			<ToggleGroupItem value="underline">Underline</ToggleGroupItem>
			<ToggleGroupItem value="strike">Strike</ToggleGroupItem>
		</ToggleGroup>
		<span style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			value: [{formatting.join(', ')}]
		</span>
	</div>
</Story>

<Story name="Emphasized" asChild>
	<ToggleGroup selectionMode="single" value={['star']} isEmphasized aria-label="Rating">
		<ToggleGroupItem value="star">
			{#snippet icon()}<Icon icon={Star} size="m" />{/snippet}
			Star
		</ToggleGroupItem>
		<ToggleGroupItem value="bookmark">
			{#snippet icon()}<Icon icon={Bookmark} size="m" />{/snippet}
			Bookmark
		</ToggleGroupItem>
		<ToggleGroupItem value="pin">
			{#snippet icon()}<Icon icon={Pin} size="m" />{/snippet}
			Pin
		</ToggleGroupItem>
	</ToggleGroup>
</Story>

<Story name="Vertical, compact" asChild>
	<ToggleGroup
		selectionMode="single"
		orientation="vertical"
		density="compact"
		value={['edit']}
		aria-label="Tool"
	>
		<ToggleGroupItem value="edit" aria-label="Edit">
			{#snippet icon()}<Icon icon={Edit} size="m" />{/snippet}
		</ToggleGroupItem>
		<ToggleGroupItem value="star" aria-label="Star">
			{#snippet icon()}<Icon icon={Star} size="m" />{/snippet}
		</ToggleGroupItem>
		<ToggleGroupItem value="pin" aria-label="Pin">
			{#snippet icon()}<Icon icon={Pin} size="m" />{/snippet}
		</ToggleGroupItem>
	</ToggleGroup>
</Story>

<Story name="Justified (fill width)" asChild>
	<div style="width: 480px;">
		<ToggleGroup selectionMode="single" value={['center']} isJustified aria-label="Alignment">
			<ToggleGroupItem value="left">Left</ToggleGroupItem>
			<ToggleGroupItem value="center">Center</ToggleGroupItem>
			<ToggleGroupItem value="right">Right</ToggleGroupItem>
			<ToggleGroupItem value="justify">Justify</ToggleGroupItem>
		</ToggleGroup>
	</div>
</Story>

<Story name="Per-item disabled" asChild>
	<ToggleGroup selectionMode="multiple" value={['bold']} aria-label="Formatting">
		<ToggleGroupItem value="bold">Bold</ToggleGroupItem>
		<ToggleGroupItem value="italic" isDisabled>Italic (disabled)</ToggleGroupItem>
		<ToggleGroupItem value="underline">Underline</ToggleGroupItem>
	</ToggleGroup>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; align-items: start;">
		{#each ['xs', 's', 'm', 'l', 'xl'] as const as size (size)}
			<ToggleGroup selectionMode="single" {size} value={['center']} aria-label={`Size ${size}`}>
				<ToggleGroupItem value="left" aria-label="Left">
					{#snippet icon()}<Icon icon={AlignLeft} {size} />{/snippet}
				</ToggleGroupItem>
				<ToggleGroupItem value="center" aria-label="Center">
					{#snippet icon()}<Icon icon={AlignCenter} {size} />{/snippet}
				</ToggleGroupItem>
				<ToggleGroupItem value="right" aria-label="Right">
					{#snippet icon()}<Icon icon={AlignRight} {size} />{/snippet}
				</ToggleGroupItem>
			</ToggleGroup>
		{/each}
	</div>
</Story>
