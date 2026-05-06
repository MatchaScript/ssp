<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Meter from './meter.svelte';

	const { Story } = defineMeta({
		title: 'Components/Meter',
		component: Meter,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'inline-radio' },
				options: ['informative', 'positive', 'notice', 'negative']
			},
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			labelPosition: {
				control: { type: 'inline-radio' },
				options: ['top', 'side']
			},
			value: { control: { type: 'range', min: 0, max: 100, step: 1 } }
		},
		args: {
			variant: 'informative',
			size: 'm',
			labelPosition: 'top',
			value: 60,
			label: 'Storage used'
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<Meter {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Meter variant="positive" value={25} label="Disk usage" />
		<Meter variant="informative" value={55} label="Disk usage" />
		<Meter variant="notice" value={80} label="Disk usage" />
		<Meter variant="negative" value={95} label="Disk usage" />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
		<Meter size="s" value={60} label="Small" />
		<Meter size="m" value={60} label="Medium" />
		<Meter size="l" value={60} label="Large" />
		<Meter size="xl" value={60} label="Extra large" />
	</div>
</Story>

<Story name="Storage quota" asChild>
	<div
		style="display: flex; flex-direction: column; gap: 16px; width: 360px; padding: 16px; background: var(--background-layer-1-color); border-radius: 8px;"
	>
		<Meter
			variant="positive"
			value={18}
			max={256}
			label="Documents"
			valueLabel="18 GB of 256 GB"
		/>
		<Meter
			variant="informative"
			value={142}
			max={256}
			label="Photos"
			valueLabel="142 GB of 256 GB"
		/>
		<Meter variant="notice" value={212} max={256} label="System" valueLabel="212 GB of 256 GB" />
		<Meter
			variant="negative"
			value={249}
			max={256}
			label="Backups"
			valueLabel="249 GB of 256 GB"
		/>
	</div>
</Story>

<Story name="Label position — side" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px; width: 480px;">
		<Meter labelPosition="side" variant="positive" value={34} label="CPU" />
		<Meter labelPosition="side" variant="informative" value={61} label="Memory" />
		<Meter labelPosition="side" variant="notice" value={82} label="Network" />
	</div>
</Story>

<Story name="Custom value label" asChild>
	<div style="display: flex; flex-direction: column; gap: 16px; width: 360px;">
		<Meter variant="informative" value={3} max={5} label="Password strength" valueLabel="Strong" />
		<Meter
			variant="positive"
			value={48}
			max={60}
			label="Seats remaining"
			valueLabel="48 / 60 seats"
		/>
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="display: flex; flex-direction: column; gap: 16px; width: 360px; padding: 24px; background: linear-gradient(135deg, #4a3aff, #9c2bff); border-radius: 8px;"
	>
		<Meter staticColor="white" value={70} label="Download" />
		<Meter staticColor="white" value={30} label="Upload" />
	</div>
</Story>
