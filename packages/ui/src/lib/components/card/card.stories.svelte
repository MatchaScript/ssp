<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Card } from './index.js';
	import Button from '$lib/components/button/button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Card',
		component: Card,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: ['primary', 'secondary', 'tertiary', 'quiet']
			},
			size: {
				control: 'select',
				options: ['s', 'm', 'l']
			},
			density: {
				control: 'select',
				options: ['compact', 'regular', 'spacious']
			}
		}
	});
</script>

<!-- Variants -->
<!-- Sizes -->
<!-- Interactive Link -->
<!-- With Preview -->
<!-- With Footer -->
<!-- Density -->

<Story name="Default">
	{#snippet template(args)}
		<Card {...args}>
			{#snippet heading()}Primary{/snippet}
			{#snippet description()}Elevated surface + shadow. Most prominent card.{/snippet}
		</Card>
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<Card variant="primary">
			{#snippet heading()}Primary{/snippet}
			{#snippet description()}Elevated surface + shadow. Most prominent card.{/snippet}
		</Card>
		<Card variant="secondary">
			{#snippet heading()}Secondary{/snippet}
			{#snippet description()}Layer-1 surface + shadow. Subtle elevation.{/snippet}
		</Card>
		<Card variant="tertiary">
			{#snippet heading()}Tertiary{/snippet}
			{#snippet description()}Transparent with border. Minimal chrome.{/snippet}
		</Card>
		<Card variant="quiet">
			{#snippet heading()}Quiet{/snippet}
			{#snippet description()}No chrome. Appears on hover.{/snippet}
		</Card>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 360px;">
		<Card size="s">
			{#snippet heading()}Small{/snippet}
			{#snippet description()}Compact typography and spacing.{/snippet}
		</Card>
		<Card size="m">
			{#snippet heading()}Medium{/snippet}
			{#snippet description()}Default size for most use cases.{/snippet}
		</Card>
		<Card size="l">
			{#snippet heading()}Large{/snippet}
			{#snippet description()}Larger typography and more spacious padding.{/snippet}
		</Card>
	</div>
</Story>

<Story name="Link Card" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<Card href="#grafana" variant="primary">
			{#snippet heading()}Grafana{/snippet}
			{#snippet description()}Monitoring & Observability{/snippet}
		</Card>
		<Card href="#argocd" variant="tertiary">
			{#snippet heading()}Argo CD{/snippet}
			{#snippet description()}GitOps Continuous Delivery{/snippet}
		</Card>
		<Card href="#vault" variant="quiet">
			{#snippet heading()}Vault{/snippet}
			{#snippet description()}Secrets Management{/snippet}
		</Card>
	</div>
</Story>

<Story name="With Preview" asChild>
	<div style="width: 280px;">
		<Card href="#workspace-dev" variant="primary">
			{#snippet preview()}
				<div
					style="height: 120px; background: linear-gradient(135deg, var(--accent-background-color-default), var(--informative-background-color-default));"
				></div>
			{/snippet}
			{#snippet heading()}Workspace: dev{/snippet}
			{#snippet description()}Running · 2 pods · 512Mi{/snippet}
		</Card>
	</div>
</Story>

<Story name="With Footer" asChild>
	<div style="width: 320px;">
		<Card variant="primary">
			{#snippet heading()}Notification Settings{/snippet}
			{#snippet description()}Manage how you receive notifications for workspace events.{/snippet}
			{#snippet footer()}
				<Button variant="secondary" treatment="outline" size="s">Cancel</Button>
				<Button variant="accent" size="s">Save</Button>
			{/snippet}
		</Card>
	</div>
</Story>

<Story name="Density" asChild>
	<div style="display: flex; flex-direction: column; gap: var(--space-4); width: 320px;">
		<Card density="compact">
			{#snippet heading()}Compact{/snippet}
			{#snippet description()}Tighter internal spacing.{/snippet}
		</Card>
		<Card density="regular">
			{#snippet heading()}Regular{/snippet}
			{#snippet description()}Default density.{/snippet}
		</Card>
		<Card density="spacious">
			{#snippet heading()}Spacious{/snippet}
			{#snippet description()}More breathing room.{/snippet}
		</Card>
	</div>
</Story>
