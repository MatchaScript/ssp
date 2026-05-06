<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusLight from './status-light.svelte';

	const { Story } = defineMeta({
		title: 'Components/StatusLight',
		component: StatusLight,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'inline-radio' },
				options: ['neutral', 'informative', 'positive', 'negative', 'notice']
			},
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			}
		},
		args: {
			variant: 'positive',
			size: 'm'
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<StatusLight {...args}>Online</StatusLight>
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div style="display: flex; flex-direction: column; gap: 4px;">
		<StatusLight variant="neutral">Archived</StatusLight>
		<StatusLight variant="informative">In progress</StatusLight>
		<StatusLight variant="positive">Approved</StatusLight>
		<StatusLight variant="notice">Needs review</StatusLight>
		<StatusLight variant="negative">Rejected</StatusLight>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: 4px;">
		<StatusLight size="s" variant="positive">Small</StatusLight>
		<StatusLight size="m" variant="positive">Medium</StatusLight>
		<StatusLight size="l" variant="positive">Large</StatusLight>
		<StatusLight size="xl" variant="positive">Extra large</StatusLight>
	</div>
</Story>

<Story name="Server status list" asChild>
	<div
		style="display: flex; flex-direction: column; width: 360px; background: var(--background-layer-1-color); border-radius: 8px; overflow: hidden;"
	>
		<div
			style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; border-bottom: 1px solid var(--neutral-subtle-background-color-default);"
		>
			<span style="font-family: var(--font-mono);">api-prod-01</span>
			<StatusLight size="s" variant="positive">Healthy</StatusLight>
		</div>
		<div
			style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; border-bottom: 1px solid var(--neutral-subtle-background-color-default);"
		>
			<span style="font-family: var(--font-mono);">api-prod-02</span>
			<StatusLight size="s" variant="positive">Healthy</StatusLight>
		</div>
		<div
			style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; border-bottom: 1px solid var(--neutral-subtle-background-color-default);"
		>
			<span style="font-family: var(--font-mono);">worker-eu-03</span>
			<StatusLight size="s" variant="notice">Degraded</StatusLight>
		</div>
		<div
			style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; border-bottom: 1px solid var(--neutral-subtle-background-color-default);"
		>
			<span style="font-family: var(--font-mono);">cache-us-west</span>
			<StatusLight size="s" variant="negative">Down</StatusLight>
		</div>
		<div
			style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px;"
		>
			<span style="font-family: var(--font-mono);">staging-01</span>
			<StatusLight size="s" variant="neutral">Offline</StatusLight>
		</div>
	</div>
</Story>

<Story name="Build pipeline status" asChild>
	<div style="display: flex; flex-direction: column; gap: 6px;">
		<StatusLight variant="informative">Queued</StatusLight>
		<StatusLight variant="notice">Running</StatusLight>
		<StatusLight variant="positive">Passed</StatusLight>
		<StatusLight variant="negative">Failed</StatusLight>
	</div>
</Story>

<Story name="Without label" asChild>
	<div style="display: flex; gap: 16px; align-items: center;">
		<StatusLight variant="positive" aria-label="Online" />
		<StatusLight variant="notice" aria-label="Warning" />
		<StatusLight variant="negative" aria-label="Offline" />
		<StatusLight variant="informative" aria-label="Syncing" />
	</div>
</Story>
