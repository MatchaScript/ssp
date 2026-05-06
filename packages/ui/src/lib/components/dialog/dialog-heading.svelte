<script lang="ts">
	import type { DialogHeadingProps } from './types.js';
	import { getDialogContext } from './dialog.svelte.js';

	let { children, level = 2, ...restProps }: DialogHeadingProps = $props();

	const id = $props.id();
	const state = getDialogContext();
	state.headingId = id;
</script>

<svelte:element this={`h${level}`} {id} {...restProps} data-spectrum-dialog-heading>
	{@render children?.()}
</svelte:element>

<style>
	[data-spectrum-dialog-heading] {
		margin: 0;
		padding: var(--spacing-500) var(--spacing-500) 0;
		font-size: var(--text-500);
		font-weight: 700;
		line-height: var(--lh-heading);
		color: var(--neutral-content-color-default);
	}
</style>
