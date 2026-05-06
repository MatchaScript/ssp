<script lang="ts">
	import type { DialogHeroProps } from './types.js';

	let { children, ...restProps }: DialogHeroProps = $props();
</script>

<div {...restProps} data-spectrum-dialog-hero>
	{@render children?.()}
</div>

<style>
	[data-spectrum-dialog-hero] {
		width: 100%;
		height: 140px;
		flex-shrink: 0;
		overflow: hidden;
	}

	[data-spectrum-dialog-hero] :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
