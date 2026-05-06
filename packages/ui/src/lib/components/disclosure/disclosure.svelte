<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Divider } from '$lib/components/divider';
	import {
		DisclosureState,
		setDisclosureContext,
		type DisclosureSize,
		type DisclosureDensity
	} from './disclosure.svelte.js';

	let {
		ref = $bindable(null),
		children,
		size = 'm',
		density = 'regular',
		isQuiet = false,
		isDisabled = false,
		open = false,
		onOpenChange,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: Snippet;
		size?: DisclosureSize;
		density?: DisclosureDensity;
		isQuiet?: boolean;
		isDisabled?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	const state = new DisclosureState({
		get size() {
			return size;
		},
		get density() {
			return density;
		},
		get isQuiet() {
			return isQuiet;
		},
		get isDisabled() {
			return isDisabled;
		}
	});

	setDisclosureContext(state);
</script>

<div
	bind:this={ref}
	{...restProps}
	class={className}
	data-spectrum-disclosure
	data-size={size}
	data-density={density}
	data-quiet={isQuiet || undefined}
>
	<details
		{open}
		ontoggle={(e) => {
			const isOpen = (e as ToggleEvent).newState === 'open';
			onOpenChange?.(isOpen);
		}}
	>
		{@render children?.()}
	</details>
	{#if !isQuiet}
		<Divider size="s" />
	{/if}
</div>

<style>
	[data-spectrum-disclosure] {
		display: grid;
		width: 100%;
	}

	details {
		interpolate-size: allow-keywords;
	}

	details::details-content {
		overflow: hidden;
		height: 0;
		transition:
			height var(--duration-fast) var(--ease-default),
			content-visibility var(--duration-fast) var(--ease-default) allow-discrete;
	}

	details[open]::details-content {
		height: auto;
	}
</style>
