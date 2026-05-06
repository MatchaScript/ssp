<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { TextField } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/TextField',
		component: TextField,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			type: {
				control: { type: 'select' },
				options: ['text', 'password', 'email', 'tel', 'url', 'number', 'search']
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
			showValidIcon: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			isReadOnly: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			hideLabel: { control: 'boolean' }
		},
		args: {
			size: 'm',
			type: 'text',
			label: 'Name',
			placeholder: 'Enter your name',
			labelPosition: 'top',
			necessityIndicator: 'icon',
			isError: false,
			showValidIcon: false,
			isDisabled: false,
			isReadOnly: false,
			isRequired: false,
			hideLabel: false
		}
	});
</script>

<script lang="ts">
	let controlled = $state('');
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<TextField {...args} />
		</div>
	{/snippet}
</Story>

<Story name="With help text" asChild>
	<div style="width: 320px;">
		<TextField label="Username" helpText="3–20 characters, letters and numbers only." placeholder="jane_doe" />
	</div>
</Story>

<Story name="Error state" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TextField
			label="Email"
			type="email"
			value="not-an-email"
			isError
			errorMessage="Enter a valid email address."
		/>
		<TextField
			label="Email"
			type="email"
			value="jane@example.com"
			showValidIcon
			helpText="Looks good."
		/>
	</div>
</Story>

<Story name="Required & optional" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TextField label="Full name" isRequired necessityIndicator="icon" />
		<TextField label="Company" necessityIndicator="text" />
		<TextField label="Phone" isRequired necessityIndicator="text" />
	</div>
</Story>

<Story name="Disabled & read-only" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TextField label="Disabled" value="Cannot edit" isDisabled />
		<TextField label="Read-only" value="Display only" isReadOnly />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TextField size="s" label="Small" placeholder="Small" />
		<TextField size="m" label="Medium" placeholder="Medium" />
		<TextField size="l" label="Large" placeholder="Large" />
		<TextField size="xl" label="Extra large" placeholder="Extra large" />
	</div>
</Story>

<Story name="Side label" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 480px;">
		<TextField label="First name" labelPosition="side" placeholder="Jane" />
		<TextField label="Last name" labelPosition="side" placeholder="Doe" />
		<TextField
			label="Email"
			labelPosition="side"
			type="email"
			isError
			value="oops"
			errorMessage="Invalid email."
		/>
	</div>
</Story>

<Story name="Input types" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<TextField label="Email" type="email" placeholder="name@example.com" />
		<TextField label="Password" type="password" placeholder="••••••••" />
		<TextField label="Phone" type="tel" placeholder="+1 555 123 4567" />
		<TextField label="Website" type="url" placeholder="https://" />
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 320px;">
			<TextField bind:value={controlled} label="Comment" placeholder="Say something" />
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Length: {controlled.length}
			</div>
		</div>
	{/snippet}
</Story>
