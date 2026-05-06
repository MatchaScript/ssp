<script lang="ts">
	import type { DialogBodyProps } from './types.js';

	let { children, class: className, style: styleProp, ...restProps }: DialogBodyProps = $props();
</script>

<div {...restProps} class={className} style={styleProp} data-spectrum-dialog-body>
	{@render children?.()}
</div>

<style>
	[data-spectrum-dialog-body] {
		flex: 1 1 auto;
		overflow-y: auto;
		padding: var(--spacing-300) var(--spacing-500);
		font-size: var(--text-200);
		line-height: var(--lh-body);
		color: var(--neutral-content-color-default);
	}
</style>
