<script lang="ts">
	import * as ListView from './index.js';
	import type { ListViewSelectionMode, ListViewSelectionStyle } from './types.js';

	let {
		items = ['a', 'b', 'c', 'd'],
		disabledKeys = new Set<string>(),
		selectionMode = 'single',
		selectionStyle = 'highlight'
	}: {
		items?: string[];
		disabledKeys?: Set<string>;
		selectionMode?: ListViewSelectionMode;
		selectionStyle?: ListViewSelectionStyle;
	} = $props();
</script>

<ListView.Root aria-label="roving" {selectionMode} {selectionStyle} {disabledKeys}>
	{#each items as key (key)}
		<ListView.Item {key}>{key}</ListView.Item>
	{/each}
</ListView.Root>
