<script lang="ts">
	import { Toolbar } from 'bits-ui';
	import { actionButtonSnippet } from '../action-button/action-button-base.svelte';
	import type { ActionButtonGroupItemProps } from './types.js';
	import { getActionButtonGroupContext } from './action-button-group.svelte.js';

	let {
		href,
		type = 'button',
		children,
		icon,
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

	let iconOnly = $derived(!!icon && !children);
</script>

{#snippet body(extraProps: Record<string, unknown>)}
	{@render actionButtonSnippet({
		bitsProps: extraProps,
		restProps,
		setRef: (el) => (ref = el),
		href,
		type,
		disabled: resolvedDisabled,
		size: resolvedSize,
		isQuiet: resolvedIsQuiet,
		staticColor: resolvedStaticColor,
		density: group.density,
		groupOrientation: group.orientation,
		isJustified: group.isJustified,
		className,
		icon,
		label: children,
		iconOnly
	})}
{/snippet}

{#if href}
	<Toolbar.Link>
		{#snippet child({ props })}
			{@render body(props)}
		{/snippet}
	</Toolbar.Link>
{:else}
	<Toolbar.Button disabled={resolvedDisabled}>
		{#snippet child({ props })}
			{@render body(props)}
		{/snippet}
	</Toolbar.Button>
{/if}
