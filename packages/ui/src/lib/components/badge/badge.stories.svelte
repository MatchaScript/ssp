<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from './badge.svelte';
	import { Icon, Check, AlertTriangle, AlertCircle, CheckCircle, Star, Zap } from '$lib/components/icon';

	const { Story } = defineMeta({
		title: 'Components/Badge',
		component: Badge,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: [
					'accent',
					'informative',
					'neutral',
					'positive',
					'notice',
					'negative',
					'red',
					'orange',
					'yellow',
					'chartreuse',
					'celery',
					'green',
					'seafoam',
					'cyan',
					'blue',
					'indigo',
					'purple',
					'fuchsia',
					'magenta',
					'gray'
				]
			},
			size: {
				control: { type: 'inline-radio' },
				options: ['S', 'M', 'L', 'XL']
			},
			fillStyle: {
				control: { type: 'inline-radio' },
				options: ['bold', 'subtle', 'outline']
			}
		},
		args: {
			variant: 'accent',
			size: 'M',
			fillStyle: 'bold'
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<Badge {...args}>Badge</Badge>
	{/snippet}
</Story>

<Story name="Semantic variants" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent">Accent</Badge>
		<Badge variant="informative">Informative</Badge>
		<Badge variant="neutral">Neutral</Badge>
		<Badge variant="positive">Positive</Badge>
		<Badge variant="notice">Notice</Badge>
		<Badge variant="negative">Negative</Badge>
	</div>
</Story>

<Story name="Subtle fill" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent" fillStyle="subtle">Accent</Badge>
		<Badge variant="informative" fillStyle="subtle">Informative</Badge>
		<Badge variant="positive" fillStyle="subtle">Positive</Badge>
		<Badge variant="notice" fillStyle="subtle">Notice</Badge>
		<Badge variant="negative" fillStyle="subtle">Negative</Badge>
	</div>
</Story>

<Story name="Outline fill" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent" fillStyle="outline">Accent</Badge>
		<Badge variant="informative" fillStyle="outline">Informative</Badge>
		<Badge variant="neutral" fillStyle="outline">Neutral</Badge>
		<Badge variant="positive" fillStyle="outline">Positive</Badge>
		<Badge variant="notice" fillStyle="outline">Notice</Badge>
		<Badge variant="negative" fillStyle="outline">Negative</Badge>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent" size="S">Small</Badge>
		<Badge variant="accent" size="M">Medium</Badge>
		<Badge variant="accent" size="L">Large</Badge>
		<Badge variant="accent" size="XL">Extra large</Badge>
	</div>
</Story>

<Story name="With icon" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="positive">
			{#snippet icon()}<Icon icon={CheckCircle} size="s" />{/snippet}
			Approved
		</Badge>
		<Badge variant="notice">
			{#snippet icon()}<Icon icon={AlertTriangle} size="s" />{/snippet}
			Pending review
		</Badge>
		<Badge variant="negative">
			{#snippet icon()}<Icon icon={AlertCircle} size="s" />{/snippet}
			Blocked
		</Badge>
		<Badge variant="informative">
			{#snippet icon()}<Icon icon={Zap} size="s" />{/snippet}
			Beta
		</Badge>
	</div>
</Story>

<Story name="Color palette — bold" asChild>
	<div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; max-width: 640px;">
		<Badge variant="red">Red</Badge>
		<Badge variant="orange">Orange</Badge>
		<Badge variant="yellow">Yellow</Badge>
		<Badge variant="chartreuse">Chartreuse</Badge>
		<Badge variant="celery">Celery</Badge>
		<Badge variant="green">Green</Badge>
		<Badge variant="seafoam">Seafoam</Badge>
		<Badge variant="cyan">Cyan</Badge>
		<Badge variant="blue">Blue</Badge>
		<Badge variant="indigo">Indigo</Badge>
		<Badge variant="purple">Purple</Badge>
		<Badge variant="fuchsia">Fuchsia</Badge>
		<Badge variant="magenta">Magenta</Badge>
		<Badge variant="gray">Gray</Badge>
	</div>
</Story>

<Story name="Numeric counts" asChild>
	<div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
		<Badge variant="negative" size="S">3</Badge>
		<Badge variant="informative" size="S">12</Badge>
		<Badge variant="neutral" size="S">99+</Badge>
		<Badge variant="accent" size="M">New</Badge>
		<Badge variant="positive" size="M">
			{#snippet icon()}<Icon icon={Check} size="s" />{/snippet}
			42
		</Badge>
	</div>
</Story>

<Story name="In card header" asChild>
	<div
		style="width: 320px; padding: 16px; background: var(--background-layer-1-color); border-radius: 8px; display: flex; flex-direction: column; gap: 8px;"
	>
		<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
			<strong>Analytics dashboard</strong>
			<Badge variant="accent" size="S" fillStyle="subtle">
				{#snippet icon()}<Icon icon={Star} size="s" />{/snippet}
				Pro
			</Badge>
		</div>
		<div style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			Real-time visitor metrics and conversion funnels.
		</div>
	</div>
</Story>
