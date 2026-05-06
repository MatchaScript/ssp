<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressBar from './progress-bar.svelte';

	const { Story } = defineMeta({
		title: 'Components/ProgressBar',
		component: ProgressBar,
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
			isIndeterminate: { control: 'boolean' },
			hideLabel: { control: 'boolean' }
		},
		args: {
			size: 'm',
			labelPosition: 'top',
			value: 50,
			isIndeterminate: false,
			hideLabel: false,
			label: 'Loading assets'
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<ProgressBar {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Determinate steps" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<ProgressBar value={0} label="Uploading" />
		<ProgressBar value={25} label="Uploading" />
		<ProgressBar value={50} label="Uploading" />
		<ProgressBar value={75} label="Uploading" />
		<ProgressBar value={100} label="Uploading" />
	</div>
</Story>

<Story name="Indeterminate" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<ProgressBar isIndeterminate label="Connecting to server…" />
		<ProgressBar isIndeterminate label="Checking for updates…" labelPosition="side" />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<ProgressBar size="s" value={60} label="Small" />
		<ProgressBar size="m" value={60} label="Medium" />
		<ProgressBar size="l" value={60} label="Large" />
		<ProgressBar size="xl" value={60} label="Extra large" />
	</div>
</Story>

<Story name="Label position — side" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; width: 480px;">
		<ProgressBar labelPosition="side" value={20} label="Step 1 of 5" />
		<ProgressBar labelPosition="side" value={60} label="Step 3 of 5" />
		<ProgressBar labelPosition="side" value={100} label="Step 5 of 5" />
	</div>
</Story>

<Story name="Custom value label" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 360px;">
		<ProgressBar value={34} max={100} label="Download" valueLabel="34 MB of 100 MB" />
		<ProgressBar value={8} max={12} label="Tests run" valueLabel="8 / 12" />
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="display: flex; flex-direction: column; gap: 16px; width: 360px; padding: 24px; background: linear-gradient(135deg, #4a3aff, #9c2bff); border-radius: 8px;"
	>
		<ProgressBar staticColor="white" value={72} label="Syncing" />
		<ProgressBar staticColor="white" isIndeterminate label="Preparing preview…" />
	</div>
</Story>

<Story name="Hidden label" asChild>
	<div style="width: 320px;">
		<ProgressBar value={40} label="File upload progress" hideLabel />
	</div>
</Story>
