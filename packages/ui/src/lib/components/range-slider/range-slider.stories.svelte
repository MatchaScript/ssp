<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RangeSlider from './range-slider.svelte';

	const { Story } = defineMeta({
		title: 'Components/RangeSlider',
		component: RangeSlider,
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
			isEmphasized: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			hideValue: { control: 'boolean' }
		},
		args: {
			size: 'm',
			labelPosition: 'top',
			isEmphasized: false,
			isDisabled: false,
			hideValue: false,
			label: 'Range',
			value: { start: 25, end: 75 }
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<RangeSlider {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<RangeSlider size="s" label="Small" value={{ start: 20, end: 60 }} />
		<RangeSlider size="m" label="Medium" value={{ start: 20, end: 60 }} />
		<RangeSlider size="l" label="Large" value={{ start: 20, end: 60 }} />
		<RangeSlider size="xl" label="Extra large" value={{ start: 20, end: 60 }} />
	</div>
</Story>

<Story name="Emphasized" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<RangeSlider label="Default" value={{ start: 20, end: 80 }} />
		<RangeSlider label="Emphasized" value={{ start: 20, end: 80 }} isEmphasized />
	</div>
</Story>

<Story name="Price range filter" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 360px;">
		<RangeSlider
			label="Price"
			min={0}
			max={500}
			step={5}
			value={{ start: 80, end: 320 }}
			valueLabel="$80 – $320"
			isEmphasized
		/>
		<RangeSlider
			label="Price"
			min={0}
			max={500}
			step={5}
			value={{ start: 0, end: 500 }}
			valueLabel="Any"
		/>
	</div>
</Story>

<Story name="Label position — side" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; width: 480px;">
		<RangeSlider labelPosition="side" label="Time" value={{ start: 30, end: 60 }} />
		<RangeSlider
			labelPosition="side"
			label="Temp"
			min={-20}
			max={40}
			value={{ start: 5, end: 25 }}
			valueLabel="5°C – 25°C"
			isEmphasized
		/>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<RangeSlider label="Locked" value={{ start: 30, end: 70 }} isDisabled />
		<RangeSlider label="Locked emphasized" value={{ start: 30, end: 70 }} isEmphasized isDisabled />
	</div>
</Story>

<Story name="Hidden value" asChild>
	<div style="width: 320px;">
		<RangeSlider label="Range" value={{ start: 40, end: 60 }} hideValue />
	</div>
</Story>
