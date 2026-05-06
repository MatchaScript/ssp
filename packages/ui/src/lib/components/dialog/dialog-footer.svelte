<script lang="ts">
	import type { DialogFooterProps } from './types.js';

	let { children, ...restProps }: DialogFooterProps = $props();
</script>

<footer {...restProps} data-spectrum-dialog-footer>
	{@render children?.()}
</footer>

<style>
	[data-spectrum-dialog-footer] {
		display: flex;
		align-items: center;
		gap: var(--spacing-400);
		flex-wrap: wrap;
		padding: 0 var(--spacing-500) var(--spacing-500);
	}

	[data-spectrum-dialog-footer] :global([data-spectrum-button-group]) {
		margin-inline-start: auto;
	}
</style>
