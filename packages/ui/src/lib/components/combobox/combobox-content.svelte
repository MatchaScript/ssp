<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getComboboxContext } from './combobox.svelte.js';
	import { Combobox } from 'bits-ui';

	let {
		children,
		class: className = '',
		style: styleProp = '',
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'style'> & {
		children: Snippet;
		class?: string;
		style?: string;
	} = $props();
	const state = getComboboxContext();
</script>

<Combobox.ContentStatic forceMount={false}>
	{#snippet child({ props })}
		<div
			{...props}
			{...rest}
			class={className}
			style="position-anchor: {state.anchorId}; {styleProp}"
			data-spectrum-combobox-content
			data-size={state.size}
		>
			{@render children()}
		</div>
	{/snippet}
</Combobox.ContentStatic>

<style>
	[data-spectrum-combobox-content] {
		/* CSS Anchor positioning: ties directly to the trigger's anchor-name */
		position: absolute;
		/* position-anchor is set via inline style dynamically */
		position-area: bottom;
		position-try-fallbacks: flip-block;
		margin: var(--spacing-50) 0;
		/* Box visual styles */
		background-color: var(--background-layer-2-color);
		/* Match S2 Popover border outline */
		border: var(--border-width-100) solid var(--popover-border-color);
		border-radius: var(--corner-radius-medium-default);
		box-shadow: var(--drop-shadow-elevated);
		padding: var(--spacing-100);
		gap: 0;
		/* Grid ensures children align */
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		width: anchor-size(width); /* strictly match trigger/input width */
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		box-sizing: border-box;
	}
</style>
