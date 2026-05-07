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
	import { Text } from '$lib/components/text';

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
			<SegmentedControlItem id="day"><Text>Day</Text></SegmentedControlItem>
			<SegmentedControlItem id="week"><Text>Week</Text></SegmentedControlItem>
			<SegmentedControlItem id="month"><Text>Month</Text></SegmentedControlItem>
			<SegmentedControlItem id="year"><Text>Year</Text></SegmentedControlItem>
		</SegmentedControl>
	{/snippet}
</Story>

<Story name="Controlled view switcher" asChild>
	<div style="display: flex; flex-direction: column; gap: 8px;">
		<SegmentedControl aria-label="View" selectedKey={view} onSelectionChange={(id) => (view = id)}>
			<SegmentedControlItem id="grid">
				<Icon icon={LayoutDashboard} />
				<Text>Grid</Text>
			</SegmentedControlItem>
			<SegmentedControlItem id="list">
				<Icon icon={Menu} />
				<Text>List</Text>
			</SegmentedControlItem>
			<SegmentedControlItem id="timeline">
				<Icon icon={ChartSpline} />
				<Text>Timeline</Text>
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
			<Icon icon={LayoutDashboard} />
		</SegmentedControlItem>
		<SegmentedControlItem id="layers" aria-label="Layers">
			<Icon icon={Layers} />
		</SegmentedControlItem>
		<SegmentedControlItem id="list" aria-label="List">
			<Icon icon={Menu} />
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
			<SegmentedControlItem id="day"><Text>Day</Text></SegmentedControlItem>
			<SegmentedControlItem id="week"><Text>Week</Text></SegmentedControlItem>
			<SegmentedControlItem id="month"><Text>Month</Text></SegmentedControlItem>
			<SegmentedControlItem id="quarter"><Text>Quarter</Text></SegmentedControlItem>
			<SegmentedControlItem id="year"><Text>Year</Text></SegmentedControlItem>
		</SegmentedControl>
	</div>
</Story>

<Story name="With per-item disabled" asChild>
	<SegmentedControl aria-label="Plan" defaultSelectedKey="free">
		<SegmentedControlItem id="free"><Text>Free</Text></SegmentedControlItem>
		<SegmentedControlItem id="pro"><Text>Pro</Text></SegmentedControlItem>
		<SegmentedControlItem id="enterprise" isDisabled><Text>Enterprise</Text></SegmentedControlItem>
	</SegmentedControl>
</Story>

<Story name="Disabled whole control" asChild>
	<SegmentedControl aria-label="Timeframe" defaultSelectedKey="week" isDisabled>
		<SegmentedControlItem id="day"><Text>Day</Text></SegmentedControlItem>
		<SegmentedControlItem id="week"><Text>Week</Text></SegmentedControlItem>
		<SegmentedControlItem id="month"><Text>Month</Text></SegmentedControlItem>
	</SegmentedControl>
</Story>
