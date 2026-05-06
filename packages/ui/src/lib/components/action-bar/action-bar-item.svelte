<script lang="ts">
	import type { ActionBarItemProps } from './types.js';
	import ActionButton from '../action-button/action-button.svelte';
	import { getActionBarContext } from './action-bar.svelte.js';
	import { Toolbar } from 'bits-ui';

	let {
		children,
		icon,
		disabled = false,
		ref = $bindable(null),
		...restProps
	}: ActionBarItemProps = $props();

	const state = getActionBarContext();
</script>

<Toolbar.Button {disabled}>
	{#snippet child({ props })}
		<ActionButton
			{...restProps}
			{...props}
			bind:ref
			isQuiet
			staticColor={state.isEmphasized ? 'auto' : undefined}
			{disabled}
			{icon}
			{children}
		/>
	{/snippet}
</Toolbar.Button>
