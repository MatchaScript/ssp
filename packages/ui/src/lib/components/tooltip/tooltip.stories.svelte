<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Tooltip from './index.js';
	import Button from '$lib/components/button/button.svelte';
	import ActionButton from '$lib/components/action-button/action-button.svelte';
	import { Icon, Settings, Trash2, Pin } from '$lib/components/icon';

	const { Story } = defineMeta({
		title: 'Components/Tooltip',
		component: Tooltip.Root,
		tags: ['autodocs'],
		argTypes: {
			placement: {
				control: { type: 'inline-radio' },
				options: ['top', 'bottom', 'left', 'right']
			},
			variant: {
				control: { type: 'inline-radio' },
				options: ['neutral', 'informative', 'negative']
			},
			hasIcon: { control: 'boolean' },
			maxWidth: { control: 'number' },
			shouldFlip: { control: 'boolean' },
			offset: { control: 'number' },
			delayDuration: { control: 'number' }
		},
		args: {
			placement: 'top',
			variant: 'neutral',
			hasIcon: false,
			maxWidth: 160,
			shouldFlip: true,
			offset: 4,
			delayDuration: 700
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="display: flex; align-items: center; justify-content: center; padding: 120px;">
			<Tooltip.Root
				placement={args.placement}
				variant={args.variant}
				hasIcon={args.hasIcon}
				maxWidth={args.maxWidth}
				shouldFlip={args.shouldFlip}
				offset={args.offset}
				delayDuration={args.delayDuration}
			>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="primary">Hover me</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="Press to activate this control" />
			</Tooltip.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic">
	{#snippet template()}
		<div style="display: flex; justify-content: center; padding: 120px;">
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Save</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="Write current state to disk" />
			</Tooltip.Root>
		</div>
	{/snippet}
</Story>

<Story name="Placements">
	{#snippet template()}
		<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 80px; padding: 120px;">
			{#each ['top', 'bottom', 'left', 'right'] as const as placement (placement)}
				<div style="display: flex; justify-content: center;">
					<Tooltip.Root {placement} delayDuration={200}>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button {...props}>{placement}</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content label="Tooltip on {placement}" />
					</Tooltip.Root>
				</div>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="Variants">
	{#snippet template()}
		<div style="display: flex; gap: 24px; padding: 120px; justify-content: center;">
			<Tooltip.Root variant="neutral" delayDuration={200}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Neutral</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="Neutral tone for most cases" />
			</Tooltip.Root>

			<Tooltip.Root variant="informative" hasIcon delayDuration={200}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="primary">Informative</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="Extra context about a setting" />
			</Tooltip.Root>

			<Tooltip.Root variant="negative" hasIcon delayDuration={200}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="negative">Negative</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="This action cannot be undone" />
			</Tooltip.Root>
		</div>
	{/snippet}
</Story>

<Story name="On ActionButton (icon-only)">
	{#snippet template()}
		<div style="display: flex; gap: 12px; padding: 120px; justify-content: center;">
			<Tooltip.Root delayDuration={200}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<ActionButton {...props} aria-label="Settings">
							<Icon icon={Settings} />
						</ActionButton>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="Settings" />
			</Tooltip.Root>

			<Tooltip.Root delayDuration={200}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<ActionButton {...props} aria-label="Pin">
							<Icon icon={Pin} />
						</ActionButton>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="Pin to top" />
			</Tooltip.Root>

			<Tooltip.Root variant="negative" hasIcon delayDuration={200}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<ActionButton {...props} aria-label="Delete">
							<Icon icon={Trash2} />
						</ActionButton>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="Permanently delete" />
			</Tooltip.Root>
		</div>
	{/snippet}
</Story>

<Story name="Long text">
	{#snippet template()}
		<div style="display: flex; justify-content: center; padding: 120px;">
			<Tooltip.Root maxWidth={240} delayDuration={200}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props}>What is this?</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content
					label="A longer explanation wraps to multiple lines once it reaches the configured max-width."
				/>
			</Tooltip.Root>
		</div>
	{/snippet}
</Story>

<Story name="Instant (no delay)">
	{#snippet template()}
		<div style="display: flex; justify-content: center; padding: 120px;">
			<Tooltip.Root delayDuration={0}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Shows instantly</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content label="delayDuration = 0" />
			</Tooltip.Root>
		</div>
	{/snippet}
</Story>
