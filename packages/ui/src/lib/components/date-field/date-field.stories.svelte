<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { DateField } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/DateField',
		component: DateField,
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
			label: 'Birthday',
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
	let controlled = $state('2026-04-25');
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<DateField {...args} />
		</div>
	{/snippet}
</Story>

<Story name="With value" asChild>
	<div style="width: 320px;">
		<DateField label="Start date" value="2026-04-25" />
	</div>
</Story>

<Story name="With help text" asChild>
	<div style="width: 320px;">
		<DateField label="Birthday" helpText="We use this to send you a card." />
	</div>
</Story>

<Story name="Error state" asChild>
	<div style="width: 320px;">
		<DateField
			label="Start date"
			value="2020-01-01"
			min="2026-01-01"
			isError
			errorMessage="Choose a date in 2026 or later."
		/>
	</div>
</Story>

<Story name="Required & optional" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<DateField label="Date of birth" isRequired necessityIndicator="icon" />
		<DateField label="Anniversary" necessityIndicator="text" />
		<DateField label="Start date" isRequired necessityIndicator="text" />
	</div>
</Story>

<Story name="Disabled & read-only" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<DateField label="Disabled" value="2026-04-25" isDisabled />
		<DateField label="Read-only" value="2026-04-25" isReadOnly />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<DateField size="s" label="Small" />
		<DateField size="m" label="Medium" />
		<DateField size="l" label="Large" />
		<DateField size="xl" label="Extra large" />
	</div>
</Story>

<Story name="Side label" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 480px;">
		<DateField label="Start" labelPosition="side" />
		<DateField label="End" labelPosition="side" />
	</div>
</Story>

<Story name="Min/max constraints" asChild>
	<div style="width: 320px;">
		<DateField
			label="Within April 2026"
			min="2026-04-01"
			max="2026-04-30"
			helpText="Only dates in April 2026 are accepted."
		/>
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 320px;">
			<DateField bind:value={controlled} label="Pick a date" />
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				ISO: {controlled || '—'}
			</div>
		</div>
	{/snippet}
</Story>
