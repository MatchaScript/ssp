<script lang="ts">
	import { Toolbar } from 'bits-ui';
	import type { ActionButtonGroupRootProps } from './types.js';
	import {
		ActionButtonGroupState,
		setActionButtonGroupContext
	} from './action-button-group.svelte.js';

	let {
		children,
		size = 'm',
		density = 'regular',
		orientation = 'horizontal',
		isQuiet = false,
		isJustified = false,
		isDisabled = false,
		staticColor,
		ref = $bindable(null),
		...restProps
	}: ActionButtonGroupRootProps = $props();

	setActionButtonGroupContext(
		new ActionButtonGroupState({
			get size() {
				return size;
			},
			get density() {
				return density;
			},
			get orientation() {
				return orientation;
			},
			get isQuiet() {
				return isQuiet;
			},
			get isJustified() {
				return isJustified;
			},
			get isDisabled() {
				return isDisabled;
			},
			get staticColor() {
				return staticColor;
			}
		})
	);
</script>

<Toolbar.Root {orientation}>
	{#snippet child({ props })}
		<div
			{...restProps}
			{...props}
			bind:this={ref}
			data-spectrum-actionbutton-group
			data-orientation={orientation}
			data-size={size}
			data-density={density}
			data-quiet={isQuiet || undefined}
			data-justified={isJustified || undefined}
		>
			{@render children?.()}
		</div>
	{/snippet}
</Toolbar.Root>

<style>
	[data-spectrum-actionbutton-group] {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
	}

	[data-spectrum-actionbutton-group][data-orientation='vertical'] {
		flex-direction: column;
	}

	/* gap: density × size, mirroring RSP S2 actionGroupStyle */
	[data-spectrum-actionbutton-group][data-density='compact'] {
		gap: 2px;
	}
	[data-spectrum-actionbutton-group][data-density='regular'][data-size='xs'],
	[data-spectrum-actionbutton-group][data-density='regular'][data-size='s'] {
		gap: var(--spacing-100);
	}
	[data-spectrum-actionbutton-group][data-density='regular'][data-size='m'],
	[data-spectrum-actionbutton-group][data-density='regular'][data-size='l'],
	[data-spectrum-actionbutton-group][data-density='regular'][data-size='xl'] {
		gap: var(--spacing-200);
	}

	/* Note: justified flex:1 is applied by ActionButton itself
	   via group context, since Svelte scoped CSS can't reach
	   into a child component's element. */
</style>
