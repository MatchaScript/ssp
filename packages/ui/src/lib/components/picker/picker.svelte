<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PickerState, setPickerContext } from './picker.svelte.js';
	import { Select } from 'bits-ui';

	let {
		selectedKey = $bindable(undefined),
		label = undefined,
		selectionMode = 'single',
		isDisabled = false,
		isQuiet = false,
		isInvalid = false,
		size = 'm',
		onSelectionChange,
		children
	}: {
		selectedKey?: string | string[];
		/** Display label shown in the trigger. Falls back to raw selectedKey if omitted. */
		label?: string;
		selectionMode?: 'single' | 'multiple';
		isDisabled?: boolean;
		isQuiet?: boolean;
		isInvalid?: boolean;
		size?: 's' | 'm' | 'l' | 'xl';
		onSelectionChange?: (key: string | string[]) => void;
		children: Snippet;
	} = $props();

	const id = $props.id();
	const anchorId = `--spectrum-picker-${id}`;

	let pickerState = new PickerState({
		get selectedKey() {
			return selectedKey;
		},
		get label() {
			return label;
		},
		get selectionMode() {
			return selectionMode;
		},
		get isDisabled() {
			return isDisabled;
		},
		get isQuiet() {
			return isQuiet;
		},
		get isInvalid() {
			return isInvalid;
		},
		get size() {
			return size;
		},
		get anchorId() {
			return anchorId;
		}
	});

	setPickerContext(pickerState);
</script>

{#snippet content()}
	<div
		data-spectrum-picker-root
		data-size={size ?? 'm'}
		data-quiet={isQuiet || undefined}
		data-invalid={isInvalid || undefined}
	>
		{@render children()}
	</div>
{/snippet}

{#if selectionMode === 'multiple'}
	<Select.Root
		value={selectedKey as string[]}
		onValueChange={(v) => {
			selectedKey = v;
			onSelectionChange?.(v);
		}}
		disabled={pickerState.isDisabled}
		type="multiple"
	>
		{@render content()}
	</Select.Root>
{:else}
	<Select.Root
		value={selectedKey as string}
		onValueChange={(v) => {
			selectedKey = v;
			onSelectionChange?.(v);
		}}
		disabled={pickerState.isDisabled}
		type="single"
	>
		{@render content()}
	</Select.Root>
{/if}

<style>
	[data-spectrum-picker-root] {
		font-family: var(--font-sans);
	}
</style>
