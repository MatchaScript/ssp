<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { TimeField } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/TimeField',
		component: TimeField,
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
			necessityIndicator: {
				control: { type: 'inline-radio' },
				options: ['icon', 'text']
			},
			isError: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			isReadOnly: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			hideLabel: { control: 'boolean' }
		},
		args: {
			size: 'm',
			label: 'Meeting time',
			labelPosition: 'top',
			necessityIndicator: 'icon',
			isError: false,
			isDisabled: false,
			isReadOnly: false,
			isRequired: false,
			hideLabel: false
		}
	});
</script>

<script lang="ts">
	let controlled = $state('14:30');
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<TimeField {...args} />
		</div>
	{/snippet}
</Story>

<Story name="With value" asChild>
	<div style="width: 320px;">
		<TimeField label="Start time" value="09:00" />
	</div>
</Story>

<Story name="With help text" asChild>
	<div style="width: 320px;">
		<TimeField label="Wake-up time" helpText="We'll send a reminder a bit earlier." />
	</div>
</Story>

<Story name="Second precision" asChild>
	<div style="width: 320px;">
		<TimeField
			label="Stopwatch"
			step={1}
			value="00:00:00"
			helpText="Step=1 reveals the seconds segment."
		/>
	</div>
</Story>

<Story name="Error state" asChild>
	<div style="width: 320px;">
		<TimeField
			label="Start time"
			value="07:00"
			min="09:00"
			isError
			errorMessage="Choose a time at or after 09:00."
		/>
	</div>
</Story>

<Story name="Required & optional" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TimeField label="Start" isRequired necessityIndicator="icon" />
		<TimeField label="Break" necessityIndicator="text" />
		<TimeField label="End" isRequired necessityIndicator="text" />
	</div>
</Story>

<Story name="Disabled & read-only" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TimeField label="Disabled" value="14:30" isDisabled />
		<TimeField label="Read-only" value="14:30" isReadOnly />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TimeField size="s" label="Small" />
		<TimeField size="m" label="Medium" />
		<TimeField size="l" label="Large" />
		<TimeField size="xl" label="Extra large" />
	</div>
</Story>

<Story name="Side label" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 480px;">
		<TimeField label="Start" labelPosition="side" />
		<TimeField label="End" labelPosition="side" />
	</div>
</Story>

<Story name="Min/max constraints" asChild>
	<div style="width: 320px;">
		<TimeField
			label="Working hours"
			min="09:00"
			max="18:00"
			helpText="Only times between 09:00 and 18:00 are accepted."
		/>
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 320px;">
			<TimeField bind:value={controlled} label="Pick a time" />
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Value: {controlled || '—'}
			</div>
		</div>
	{/snippet}
</Story>
