<script lang="ts">
	import type { TooltipRootProps } from './types.js';
	import { TooltipState, setTooltipContext } from './tooltip.svelte.js';
	import { Tooltip } from 'bits-ui';

	let {
		placement = 'top',
		variant = 'neutral',
		hasIcon = false,
		maxWidth = 160,
		shouldFlip = true,
		offset = 4,
		delayDuration = 700,
		open = $bindable(false),
		disableHoverableContent = false,
		children
	}: TooltipRootProps = $props();

	const id = $props.id();
	const anchorId = `--spectrum-tooltip-${id}`;

	const tooltipState = new TooltipState({
		get anchorId() {
			return anchorId;
		},
		get placement() {
			return placement;
		},
		get variant() {
			return variant;
		},
		get hasIcon() {
			return hasIcon;
		},
		get maxWidth() {
			return maxWidth;
		},
		get shouldFlip() {
			return shouldFlip;
		},
		get offset() {
			return offset;
		}
	});

	setTooltipContext(tooltipState);
</script>

<Tooltip.Provider {delayDuration}>
	<Tooltip.Root bind:open {disableHoverableContent}>
		{@render children()}
	</Tooltip.Root>
</Tooltip.Provider>
