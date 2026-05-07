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
	import { Text } from '$lib/components/text';

	let alignment = $state<string[]>(['center']);
	let formatting = $state<string[]>(['bold']);
</script>

<Story name="Example">
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="left" aria-label="Align left">
				<Icon icon={AlignLeft} />
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
				<Icon icon={AlignCenter} />
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
				<Icon icon={AlignRight} />
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
				<Icon icon={AlignLeft} />
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
				<Icon icon={AlignCenter} />
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
				<Icon icon={AlignRight} />
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
			<ToggleGroupItem value="bold"><Text>Bold</Text></ToggleGroupItem>
			<ToggleGroupItem value="italic"><Text>Italic</Text></ToggleGroupItem>
			<ToggleGroupItem value="underline"><Text>Underline</Text></ToggleGroupItem>
			<ToggleGroupItem value="strike"><Text>Strike</Text></ToggleGroupItem>
		</ToggleGroup>
		<span style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			value: [{formatting.join(', ')}]
		</span>
	</div>
</Story>

<Story name="Emphasized" asChild>
	<ToggleGroup selectionMode="single" value={['star']} isEmphasized aria-label="Rating">
		<ToggleGroupItem value="star">
			<Icon icon={Star} />
			<Text>Star</Text>
		</ToggleGroupItem>
		<ToggleGroupItem value="bookmark">
			<Icon icon={Bookmark} />
			<Text>Bookmark</Text>
		</ToggleGroupItem>
		<ToggleGroupItem value="pin">
			<Icon icon={Pin} />
			<Text>Pin</Text>
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
			<Icon icon={Edit} />
		</ToggleGroupItem>
		<ToggleGroupItem value="star" aria-label="Star">
			<Icon icon={Star} />
		</ToggleGroupItem>
		<ToggleGroupItem value="pin" aria-label="Pin">
			<Icon icon={Pin} />
		</ToggleGroupItem>
	</ToggleGroup>
</Story>

<Story name="Justified (fill width)" asChild>
	<div style="width: 480px;">
		<ToggleGroup selectionMode="single" value={['center']} isJustified aria-label="Alignment">
			<ToggleGroupItem value="left"><Text>Left</Text></ToggleGroupItem>
			<ToggleGroupItem value="center"><Text>Center</Text></ToggleGroupItem>
			<ToggleGroupItem value="right"><Text>Right</Text></ToggleGroupItem>
			<ToggleGroupItem value="justify"><Text>Justify</Text></ToggleGroupItem>
		</ToggleGroup>
	</div>
</Story>

<Story name="Per-item disabled" asChild>
	<ToggleGroup selectionMode="multiple" value={['bold']} aria-label="Formatting">
		<ToggleGroupItem value="bold"><Text>Bold</Text></ToggleGroupItem>
		<ToggleGroupItem value="italic" isDisabled><Text>Italic (disabled)</Text></ToggleGroupItem>
		<ToggleGroupItem value="underline"><Text>Underline</Text></ToggleGroupItem>
	</ToggleGroup>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; align-items: start;">
		{#each ['xs', 's', 'm', 'l', 'xl'] as const as size (size)}
			<ToggleGroup selectionMode="single" {size} value={['center']} aria-label={`Size ${size}`}>
				<ToggleGroupItem value="left" aria-label="Left">
					<Icon icon={AlignLeft} />
				</ToggleGroupItem>
				<ToggleGroupItem value="center" aria-label="Center">
					<Icon icon={AlignCenter} />
				</ToggleGroupItem>
				<ToggleGroupItem value="right" aria-label="Right">
					<Icon icon={AlignRight} />
				</ToggleGroupItem>
			</ToggleGroup>
		{/each}
	</div>
</Story>
