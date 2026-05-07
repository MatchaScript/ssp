<script lang="ts">
	import ActionButtonBase from './action-button-base.svelte';
	import type { ActionButtonRootProps } from './types.js';

	let {
		href,
		type = 'button',
		children,
		disabled = false,
		ref = $bindable(null),
		size = 'm',
		isQuiet = false,
		staticColor,
		class: className,
		...restProps
	}: ActionButtonRootProps = $props();
</script>

<ActionButtonBase
	{restProps}
	setRef={(el) => (ref = el)}
	{href}
	{type}
	{disabled}
	{size}
	{isQuiet}
	{staticColor}
	{className}
	{children}
/>
