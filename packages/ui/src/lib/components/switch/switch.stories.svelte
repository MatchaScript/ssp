<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Switch from './switch.svelte';

	const { Story } = defineMeta({
		title: 'Components/Switch',
		component: Switch,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			isEmphasized: { control: 'boolean' },
			checked: { control: 'boolean' },
			isDisabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			isEmphasized: false,
			checked: false,
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	let notifications = $state(true);
	let beta = $state(false);
	let autoSave = $state(true);
</script>

<Story name="Example">
	{#snippet template(args)}
		<Switch {...args}>Enable setting</Switch>
	{/snippet}
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; align-items: start; gap: var(--space-3);">
		{#each ['s', 'm', 'l', 'xl'] as const as size (size)}
			<Switch {size} checked>Size {size}</Switch>
		{/each}
	</div>
</Story>

<Story name="States" asChild>
	<div
		style="display: grid; grid-template-columns: repeat(2, max-content); gap: var(--space-3) var(--space-6);"
	>
		<Switch>Off</Switch>
		<Switch checked>On</Switch>
		<Switch isEmphasized>Emphasized · off</Switch>
		<Switch isEmphasized checked>Emphasized · on</Switch>
		<Switch isDisabled>Disabled · off</Switch>
		<Switch isDisabled checked>Disabled · on</Switch>
	</div>
</Story>

<Story name="Without label" asChild>
	<div style="display: flex; gap: var(--space-3); align-items: center;">
		<Switch aria-label="Toggle dark mode" />
		<Switch aria-label="Toggle dark mode" checked />
		<Switch aria-label="Toggle dark mode" checked isEmphasized />
	</div>
</Story>

<Story name="Settings list" asChild>
	<div
		style="display: flex; flex-direction: column; gap: var(--space-4); width: 360px; padding: var(--space-4); border: 1px solid var(--gray-200); border-radius: var(--corner-radius-medium-default);"
	>
		<Switch checked isEmphasized>Email notifications</Switch>
		<Switch checked>Push notifications</Switch>
		<Switch>SMS alerts</Switch>
		<Switch isDisabled>Weekly summary (coming soon)</Switch>
	</div>
</Story>

<Story name="Long label (alignment)" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 360px;">
		<Switch>
			Share anonymous usage data with the team to help improve future releases and prioritize bug
			fixes.
		</Switch>
		<Switch checked isEmphasized>
			Automatically install minor updates when the app is idle overnight.
		</Switch>
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: var(--space-3); width: 320px;">
			<Switch bind:checked={notifications} isEmphasized>Notifications</Switch>
			<Switch bind:checked={autoSave}>Auto-save drafts</Switch>
			<Switch bind:checked={beta}>Enable beta features</Switch>
			<div
				style="margin-top: var(--space-2); padding: var(--space-3); background: var(--neutral-subtle-background-color-default); border-radius: var(--corner-radius-small-default); font-family: var(--font-mono, monospace); font-size: var(--text-75);"
			>
				{JSON.stringify({ notifications, autoSave, beta }, null, 2)}
			</div>
		</div>
	{/snippet}
</Story>
