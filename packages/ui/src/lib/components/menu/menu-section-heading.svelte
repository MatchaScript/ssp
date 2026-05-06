<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getMenuContext, getMenuSectionContext } from './menu.svelte.js';

	let {
		children,
		...restProps
	}: {
		children: Snippet;
		[key: string]: unknown;
	} = $props();

	const menuState = getMenuContext();
	const sectionCtx = getMenuSectionContext();
</script>

<!--
  S2 anatomy: an outer Header carries the cell layout (grid column,
  controlSize-driven min-height, vertical centering), and an inner Heading
  is the bold text element. Splitting these mirrors @react-spectrum/s2
  (`sectionHeader` + `sectionHeading`) and lets each concern be styled
  independently.
-->
<div data-spectrum-menu-section-header data-size={menuState.size}>
	<h3
		id={sectionCtx.headingId}
		data-spectrum-menu-section-heading
		data-size={menuState.size}
		{...restProps}
	>
		{@render children()}
	</h3>
</div>

<style>
	[data-spectrum-menu-section-header] {
		grid-column: 2 / -2;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		color: var(--neutral-content-color-default);
		cursor: default;
	}

	/* min-height tracks S2 controlSize so the header cell visually matches
	   a sibling MenuItem at the same size. */
	[data-spectrum-menu-section-header][data-size='s'] {
		min-height: var(--spacing-400);
	}
	[data-spectrum-menu-section-header][data-size='m'] {
		min-height: var(--spacing-500);
	}
	[data-spectrum-menu-section-header][data-size='l'] {
		min-height: var(--spacing-600);
	}
	[data-spectrum-menu-section-header][data-size='xl'] {
		min-height: 48px;
	}

	[data-spectrum-menu-section-heading] {
		margin: 0;
		font-family: inherit;
		font-weight: 700;
		color: inherit;
	}

	[data-spectrum-menu-section-heading][data-size='s'] {
		font-size: var(--text-75);
	}
	[data-spectrum-menu-section-heading][data-size='m'] {
		font-size: var(--text-100);
	}
	[data-spectrum-menu-section-heading][data-size='l'] {
		font-size: var(--text-200);
	}
	[data-spectrum-menu-section-heading][data-size='xl'] {
		font-size: var(--text-300);
	}
</style>
