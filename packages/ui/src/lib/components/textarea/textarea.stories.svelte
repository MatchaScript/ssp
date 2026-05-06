<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { TextArea } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/TextArea',
		component: TextArea,
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
			rows: { control: { type: 'number', min: 1, max: 20 } },
			isAutoResize: { control: 'boolean' },
			isError: { control: 'boolean' },
			showValidIcon: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			isReadOnly: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			hideLabel: { control: 'boolean' }
		},
		args: {
			size: 'm',
			label: 'Description',
			placeholder: 'Type a description…',
			labelPosition: 'top',
			necessityIndicator: 'icon',
			rows: 3,
			isAutoResize: true,
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
	const MAX = 120;
	let bio = $state('');
	const remaining = $derived(MAX - bio.length);
	const overLimit = $derived(remaining < 0);
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 360px;">
			<TextArea {...args} />
		</div>
	{/snippet}
</Story>

<Story name="With help text" asChild>
	<div style="width: 360px;">
		<TextArea
			label="Release notes"
			helpText="Markdown supported. Keep it short and descriptive."
			placeholder="What changed in this release?"
			rows={4}
		/>
	</div>
</Story>

<Story name="Error state" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 360px;">
		<TextArea
			label="Feedback"
			value="x"
			isError
			errorMessage="Feedback must be at least 20 characters."
		/>
		<TextArea
			label="Feedback"
			value="This is a much longer, more thoughtful piece of feedback."
			showValidIcon
			helpText="Thanks — saved."
		/>
	</div>
</Story>

<Story name="Fixed rows (no auto-resize)" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 360px;">
		<TextArea label="Compact" rows={2} isAutoResize={false} placeholder="Two rows, no resize" />
		<TextArea label="Roomy" rows={6} isAutoResize={false} placeholder="Six rows, no resize" />
	</div>
</Story>

<Story name="Disabled & read-only" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 360px;">
		<TextArea label="Disabled" value="You can't edit this." isDisabled />
		<TextArea label="Read-only" value="Published content, read-only view." isReadOnly />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 360px;">
		<TextArea size="s" label="Small" placeholder="Size s" />
		<TextArea size="m" label="Medium" placeholder="Size m" />
		<TextArea size="l" label="Large" placeholder="Size l" />
		<TextArea size="xl" label="Extra large" placeholder="Size xl" />
	</div>
</Story>

<Story name="Characters remaining">
	{#snippet template()}
		<div style="width: 360px;">
			<TextArea
				bind:value={bio}
				label="Bio"
				placeholder="Tell us about yourself"
				rows={4}
				isError={overLimit}
				errorMessage={overLimit ? `${Math.abs(remaining)} over limit` : undefined}
				helpText={overLimit ? undefined : `${remaining} characters remaining`}
			/>
		</div>
	{/snippet}
</Story>
