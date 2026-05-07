<script lang="ts">
	import { Toolbar } from 'bits-ui';
	import ActionButtonBase from '../action-button/action-button-base.svelte';
	import type { ActionButtonGroupItemProps } from './types.js';
	import { getActionButtonGroupContext } from './action-button-group.svelte.js';

	let {
		href,
		type = 'button',
		children,
		disabled,
		ref = $bindable(null),
		size,
		isQuiet,
		staticColor,
		class: className,
		...restProps
	}: ActionButtonGroupItemProps = $props();

	const group = getActionButtonGroupContext();

	let resolvedSize = $derived(size ?? group.size);
	let resolvedIsQuiet = $derived(isQuiet ?? group.isQuiet);
	let resolvedDisabled = $derived(disabled ?? group.isDisabled);
	let resolvedStaticColor = $derived(staticColor ?? group.staticColor);
</script>

{#if href}
	<Toolbar.Link>
		{#snippet child({ props })}
			<ActionButtonBase
				bitsProps={props}
				{restProps}
				setRef={(el) => (ref = el)}
				{href}
				{type}
				disabled={resolvedDisabled}
				size={resolvedSize}
				isQuiet={resolvedIsQuiet}
				staticColor={resolvedStaticColor}
				density={group.density}
				groupOrientation={group.orientation}
				isJustified={group.isJustified}
				{className}
				{children}
			/>
		{/snippet}
	</Toolbar.Link>
{:else}
	<Toolbar.Button disabled={resolvedDisabled}>
		{#snippet child({ props })}
			<ActionButtonBase
				bitsProps={props}
				{restProps}
				setRef={(el) => (ref = el)}
				{href}
				{type}
				disabled={resolvedDisabled}
				size={resolvedSize}
				isQuiet={resolvedIsQuiet}
				staticColor={resolvedStaticColor}
				density={group.density}
				groupOrientation={group.orientation}
				isJustified={group.isJustified}
				{className}
				{children}
			/>
		{/snippet}
	</Toolbar.Button>
{/if}
