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
	import { Text } from '$lib/components/text';

	let pinned = $state(false);
</script>

<Story name="Example">
	{#snippet template(args)}
		<ToggleButton {...args}>
			<Icon icon={Bookmark} />
			<Text>Bookmark</Text>
		</ToggleButton>
	{/snippet}
</Story>

<Story name="Bind isSelected" asChild>
	<div style="display: flex; gap: 8px; align-items: center;">
		<ToggleButton bind:isSelected={pinned} aria-label={pinned ? 'Unpin' : 'Pin'}>
			<Icon icon={pinned ? PinOff : Pin} />
			<Text>{pinned ? 'Pinned' : 'Pin'}</Text>
		</ToggleButton>
		<span style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			state: {pinned ? 'on' : 'off'}
		</span>
	</div>
</Story>

<Story name="Quiet" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ToggleButton isQuiet>
			<Icon icon={Star} />
			<Text>Quiet off</Text>
		</ToggleButton>
		<ToggleButton isQuiet isSelected>
			<Icon icon={Star} />
			<Text>Quiet on</Text>
		</ToggleButton>
	</div>
</Story>

<Story name="Emphasized" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ToggleButton isEmphasized><Text>Off</Text></ToggleButton>
		<ToggleButton isEmphasized isSelected><Text>On</Text></ToggleButton>
		<ToggleButton isEmphasized isQuiet isSelected><Text>Quiet emphasized on</Text></ToggleButton>
	</div>
</Story>

<Story name="Icon only" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ToggleButton size="s" aria-label="Bookmark">
			<Icon icon={Bookmark} />
		</ToggleButton>
		<ToggleButton size="m" isSelected aria-label="Bookmark">
			<Icon icon={Bookmark} />
		</ToggleButton>
		<ToggleButton size="l" aria-label="Bookmark">
			<Icon icon={Bookmark} />
		</ToggleButton>
		<ToggleButton size="xl" isSelected aria-label="Bookmark">
			<Icon icon={Bookmark} />
		</ToggleButton>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
		<ToggleButton size="xs"><Text>XS</Text></ToggleButton>
		<ToggleButton size="s"><Text>S</Text></ToggleButton>
		<ToggleButton size="m" isSelected><Text>M</Text></ToggleButton>
		<ToggleButton size="l"><Text>L</Text></ToggleButton>
		<ToggleButton size="xl"><Text>XL</Text></ToggleButton>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<ToggleButton disabled><Text>Off, disabled</Text></ToggleButton>
		<ToggleButton disabled isSelected><Text>On, disabled</Text></ToggleButton>
		<ToggleButton disabled isQuiet isSelected>
			<Icon icon={Edit} />
			<Text>Quiet on, disabled</Text>
		</ToggleButton>
	</div>
</Story>
