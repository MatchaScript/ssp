<script lang="ts">
	import type { DialogHeaderProps } from './types.js';
	import { getDialogContext } from './dialog.svelte.js';

	let { children, ...restProps }: DialogHeaderProps = $props();

	const id = $props.id();
	const state = getDialogContext();
	state.descriptionId = id;
</script>

<p {id} {...restProps} data-spectrum-dialog-header>
	{@render children?.()}
</p>

<style>
	[data-spectrum-dialog-header] {
		margin: 0;
		padding: var(--spacing-100) var(--spacing-500) 0;
		font-size: var(--text-200);
		line-height: var(--lh-body);
		color: var(--neutral-subdued-content-color-default);
	}
</style>
