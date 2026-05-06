<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SegmentedControl, SegmentedControlItem } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/SegmentedControl',
		component: SegmentedControl,
		tags: ['autodocs'],
		argTypes: {
			isDisabled: { control: 'boolean' },
			isJustified: { control: 'boolean' }
		},
		args: {
			isDisabled: false,
			isJustified: false
		}
	});
</script>

<script lang="ts">
	import { Icon, LayoutDashboard, Layers, ChartSpline, Menu } from '$lib/components/icon';

	let view = $state('grid');
	let range = $state('week');
</script>

<Story name="Example">
	{#snippet template(args)}
		<SegmentedControl
			aria-label="Timeframe"
			defaultSelectedKey="week"
			isDisabled={args.isDisabled}
			isJustified={args.isJustified}
		>
			<SegmentedControlItem id="day">Day</SegmentedControlItem>
			<SegmentedControlItem id="week">Week</SegmentedControlItem>
			<SegmentedControlItem id="month">Month</SegmentedControlItem>
			<SegmentedControlItem id="year">Year</SegmentedControlItem>
		</SegmentedControl>
	{/snippet}
</Story>

<Story name="Controlled view switcher" asChild>
	<div style="display: flex; flex-direction: column; gap: 8px;">
		<SegmentedControl aria-label="View" selectedKey={view} onSelectionChange={(id) => (view = id)}>
			<SegmentedControlItem id="grid">
				{#snippet icon()}<Icon icon={LayoutDashboard} size="m" />{/snippet}
				Grid
			</SegmentedControlItem>
			<SegmentedControlItem id="list">
				{#snippet icon()}<Icon icon={Menu} size="m" />{/snippet}
				List
			</SegmentedControlItem>
			<SegmentedControlItem id="timeline">
				{#snippet icon()}<Icon icon={ChartSpline} size="m" />{/snippet}
				Timeline
			</SegmentedControlItem>
		</SegmentedControl>
		<span style="color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);">
			selectedKey: {view}
		</span>
	</div>
</Story>

<Story name="Icon only" asChild>
	<SegmentedControl aria-label="Layout" defaultSelectedKey="grid">
		<SegmentedControlItem id="grid" aria-label="Grid">
			{#snippet icon()}<Icon icon={LayoutDashboard} size="m" />{/snippet}
		</SegmentedControlItem>
		<SegmentedControlItem id="layers" aria-label="Layers">
			{#snippet icon()}<Icon icon={Layers} size="m" />{/snippet}
		</SegmentedControlItem>
		<SegmentedControlItem id="list" aria-label="List">
			{#snippet icon()}<Icon icon={Menu} size="m" />{/snippet}
		</SegmentedControlItem>
	</SegmentedControl>
</Story>

<Story name="Justified (fill width)" asChild>
	<div style="width: 420px;">
		<SegmentedControl
			aria-label="Range"
			isJustified
			selectedKey={range}
			onSelectionChange={(id) => (range = id)}
		>
			<SegmentedControlItem id="day">Day</SegmentedControlItem>
			<SegmentedControlItem id="week">Week</SegmentedControlItem>
			<SegmentedControlItem id="month">Month</SegmentedControlItem>
			<SegmentedControlItem id="quarter">Quarter</SegmentedControlItem>
			<SegmentedControlItem id="year">Year</SegmentedControlItem>
		</SegmentedControl>
	</div>
</Story>

<Story name="With per-item disabled" asChild>
	<SegmentedControl aria-label="Plan" defaultSelectedKey="free">
		<SegmentedControlItem id="free">Free</SegmentedControlItem>
		<SegmentedControlItem id="pro">Pro</SegmentedControlItem>
		<SegmentedControlItem id="enterprise" isDisabled>Enterprise</SegmentedControlItem>
	</SegmentedControl>
</Story>

<Story name="Disabled whole control" asChild>
	<SegmentedControl aria-label="Timeframe" defaultSelectedKey="week" isDisabled>
		<SegmentedControlItem id="day">Day</SegmentedControlItem>
		<SegmentedControlItem id="week">Week</SegmentedControlItem>
		<SegmentedControlItem id="month">Month</SegmentedControlItem>
	</SegmentedControl>
</Story>
