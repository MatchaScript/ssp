<script lang="ts">
	import { Toggle } from 'bits-ui';
	import ActionButtonBase from '../action-button/action-button-base.svelte';
	import type { ToggleButtonRootProps } from './types.js';

	let {
		children,
		disabled = false,
		isSelected = $bindable(false),
		isEmphasized = false,
		size = 'm',
		isQuiet = false,
		staticColor,
		ref = $bindable(null),
		class: className,
		onPressedChange,
		...restProps
	}: ToggleButtonRootProps = $props();

	function handlePressedChange(pressed: boolean) {
		isSelected = pressed;
		onPressedChange?.(pressed);
	}
</script>

<Toggle.Root pressed={isSelected} {disabled} onPressedChange={handlePressedChange}>
	{#snippet child({ props })}
		<ActionButtonBase
			bitsProps={props}
			{restProps}
			setRef={(el) => (ref = el)}
			type="button"
			{disabled}
			{isSelected}
			{isEmphasized}
			{size}
			{isQuiet}
			{staticColor}
			{className}
			{children}
		/>
	{/snippet}
</Toggle.Root>
