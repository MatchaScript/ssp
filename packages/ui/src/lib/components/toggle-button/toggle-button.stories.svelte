<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ToggleButton from './toggle-button.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		title: 'Components/ToggleButton',
		component: ToggleButton,
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['xs', 's', 'm', 'l', 'xl']
			},
			isQuiet: { control: 'boolean' },
			isEmphasized: { control: 'boolean' },
			isSelected: { control: 'boolean' },
			staticColor: {
				control: { type: 'inline-radio' },
				options: [undefined, 'white', 'black', 'auto']
			},
			disabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			isQuiet: false,
			isEmphasized: false,
			isSelected: false,
			disabled: false
		}
	});
</script>

<script lang="ts">
	import { Icon, Bookmark, Pin, PinOff, Star, Edit } from '$lib/components/icon';

	let pinned = $state(false);
</script>

<Story name="Example">
	{#snippet template(args)}
		<ToggleButton {...args}>
			{#snippet icon()}<Icon icon={Bookmark} size={args.size} />{/snippet}
			Bookmark
		</ToggleButton>
	{/snippet}
</Story>

<Story name="Bind isSelected" asChild>
	<div style="display: flex; gap: 8px; align-items: center;">
		<ToggleButton bind:isSelected={pinned} aria-label={pinned ? 'Unpin' : 'Pin'}>
			{#snippet icon()}<Icon icon={pinned ? PinOff : Pin} size="m" />{/snippet}
			{pinned ? 'Pinned' : 'Pin'}
		</ToggleButton>
		<span style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			state: {pinned ? 'on' : 'off'}
		</span>
	</div>
</Story>

<Story name="Quiet" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ToggleButton isQuiet>
			{#snippet icon()}<Icon icon={Star} size="m" />{/snippet}
			Quiet off
		</ToggleButton>
		<ToggleButton isQuiet isSelected>
			{#snippet icon()}<Icon icon={Star} size="m" />{/snippet}
			Quiet on
		</ToggleButton>
	</div>
</Story>

<Story name="Emphasized" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ToggleButton isEmphasized>Off</ToggleButton>
		<ToggleButton isEmphasized isSelected>On</ToggleButton>
		<ToggleButton isEmphasized isQuiet isSelected>Quiet emphasized on</ToggleButton>
	</div>
</Story>

<Story name="Icon only" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ToggleButton size="s" aria-label="Bookmark">
			{#snippet icon()}<Icon icon={Bookmark} size="s" />{/snippet}
		</ToggleButton>
		<ToggleButton size="m" isSelected aria-label="Bookmark">
			{#snippet icon()}<Icon icon={Bookmark} size="m" />{/snippet}
		</ToggleButton>
		<ToggleButton size="l" aria-label="Bookmark">
			{#snippet icon()}<Icon icon={Bookmark} size="l" />{/snippet}
		</ToggleButton>
		<ToggleButton size="xl" isSelected aria-label="Bookmark">
			{#snippet icon()}<Icon icon={Bookmark} size="xl" />{/snippet}
		</ToggleButton>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ToggleButton size="xs">XS</ToggleButton>
		<ToggleButton size="s">S</ToggleButton>
		<ToggleButton size="m" isSelected>M</ToggleButton>
		<ToggleButton size="l">L</ToggleButton>
		<ToggleButton size="xl">XL</ToggleButton>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ToggleButton disabled>Off, disabled</ToggleButton>
		<ToggleButton disabled isSelected>On, disabled</ToggleButton>
		<ToggleButton disabled isQuiet isSelected>
			{#snippet icon()}<Icon icon={Edit} size="m" />{/snippet}
			Quiet on, disabled
		</ToggleButton>
	</div>
</Story>
