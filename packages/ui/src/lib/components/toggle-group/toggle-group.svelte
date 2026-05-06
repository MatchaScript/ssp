<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
	import type { ToggleGroupRootProps } from './types.js';
	import { ToggleGroupState, setToggleGroupContext } from './toggle-group.svelte.js';

	let {
		children,
		selectionMode = 'single',
		value = $bindable([]),
		onValueChange,
		size = 'm',
		density = 'regular',
		orientation = 'horizontal',
		isQuiet = false,
		isJustified = false,
		isDisabled = false,
		isEmphasized = false,
		staticColor,
		ref = $bindable(null),
		class: className,
		...restProps
	}: ToggleGroupRootProps = $props();

	setToggleGroupContext(
		new ToggleGroupState({
			get size() {
				return size;
			},
			get density() {
				return density;
			},
			get orientation() {
				return orientation;
			},
			get isQuiet() {
				return isQuiet;
			},
			get isJustified() {
				return isJustified;
			},
			get isDisabled() {
				return isDisabled;
			},
			get isEmphasized() {
				return isEmphasized;
			},
			get staticColor() {
				return staticColor;
			}
		})
	);

	function handleSingleChange(next: string) {
		const arr = next ? [next] : [];
		value = arr;
		onValueChange?.(arr);
	}

	function handleMultipleChange(next: string[]) {
		value = next;
		onValueChange?.(next);
	}
</script>

{#snippet body(props: Record<string, unknown>)}
	<div
		{...restProps}
		{...props}
		bind:this={ref}
		class={className}
		data-spectrum-togglegroup
		data-orientation={orientation}
		data-size={size}
		data-density={density}
		data-quiet={isQuiet || undefined}
		data-justified={isJustified || undefined}
	>
		{@render children?.()}
	</div>
{/snippet}

{#if selectionMode === 'single'}
	<ToggleGroupPrimitive.Root
		type="single"
		value={value[0] ?? ''}
		onValueChange={handleSingleChange}
		disabled={isDisabled}
		{orientation}
	>
		{#snippet child({ props })}
			{@render body(props)}
		{/snippet}
	</ToggleGroupPrimitive.Root>
{:else}
	<ToggleGroupPrimitive.Root
		type="multiple"
		{value}
		onValueChange={handleMultipleChange}
		disabled={isDisabled}
		{orientation}
	>
		{#snippet child({ props })}
			{@render body(props)}
		{/snippet}
	</ToggleGroupPrimitive.Root>
{/if}

<style>
	[data-spectrum-togglegroup] {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
	}

	[data-spectrum-togglegroup][data-orientation='vertical'] {
		flex-direction: column;
	}

	/* gap: density × size, mirroring RSP S2 actionGroupStyle */
	[data-spectrum-togglegroup][data-density='compact'] {
		gap: 2px;
	}
	[data-spectrum-togglegroup][data-density='regular'][data-size='xs'],
	[data-spectrum-togglegroup][data-density='regular'][data-size='s'] {
		gap: var(--spacing-100);
	}
	[data-spectrum-togglegroup][data-density='regular'][data-size='m'],
	[data-spectrum-togglegroup][data-density='regular'][data-size='l'],
	[data-spectrum-togglegroup][data-density='regular'][data-size='xl'] {
		gap: var(--spacing-200);
	}
</style>
