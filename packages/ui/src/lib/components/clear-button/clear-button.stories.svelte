<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ClearButton } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/ClearButton',
		component: ClearButton,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'inline-radio' }, options: ['xs', 's', 'm', 'l', 'xl'] },
			isDisabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			isDisabled: false,
			'aria-label': 'Clear'
		}
	});
</script>

<!--
	ClearButton is `height: 100%` (S2 `height: 'full'`) — it always fills the
	parent control's inner area. Stories therefore wrap it in a flex container
	with a known height so the button has something to fill.
-->
<Story name="Example">
	{#snippet template(args)}
		<div style="display: inline-flex; align-items: center; height: 32px;">
			<ClearButton {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; align-items: stretch; gap: 16px;">
		<div style="display: inline-flex; align-items: center; height: 16px;">
			<ClearButton size="xs" aria-label="Clear" />
		</div>
		<div style="display: inline-flex; align-items: center; height: 24px;">
			<ClearButton size="s" aria-label="Clear" />
		</div>
		<div style="display: inline-flex; align-items: center; height: 32px;">
			<ClearButton size="m" aria-label="Clear" />
		</div>
		<div style="display: inline-flex; align-items: center; height: 40px;">
			<ClearButton size="l" aria-label="Clear" />
		</div>
		<div style="display: inline-flex; align-items: center; height: 48px;">
			<ClearButton size="xl" aria-label="Clear" />
		</div>
	</div>
</Story>

<Story name="On colored backgrounds" asChild>
	<!-- Demonstrates that color: inherit / currentcolor adapts to context.
	     This is exactly how the Tag emphasized+selected state uses it. -->
	<div style="display: flex; gap: 12px;">
		<div
			style="display: inline-flex; align-items: center; gap: 6px; padding-inline-start: 12px; height: 32px; border-radius: 8px; background: var(--neutral-background-color-selected-default); color: var(--background-base-color);"
		>
			Selected
			<ClearButton size="m" aria-label="Remove" />
		</div>
		<div
			style="display: inline-flex; align-items: center; gap: 6px; padding-inline-start: 12px; height: 32px; border-radius: 8px; background: var(--accent-background-color-default); color: white;"
		>
			Emphasized
			<ClearButton size="m" aria-label="Remove" />
		</div>
		<div
			style="display: inline-flex; align-items: center; gap: 6px; padding-inline-start: 12px; height: 32px; border-radius: 8px; background: var(--gray-100); color: var(--neutral-content-color-default);"
		>
			Default
			<ClearButton size="m" aria-label="Remove" />
		</div>
	</div>
</Story>

<Story name="Disabled">
	{#snippet template(args)}
		<div style="display: inline-flex; align-items: center; height: 32px;">
			<ClearButton {...args} isDisabled />
		</div>
	{/snippet}
</Story>
