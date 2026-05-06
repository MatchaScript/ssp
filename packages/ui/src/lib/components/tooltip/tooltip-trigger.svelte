<script lang="ts">
	import type { TooltipTriggerProps } from './types.js';
	import { getTooltipContext } from './tooltip.svelte.js';
	import { Tooltip } from 'bits-ui';

	let { child: renderTrigger }: TooltipTriggerProps = $props();

	const state = getTooltipContext();
</script>

<Tooltip.Trigger>
	{#snippet child({ props })}
		{@render renderTrigger({
			props: {
				...props,
				style: [props.style, `anchor-name: ${state.anchorId}`].filter(Boolean).join('; ')
			}
		})}
	{/snippet}
</Tooltip.Trigger>
