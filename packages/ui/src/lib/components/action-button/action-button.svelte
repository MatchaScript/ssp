<script lang="ts">
	import { actionButtonSnippet } from './action-button-base.svelte';
	import type { ActionButtonRootProps } from './types.js';

	let {
		href,
		type = 'button',
		children,
		icon,
		disabled = false,
		ref = $bindable(null),
		size = 'm',
		isQuiet = false,
		staticColor,
		class: className,
		...restProps
	}: ActionButtonRootProps = $props();

	let iconOnly = $derived(!!icon && !children);
</script>

{@render actionButtonSnippet({
	restProps,
	setRef: (el) => (ref = el),
	href,
	type,
	disabled,
	size,
	isQuiet,
	staticColor,
	className,
	icon,
	label: children,
	iconOnly
})}
