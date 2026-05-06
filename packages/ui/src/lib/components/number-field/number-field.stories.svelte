<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { NumberField } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/NumberField',
		component: NumberField,
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
			step: { control: { type: 'number' } },
			min: { control: { type: 'number' } },
			max: { control: { type: 'number' } },
			isError: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			isReadOnly: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			hideLabel: { control: 'boolean' },
			hideStepper: { control: 'boolean' }
		},
		args: {
			size: 'm',
			label: 'Quantity',
			placeholder: '0',
			step: 1,
			isError: false,
			isDisabled: false,
			isReadOnly: false,
			isRequired: false,
			hideLabel: false,
			hideStepper: false
		}
	});
</script>

<script lang="ts">
	let price = $state<number | null>(19.99);
	let quantity = $state<number | null>(1);
	const total = $derived((price ?? 0) * (quantity ?? 0));
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 240px;">
			<NumberField {...args} />
		</div>
	{/snippet}
</Story>

<Story name="With min / max & step" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 240px;">
		<NumberField label="Volume" value={50} min={0} max={100} step={5} helpText="0–100, step 5" />
		<NumberField label="Rating" value={3} min={1} max={5} helpText="Whole stars only" />
		<NumberField label="Temperature" value={20.5} step={0.5} helpText="Half-degree increments" />
	</div>
</Story>

<Story name="Error state" asChild>
	<div style="width: 240px;">
		<NumberField
			label="Age"
			value={-2}
			min={0}
			isError
			errorMessage="Age must be a positive number."
		/>
	</div>
</Story>

<Story name="Hide stepper" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 240px;">
		<NumberField label="With stepper" value={10} />
		<NumberField label="Without stepper" value={10} hideStepper />
	</div>
</Story>

<Story name="Disabled & read-only" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 240px;">
		<NumberField label="Disabled" value={42} isDisabled />
		<NumberField label="Read-only" value={42} isReadOnly />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 240px;">
		<NumberField size="s" label="Small" value={1} />
		<NumberField size="m" label="Medium" value={1} />
		<NumberField size="l" label="Large" value={1} />
		<NumberField size="xl" label="Extra large" value={1} />
	</div>
</Story>

<Story name="Order form">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px; padding: var(--space-4); border: 1px solid var(--gray-200); border-radius: var(--corner-radius-medium-default);"
		>
			<NumberField bind:value={price} label="Unit price" min={0} step={0.01} />
			<NumberField bind:value={quantity} label="Quantity" min={1} max={99} />
			<div
				style="display: flex; justify-content: space-between; padding-top: var(--space-3); border-top: 1px solid var(--gray-200); font-weight: 600;"
			>
				<span>Total</span>
				<span>${total.toFixed(2)}</span>
			</div>
		</div>
	{/snippet}
</Story>
