<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
	import ActionButtonBase from '../action-button/action-button-base.svelte';
	import type { ToggleGroupItemProps } from './types.js';
	import { getToggleGroupContext } from './toggle-group.svelte.js';

	let {
		children,
		icon,
		value,
		isDisabled = false,
		ref = $bindable(null),
		class: className,
		...restProps
	}: ToggleGroupItemProps = $props();

	const group = getToggleGroupContext();

	let iconOnly = $derived(!!icon && !children);
</script>

<ToggleGroupPrimitive.Item {value} disabled={isDisabled || group.isDisabled}>
	{#snippet child({ props, pressed })}
		<ActionButtonBase
			bitsProps={props}
			{restProps}
			setRef={(el) => (ref = el)}
			type="button"
			disabled={isDisabled || group.isDisabled}
			isSelected={pressed}
			isEmphasized={group.isEmphasized}
			size={group.size}
			isQuiet={group.isQuiet}
			staticColor={group.staticColor}
			density={group.density}
			groupOrientation={group.orientation}
			isJustified={group.isJustified}
			{className}
			{icon}
			label={children}
			{iconOnly}
		/>
	{/snippet}
</ToggleGroupPrimitive.Item>
