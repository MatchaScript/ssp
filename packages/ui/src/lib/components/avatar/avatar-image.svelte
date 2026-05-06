<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import type { AvatarImageProps } from './types.js';

	let {
		src,
		alt = '',
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarImageProps = $props();
</script>

{#snippet ImageElement({ props }: { props: Record<string, unknown> })}
	<img {...props} {src} {alt} class={className} data-spectrum-avatar-image />
{/snippet}

<AvatarPrimitive.Image {...restProps} {src} {alt} bind:ref child={ImageElement} />

<style>
	[data-spectrum-avatar-image] {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
	}
</style>
