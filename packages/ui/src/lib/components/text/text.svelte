<script lang="ts">
	import type { TextProps } from './types.js';

	let { children, class: className, ...rest }: TextProps = $props();
</script>

<span {...rest} class={className} data-spectrum-text>
	{@render children?.()}
</span>

<style>
	[data-spectrum-text] {
		display: inline-block;
		min-width: 0;
	}
</style>
