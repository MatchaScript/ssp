<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { SelectBoxGroupProps } from './types.js';
	import { SelectBoxGroupState, setSelectBoxGroupContext } from './select-box-group.svelte.js';

	let {
		selectionMode = 'single',
		orientation = 'vertical',
		isDisabled = false,
		selectedKeys = $bindable(undefined),
		defaultSelectedKeys,
		onSelectionChange,
		disabledKeys = new Set<string>(),
		children,
		class: className,
		...restProps
	}: SelectBoxGroupProps = $props();

	// svelte-ignore state_referenced_locally
	let internalSelectedKeys = new SvelteSet<string>(defaultSelectedKeys ?? []);
	let effectiveSelectedKeys = $derived(selectedKeys ?? internalSelectedKeys);

	let focusedKey = $state<string | null>(null);
	let orderedKeys = $state<string[]>([]);
	let groupRef: HTMLDivElement | undefined = $state();

	function registerKey(key: string) {
		if (!orderedKeys.includes(key)) {
			orderedKeys = [...orderedKeys, key];
		}
	}

	function unregisterKey(key: string) {
		orderedKeys = orderedKeys.filter((k) => k !== key);
	}

	function commitSelection(next: Set<string>) {
		internalSelectedKeys.clear();
		for (const k of next) internalSelectedKeys.add(k);
		selectedKeys = new SvelteSet(next);
		onSelectionChange?.(new SvelteSet(next));
	}

	function toggleSelection(key: string) {
		const next = new SvelteSet(effectiveSelectedKeys);
		if (selectionMode === 'single') {
			if (next.has(key)) {
				// keep at least nothing — clicking selected single deselects
				next.delete(key);
			} else {
				next.clear();
				next.add(key);
			}
		} else {
			if (next.has(key)) next.delete(key);
			else next.add(key);
		}
		commitSelection(next);
	}

	function setFocusedKey(key: string | null) {
		focusedKey = key;
	}

	const groupState = new SelectBoxGroupState({
		get selectionMode() {
			return selectionMode;
		},
		get orientation() {
			return orientation;
		},
		get selectedKeys() {
			return effectiveSelectedKeys;
		},
		get disabledKeys() {
			return disabledKeys;
		},
		get isDisabled() {
			return isDisabled;
		},
		get focusedKey() {
			return focusedKey;
		},
		toggleSelection,
		setFocusedKey,
		registerKey,
		unregisterKey
	});

	setSelectBoxGroupContext(groupState);

	function getItemElements(): HTMLElement[] {
		if (!groupRef) return [];
		return Array.from(
			groupRef.querySelectorAll<HTMLElement>('[data-spectrum-select-box]:not([data-disabled])')
		);
	}

	function focusItem(el: HTMLElement | undefined) {
		if (!el) return;
		const key = el.dataset.key!;
		setFocusedKey(key);
		el.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isDisabled) return;
		const items = getItemElements();
		if (items.length === 0) return;

		const currentIndex = items.findIndex((el) => el.dataset.key === focusedKey);

		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				e.preventDefault();
				focusItem(items[Math.min(items.length - 1, Math.max(0, currentIndex) + 1)]);
				return;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				focusItem(items[Math.max(0, (currentIndex < 0 ? 0 : currentIndex) - 1)]);
				return;
			case 'Home':
				e.preventDefault();
				focusItem(items[0]);
				return;
			case 'End':
				e.preventDefault();
				focusItem(items[items.length - 1]);
				return;
			case ' ':
			case 'Enter':
				e.preventDefault();
				if (focusedKey && !groupState.isItemDisabled(focusedKey)) {
					toggleSelection(focusedKey);
				}
				return;
			case 'a':
				if ((e.metaKey || e.ctrlKey) && selectionMode === 'multiple') {
					e.preventDefault();
					const all = new SvelteSet(items.map((el) => el.dataset.key!));
					commitSelection(all);
				}
				return;
		}
	}

	function handleFocusIn() {
		if (focusedKey) return;
		const items = getItemElements();
		if (items.length > 0) focusItem(items[0]);
	}
</script>

<div
	bind:this={groupRef}
	role="listbox"
	aria-multiselectable={selectionMode === 'multiple' || undefined}
	aria-disabled={isDisabled || undefined}
	aria-orientation={orientation}
	data-spectrum-select-box-group
	data-orientation={orientation}
	data-disabled={isDisabled || undefined}
	data-selection-mode={selectionMode}
	class={className}
	tabindex={isDisabled ? -1 : 0}
	onkeydown={handleKeydown}
	onfocusin={handleFocusIn}
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	[data-spectrum-select-box-group] {
		display: grid;
		grid-auto-rows: 1fr;
		gap: var(--spacing-300);
		justify-content: center;
		box-sizing: border-box;
		font-family: var(--font-sans);
		outline: none;

		--select-box-group-min-width: 144px;
		--select-box-group-max-width: 170px;

		grid-template-columns: repeat(
			auto-fit,
			minmax(var(--select-box-group-min-width), min(var(--select-box-group-max-width), 100%))
		);
	}

	[data-spectrum-select-box-group][data-orientation='horizontal'] {
		--select-box-group-min-width: 188px;
		--select-box-group-max-width: 368px;
	}

	[data-spectrum-select-box-group][data-disabled] {
		cursor: default;
	}

	[data-spectrum-select-box-group]:focus-visible {
		outline: none;
	}
</style>
