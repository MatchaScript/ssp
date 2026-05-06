<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import type { AvatarRootProps } from './types.js';

	let {
		size = 24,
		isOverBackground = false,
		children,
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarRootProps = $props();
</script>

{#snippet RootElement({ props }: { props: Record<string, unknown> })}
	<div
		{...props}
		class={className}
		role={(props.role as string) || restProps.role || 'img'}
		data-spectrum-avatar
		data-is-over-background={isOverBackground || undefined}
		data-is-large={size >= 64 || undefined}
		style="--custom-size: {size}px; {props.style ?? ''}"
	>
		{@render children?.()}
	</div>
{/snippet}

<AvatarPrimitive.Root {...restProps} bind:ref child={RootElement} />

<style>
	[data-spectrum-avatar] {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--corner-radius-full);
		flex-shrink: 0;
		flex-grow: 0;
		width: var(--custom-size);
		height: var(--custom-size);
	}

	[data-spectrum-avatar][data-is-over-background] {
		outline-style: solid;
		outline-color: var(--background-base-color);
		outline-width: var(--border-width-200);
	}

	[data-spectrum-avatar][data-is-large][data-is-over-background] {
		outline-width: var(--border-width-400);
	}
</style>
