<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import type { AvatarFallbackProps } from './types.js';

	let {
		children,
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarFallbackProps = $props();
</script>

{#snippet FallbackElement({ props }: { props: Record<string, unknown> })}
	<div {...props} class={className} data-spectrum-avatar-fallback>
		{@render children?.()}
	</div>
{/snippet}

<AvatarPrimitive.Fallback {...restProps} bind:ref child={FallbackElement} />

<style>
	[data-spectrum-avatar-fallback] {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		border-radius: inherit;
		background-color: var(--neutral-subtle-background-color-default);
		color: var(--neutral-content-color-default);
	}
</style>
