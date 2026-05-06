<script lang="ts">
	import { getPickerContext } from './picker.svelte.js';
	import { Select } from 'bits-ui';

	let { children, class: className = '', style: styleProp = '', ...rest } = $props();
	const state = getPickerContext();
</script>

<Select.ContentStatic forceMount={false}>
	{#snippet child({ props })}
		<div
			{...props}
			{...rest}
			class={className}
			style="position-anchor: {state.anchorId}; {styleProp}"
			data-spectrum-picker-content
			data-size={state.size}
		>
			{@render children()}
		</div>
	{/snippet}
</Select.ContentStatic>

<style>
	[data-spectrum-picker-content] {
		/* CSS Anchor positioning: ties directly to the trigger's anchor-name */
		position: fixed;
		/* position-anchor is set via inline style dynamically */
		position-area: bottom;
		position-try-fallbacks: flip-block;
		margin: var(--spacing-100) 0;
		/* Box visual styles */
		background-color: var(--background-layer-2-color);
		/* Match S2 Popover border outline */
		border: var(--border-width-100) solid var(--popover-border-color);
		border-radius: var(--corner-radius-medium-default);
		box-shadow: var(--drop-shadow-elevated);
		padding: var(--spacing-100);
		gap: 0;
		/* Grid: checkmark | text(1fr) */
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		width: anchor-size(width); /* strictly match trigger width */
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		box-sizing: border-box;
	}
</style>
