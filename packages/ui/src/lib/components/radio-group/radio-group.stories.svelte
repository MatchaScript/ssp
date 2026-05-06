<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RadioGroup from './radio-group.svelte';

	const { Story } = defineMeta({
		title: 'Components/RadioGroup',
		component: RadioGroup,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			orientation: {
				control: { type: 'inline-radio' },
				options: ['vertical', 'horizontal']
			},
			labelPosition: {
				control: { type: 'inline-radio' },
				options: ['top', 'side']
			},
			necessityIndicator: {
				control: { type: 'inline-radio' },
				options: ['icon', 'text']
			},
			isEmphasized: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			isError: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			isReadOnly: { control: 'boolean' }
		},
		args: {
			size: 'm',
			orientation: 'vertical',
			labelPosition: 'top',
			necessityIndicator: 'icon',
			isEmphasized: false,
			isDisabled: false,
			isError: false,
			isRequired: false,
			isReadOnly: false
		}
	});
</script>

<script lang="ts">
	import Radio from './radio.svelte';

	let shipping = $state<string | null>('standard');
</script>

<Story name="Example">
	{#snippet template(args)}
		<RadioGroup {...args} label="Favorite fruit" helpText="Pick one." value="apple">
			<Radio value="apple">Apple</Radio>
			<Radio value="banana">Banana</Radio>
			<Radio value="cherry">Cherry</Radio>
			<Radio value="durian" isDisabled>Durian (unavailable)</Radio>
		</RadioGroup>
	{/snippet}
</Story>

<Story name="Horizontal" asChild>
	<RadioGroup label="Align" orientation="horizontal" value="center">
		<Radio value="left">Left</Radio>
		<Radio value="center">Center</Radio>
		<Radio value="right">Right</Radio>
	</RadioGroup>
</Story>

<Story name="Emphasized" asChild>
	<RadioGroup label="Plan" isEmphasized value="pro" helpText="Most teams choose Pro.">
		<Radio value="free">Free</Radio>
		<Radio value="pro">Pro</Radio>
		<Radio value="enterprise">Enterprise</Radio>
	</RadioGroup>
</Story>

<Story name="Error state" asChild>
	<RadioGroup label="Payment method" isError errorMessage="Please choose a payment method." isRequired>
		<Radio value="card">Credit card</Radio>
		<Radio value="paypal">PayPal</Radio>
		<Radio value="bank">Bank transfer</Radio>
	</RadioGroup>
</Story>

<Story name="Required / optional" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-5);">
		<RadioGroup label="Gender" isRequired necessityIndicator="icon">
			<Radio value="female">Female</Radio>
			<Radio value="male">Male</Radio>
			<Radio value="other">Other</Radio>
		</RadioGroup>
		<RadioGroup label="Newsletter" necessityIndicator="text">
			<Radio value="yes">Subscribe</Radio>
			<Radio value="no">No thanks</Radio>
		</RadioGroup>
	</div>
</Story>

<Story name="Disabled subset" asChild>
	<RadioGroup label="Shipping" value="standard">
		<Radio value="standard">Standard (3–5 days)</Radio>
		<Radio value="express">Express (1–2 days)</Radio>
		<Radio value="overnight" isDisabled>Overnight (unavailable to your region)</Radio>
	</RadioGroup>
</Story>

<Story name="Read-only" asChild>
	<RadioGroup label="Selected theme" isReadOnly value="dark" helpText="Change in Settings.">
		<Radio value="light">Light</Radio>
		<Radio value="dark">Dark</Radio>
		<Radio value="system">System</Radio>
	</RadioGroup>
</Story>

<Story name="Side label" asChild>
	<RadioGroup label="Density" labelPosition="side" orientation="horizontal" value="comfortable">
		<Radio value="compact">Compact</Radio>
		<Radio value="comfortable">Comfortable</Radio>
		<Radio value="spacious">Spacious</Radio>
	</RadioGroup>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-5);">
		{#each ['s', 'm', 'l', 'xl'] as const as size (size)}
			<RadioGroup {size} label={`Size ${size}`} orientation="horizontal" value="b">
				<Radio value="a">One</Radio>
				<Radio value="b">Two</Radio>
				<Radio value="c">Three</Radio>
			</RadioGroup>
		{/each}
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3);">
			<RadioGroup bind:value={shipping} label="Shipping" onValueChange={(v) => console.log('→', v)}>
				<Radio value="standard">Standard</Radio>
				<Radio value="express">Express</Radio>
				<Radio value="overnight">Overnight</Radio>
			</RadioGroup>
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Selected: {shipping ?? '(none)'}
			</div>
		</div>
	{/snippet}
</Story>
