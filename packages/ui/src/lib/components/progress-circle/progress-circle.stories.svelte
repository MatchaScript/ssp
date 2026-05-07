<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressCircle from './progress-circle.svelte';
	import Button from '../button/button.svelte';
	import { Text } from '../text/index.js';

	const { Story } = defineMeta({
		title: 'Components/ProgressCircle',
		component: ProgressCircle,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l']
			},
			value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
			isIndeterminate: { control: 'boolean' }
		},
		args: {
			size: 'm',
			value: 65,
			isIndeterminate: false
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<ProgressCircle {...args} aria-label="Loading" />
	{/snippet}
</Story>

<Story name="Determinate steps" asChild>
	<div style="display: flex; gap: 16px; align-items: center;">
		<ProgressCircle value={0} aria-label="0%" />
		<ProgressCircle value={25} aria-label="25%" />
		<ProgressCircle value={50} aria-label="50%" />
		<ProgressCircle value={75} aria-label="75%" />
		<ProgressCircle value={100} aria-label="100%" />
	</div>
</Story>

<Story name="Indeterminate spinner" asChild>
	<div style="display: flex; gap: 16px; align-items: center;">
		<ProgressCircle isIndeterminate size="s" aria-label="Loading" />
		<ProgressCircle isIndeterminate size="m" aria-label="Loading" />
		<ProgressCircle isIndeterminate size="l" aria-label="Loading" />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 16px; align-items: center;">
		<ProgressCircle size="s" value={65} aria-label="Small" />
		<ProgressCircle size="m" value={65} aria-label="Medium" />
		<ProgressCircle size="l" value={65} aria-label="Large" />
	</div>
</Story>

<Story name="Inline with text" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px;">
		<div style="display: inline-flex; align-items: center; gap: 8px;">
			<ProgressCircle size="s" isIndeterminate aria-label="Saving" />
			<span>Saving changes…</span>
		</div>
		<div style="display: inline-flex; align-items: center; gap: 8px;">
			<ProgressCircle size="s" value={72} aria-label="Progress" />
			<span>Compiling: 72%</span>
		</div>
	</div>
</Story>

<Story name="Inline with button" asChild>
	<div style="display: flex; gap: 12px; align-items: center;">
		<Button variant="primary" treatment="outline" isDisabled>
			<ProgressCircle size="s" isIndeterminate aria-label="Submitting" />
			<Text>Submitting…</Text>
		</Button>
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="display: flex; gap: 24px; align-items: center; padding: 24px; background: linear-gradient(135deg, #4a3aff, #9c2bff); border-radius: 8px;"
	>
		<ProgressCircle staticColor="white" isIndeterminate size="m" aria-label="Loading" />
		<ProgressCircle staticColor="white" value={60} size="l" aria-label="Progress" />
	</div>
</Story>
