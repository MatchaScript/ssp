<script lang="ts">
	import { TagGroup } from '$lib/index.js';
	import type { TagGroupSelectionMode } from './types.js';

	interface HarnessItem {
		id: string;
		label: string;
		isDisabled?: boolean;
	}

	let {
		items,
		selectionMode = 'none',
		disabledKeys,
		onRemove
	}: {
		items: HarnessItem[];
		selectionMode?: TagGroupSelectionMode;
		disabledKeys?: Set<string>;
		onRemove?: (keys: Set<string>) => void;
	} = $props();
</script>

<TagGroup.Root aria-label="Tags" {selectionMode} {disabledKeys} {onRemove}>
	{#each items as item (item.id)}
		<TagGroup.Item id={item.id} isDisabled={item.isDisabled}>{item.label}</TagGroup.Item>
	{/each}
</TagGroup.Root>
