<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Divider } from '../divider/index.js';
	import { setMenuSectionContext } from './menu.svelte.js';

	const sectionId = $props.id();

	let {
		children,
		...restProps
	}: {
		children: Snippet;
		[key: string]: unknown;
	} = $props();

	const headingId = `menu-section-heading-${sectionId}`;

	setMenuSectionContext({ headingId });
</script>

<!--
  S2 renders a Divider after every MenuSection and hides it via :last-child
  so adjacent sections are visually separated without the consumer wiring up
  manual MenuDividers. We rely on display: contents on the section so both
  the section's children and the trailing auto-divider become direct grid
  items of the parent menu — that keeps :last-child evaluating against the
  menu's child list, which is what we want.
-->
<div role="group" aria-labelledby={headingId} data-spectrum-menu-section {...restProps}>
	{@render children()}
</div>
<div data-spectrum-menu-auto-divider aria-hidden="true">
	<Divider size="m" />
</div>

<style>
	[data-spectrum-menu-section] {
		display: contents;
	}

	[data-spectrum-menu-auto-divider] {
		grid-column: 2 / -2;
		display: block;
		margin-block: var(--spacing-75);
	}

	/* Last section in the menu doesn't need a trailing rule. */
	[data-spectrum-menu-auto-divider]:last-child {
		display: none;
	}
</style>
