<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SvelteSet } from 'svelte/reactivity';
	import * as SelectBoxGroup from './index.js';
	import { Icon, Cpu, Database, Server, HardDrive, Globe, ChartSpline } from '../icon/index.js';

	const { Story } = defineMeta({
		title: 'Components/SelectBoxGroup',
		component: SelectBoxGroup.Root,
		tags: ['autodocs'],
		argTypes: {
			selectionMode: {
				control: { type: 'inline-radio' },
				options: ['single', 'multiple']
			},
			orientation: {
				control: { type: 'inline-radio' },
				options: ['vertical', 'horizontal']
			},
			isDisabled: { control: 'boolean' }
		},
		args: {
			selectionMode: 'single',
			orientation: 'vertical',
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	let selected = $state<Set<string>>(new SvelteSet(['compute']));
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="max-width: 720px;">
			<SelectBoxGroup.Root
				aria-label="Resource type"
				selectionMode={args.selectionMode}
				orientation={args.orientation}
				isDisabled={args.isDisabled}
				bind:selectedKeys={selected}
			>
				<SelectBoxGroup.Item key="compute" description="Virtual machines and containers">
					{#snippet illustration()}
						<Icon icon={Cpu} size="l" />
					{/snippet}
					Compute
				</SelectBoxGroup.Item>
				<SelectBoxGroup.Item key="storage" description="Object and block storage">
					{#snippet illustration()}
						<Icon icon={HardDrive} size="l" />
					{/snippet}
					Storage
				</SelectBoxGroup.Item>
				<SelectBoxGroup.Item key="database" description="Managed SQL and NoSQL">
					{#snippet illustration()}
						<Icon icon={Database} size="l" />
					{/snippet}
					Database
				</SelectBoxGroup.Item>
				<SelectBoxGroup.Item key="network" description="VPCs and load balancers" isDisabled>
					{#snippet illustration()}
						<Icon icon={Globe} size="l" />
					{/snippet}
					Network
				</SelectBoxGroup.Item>
			</SelectBoxGroup.Root>
		</div>
	{/snippet}
</Story>

<Story name="Vertical (single)" asChild>
	<div style="max-width: 600px;">
		<SelectBoxGroup.Root aria-label="Plan" selectionMode="single">
			<SelectBoxGroup.Item key="basic">
				{#snippet illustration()}
					<Icon icon={Server} size="l" />
				{/snippet}
				Basic
			</SelectBoxGroup.Item>
			<SelectBoxGroup.Item key="pro">
				{#snippet illustration()}
					<Icon icon={Server} size="l" />
				{/snippet}
				Pro
			</SelectBoxGroup.Item>
			<SelectBoxGroup.Item key="enterprise">
				{#snippet illustration()}
					<Icon icon={Database} size="l" />
				{/snippet}
				Enterprise
			</SelectBoxGroup.Item>
		</SelectBoxGroup.Root>
	</div>
</Story>

<Story name="Horizontal (multiple)" asChild>
	<div style="max-width: 800px;">
		<SelectBoxGroup.Root
			aria-label="Add-ons"
			selectionMode="multiple"
			orientation="horizontal"
			defaultSelectedKeys={new SvelteSet(['cdn'])}
		>
			<SelectBoxGroup.Item key="cdn" description="Edge caching for static assets">
				{#snippet illustration()}
					<Icon icon={Globe} size="l" />
				{/snippet}
				CDN
			</SelectBoxGroup.Item>
			<SelectBoxGroup.Item key="backup" description="Daily snapshots, 30-day retention">
				{#snippet illustration()}
					<Icon icon={HardDrive} size="l" />
				{/snippet}
				Backup
			</SelectBoxGroup.Item>
			<SelectBoxGroup.Item key="monitoring" description="Real-time metrics and alerts">
				{#snippet illustration()}
					<Icon icon={ChartSpline} size="l" />
				{/snippet}
				Monitoring
			</SelectBoxGroup.Item>
		</SelectBoxGroup.Root>
	</div>
</Story>
