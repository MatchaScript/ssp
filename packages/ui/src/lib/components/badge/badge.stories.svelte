<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from './badge.svelte';
	import {
		Icon,
		Check,
		AlertTriangle,
		AlertCircle,
		CheckCircle,
		Star,
		Zap
	} from '$lib/components/icon';
	import { Text } from '$lib/components/text';

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
		<Badge {...args}><Text>Badge</Text></Badge>
	{/snippet}
</Story>

<Story name="Semantic variants" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent"><Text>Accent</Text></Badge>
		<Badge variant="informative"><Text>Informative</Text></Badge>
		<Badge variant="neutral"><Text>Neutral</Text></Badge>
		<Badge variant="positive"><Text>Positive</Text></Badge>
		<Badge variant="notice"><Text>Notice</Text></Badge>
		<Badge variant="negative"><Text>Negative</Text></Badge>
	</div>
</Story>

<Story name="Subtle fill" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent" fillStyle="subtle"><Text>Accent</Text></Badge>
		<Badge variant="informative" fillStyle="subtle"><Text>Informative</Text></Badge>
		<Badge variant="positive" fillStyle="subtle"><Text>Positive</Text></Badge>
		<Badge variant="notice" fillStyle="subtle"><Text>Notice</Text></Badge>
		<Badge variant="negative" fillStyle="subtle"><Text>Negative</Text></Badge>
	</div>
</Story>

<Story name="Outline fill" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent" fillStyle="outline"><Text>Accent</Text></Badge>
		<Badge variant="informative" fillStyle="outline"><Text>Informative</Text></Badge>
		<Badge variant="neutral" fillStyle="outline"><Text>Neutral</Text></Badge>
		<Badge variant="positive" fillStyle="outline"><Text>Positive</Text></Badge>
		<Badge variant="notice" fillStyle="outline"><Text>Notice</Text></Badge>
		<Badge variant="negative" fillStyle="outline"><Text>Negative</Text></Badge>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="accent" size="S"><Text>Small</Text></Badge>
		<Badge variant="accent" size="M"><Text>Medium</Text></Badge>
		<Badge variant="accent" size="L"><Text>Large</Text></Badge>
		<Badge variant="accent" size="XL"><Text>Extra large</Text></Badge>
	</div>
</Story>

<Story name="With icon" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
		<Badge variant="positive">
			<Icon icon={CheckCircle} />
			<Text>Approved</Text>
		</Badge>
		<Badge variant="notice">
			<Icon icon={AlertTriangle} />
			<Text>Pending review</Text>
		</Badge>
		<Badge variant="negative">
			<Icon icon={AlertCircle} />
			<Text>Blocked</Text>
		</Badge>
		<Badge variant="informative">
			<Icon icon={Zap} />
			<Text>Beta</Text>
		</Badge>
	</div>
</Story>

<Story name="Color palette — bold" asChild>
	<div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; max-width: 640px;">
		<Badge variant="red"><Text>Red</Text></Badge>
		<Badge variant="orange"><Text>Orange</Text></Badge>
		<Badge variant="yellow"><Text>Yellow</Text></Badge>
		<Badge variant="chartreuse"><Text>Chartreuse</Text></Badge>
		<Badge variant="celery"><Text>Celery</Text></Badge>
		<Badge variant="green"><Text>Green</Text></Badge>
		<Badge variant="seafoam"><Text>Seafoam</Text></Badge>
		<Badge variant="cyan"><Text>Cyan</Text></Badge>
		<Badge variant="blue"><Text>Blue</Text></Badge>
		<Badge variant="indigo"><Text>Indigo</Text></Badge>
		<Badge variant="purple"><Text>Purple</Text></Badge>
		<Badge variant="fuchsia"><Text>Fuchsia</Text></Badge>
		<Badge variant="magenta"><Text>Magenta</Text></Badge>
		<Badge variant="gray"><Text>Gray</Text></Badge>
	</div>
</Story>

<Story name="Numeric counts" asChild>
	<div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
		<Badge variant="negative" size="S"><Text>3</Text></Badge>
		<Badge variant="informative" size="S"><Text>12</Text></Badge>
		<Badge variant="neutral" size="S"><Text>99+</Text></Badge>
		<Badge variant="accent" size="M"><Text>New</Text></Badge>
		<Badge variant="positive" size="M">
			<Icon icon={Check} />
			<Text>42</Text>
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
				<Icon icon={Star} />
				<Text>Pro</Text>
			</Badge>
		</div>
		<div style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			Real-time visitor metrics and conversion funnels.
		</div>
	</div>
</Story>
