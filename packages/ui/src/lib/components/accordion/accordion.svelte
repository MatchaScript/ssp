<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Accordion } from 'bits-ui';
	import {
		AccordionState,
		setAccordionContext,
		type AccordionSize,
		type AccordionDensity
	} from './accordion.svelte.js';

	let {
		ref = $bindable(null),
		children,
		type = 'single',
		value = $bindable(type === 'single' ? '' : []),
		onValueChange,
		size = 'm',
		density = 'regular',
		isQuiet = false,
		isDisabled = false,
		orientation = 'vertical',
		loop = true,
		class: className,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children: Snippet;
		type?: 'single' | 'multiple';
		value?: string | string[];
		onValueChange?: (value: string | string[]) => void;
		size?: AccordionSize;
		density?: AccordionDensity;
		isQuiet?: boolean;
		isDisabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		loop?: boolean;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	const state = new AccordionState({
		get size() {
			return size;
		},
		get density() {
			return density;
		},
		get isQuiet() {
			return isQuiet;
		}
	});

	setAccordionContext(state);
</script>

{#snippet content()}
	<div
		data-spectrum-accordion
		data-size={size}
		data-density={density}
		data-quiet={isQuiet || undefined}
		class={className}
		{...restProps}
	>
		{@render children()}
	</div>
{/snippet}

{#if type === 'multiple'}
	<Accordion.Root
		bind:ref
		type="multiple"
		value={value as string[]}
		onValueChange={(v) => {
			value = v;
			onValueChange?.(v);
		}}
		disabled={isDisabled}
		{orientation}
		{loop}
	>
		{@render content()}
	</Accordion.Root>
{:else}
	<Accordion.Root
		bind:ref
		type="single"
		value={value as string}
		onValueChange={(v) => {
			value = v;
			onValueChange?.(v);
		}}
		disabled={isDisabled}
		{orientation}
		{loop}
	>
		{@render content()}
	</Accordion.Root>
{/if}

<style>
	[data-spectrum-accordion] {
		display: grid;
		width: 100%;
		min-width: 200px;
	}
</style>
