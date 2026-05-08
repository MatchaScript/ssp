<script lang="ts">
	import { TagGroup } from '$lib/index.js';
	import type { TagGroupSelectionMode } from './types.js';

	interface HarnessItem {
		id: string;
		label: string;
		href?: string;
	}

	let {
		items,
		selectionMode = 'none',
		onRemove
	}: {
		items: HarnessItem[];
		selectionMode?: TagGroupSelectionMode;
		onRemove?: (keys: Set<string>) => void;
	} = $props();
</script>

<TagGroup.Root {selectionMode} {onRemove}>
	{#each items as item (item.id)}
		<TagGroup.Item id={item.id} href={item.href}>{item.label}</TagGroup.Item>
	{/each}
</TagGroup.Root>
