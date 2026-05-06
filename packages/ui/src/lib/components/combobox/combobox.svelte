<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ComboboxState, setComboboxContext } from './combobox.svelte.js';
	import { Combobox } from 'bits-ui';

	let {
		selectedKey = $bindable(undefined),
		isDisabled = false,
		isQuiet = false,
		isInvalid = false,
		size = 'm',
		onSelectionChange,
		children
	}: {
		selectedKey?: string;
		isDisabled?: boolean;
		isQuiet?: boolean;
		isInvalid?: boolean;
		size?: 's' | 'm' | 'l' | 'xl';
		onSelectionChange?: (key: string) => void;
		children: Snippet;
	} = $props();

	const id = $props.id();
	const anchorId = `--spectrum-combobox-${id}`;

	let comboboxState = new ComboboxState({
		get selectedKey() {
			return selectedKey;
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

	setComboboxContext(comboboxState);
</script>

<Combobox.Root
	value={selectedKey}
	onValueChange={(v) => {
		selectedKey = v;
		onSelectionChange?.(v);
	}}
	disabled={comboboxState.isDisabled}
	type="single"
>
	<div
		data-spectrum-combobox-root
		data-size={size ?? 'm'}
		data-quiet={isQuiet || undefined}
		data-invalid={isInvalid || undefined}
	>
		{@render children()}
	</div>
</Combobox.Root>

<style>
	[data-spectrum-combobox-root] {
		font-family: var(--font-sans);
		display: inline-flex;
		flex-direction: column;
	}
</style>
