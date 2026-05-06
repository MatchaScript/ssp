<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Slider from './slider.svelte';

	const { Story } = defineMeta({
		title: 'Components/Slider',
		component: Slider,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			labelPosition: {
				control: { type: 'inline-radio' },
				options: ['top', 'side']
			},
			value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
			hasFill: { control: 'boolean' },
			isEmphasized: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			hideValue: { control: 'boolean' }
		},
		args: {
			size: 'm',
			labelPosition: 'top',
			value: 50,
			hasFill: false,
			isEmphasized: false,
			isDisabled: false,
			hideValue: false,
			label: 'Value'
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<Slider {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Slider size="s" label="Small" value={40} />
		<Slider size="m" label="Medium" value={40} />
		<Slider size="l" label="Large" value={40} />
		<Slider size="xl" label="Extra large" value={40} />
	</div>
</Story>

<Story name="Filled" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Slider label="Default" value={60} />
		<Slider label="Filled" value={60} hasFill />
		<Slider label="Emphasized fill" value={60} hasFill isEmphasized />
	</div>
</Story>

<Story name="Filled from center" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Slider label="Pan (−20)" min={-50} max={50} value={-20} hasFill fillStart={0} />
		<Slider label="Pan (0)" min={-50} max={50} value={0} hasFill fillStart={0} />
		<Slider label="Pan (+30)" min={-50} max={50} value={30} hasFill fillStart={0} isEmphasized />
	</div>
</Story>

<Story name="Volume & brightness" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Slider label="Volume" value={72} hasFill valueLabel="72%" />
		<Slider label="Brightness" value={45} hasFill isEmphasized valueLabel="45%" />
	</div>
</Story>

<Story name="Label position — side" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; width: 480px;">
		<Slider labelPosition="side" label="Volume" value={40} hasFill />
		<Slider labelPosition="side" label="Pitch" value={65} hasFill isEmphasized />
	</div>
</Story>

<Story name="Step increments" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Slider label="Step 1" value={50} step={1} />
		<Slider label="Step 10" value={50} step={10} />
		<Slider label="Step 25" value={50} step={25} />
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Slider label="Locked" value={30} isDisabled />
		<Slider label="Locked filled" value={70} hasFill isDisabled />
	</div>
</Story>
