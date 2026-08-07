<script lang="ts" generics="TItem">
	import type { TableViewBodyProps } from './types.js';
	import { getTableContext } from './state/context.js';
	import TableViewRowScope from './table-view-row-scope.svelte';

	let { items, getKey, row }: TableViewBodyProps<TItem> = $props();

	const tableState = getTableContext();

	const keys = $derived(items.map((item, i) => getKey(item, i)));

	// Registered from the component body rather than an `$effect`: the rows are
	// then available as soon as Body renders, without waiting for effects. This
	// array is the row order and the row identity — nothing observes the DOM to
	// work either of them out.
	//
	// It does not make row-dependent output correct on the server. `<TableView.Root>`
	// emits `aria-rowcount` and decides the empty state before it renders
	// children, so on the server it still sees zero rows.
	const release = tableState.setRowSource({
		get keys() {
			return keys;
		}
	});
	// Registration is synchronous; only the release is deferred to an effect.
	// Without it an unmounted Body leaves its keys behind, and the table keeps
	// reporting rows that are no longer in the DOM.
	$effect(() => release);
</script>

<!-- Inside `role="grid"`, AT support is more reliable when row groups are
     marked explicitly (matches RAC / Adobe React Spectrum). -->
<!-- svelte-ignore a11y_no_redundant_roles -->
<tbody role="rowgroup" data-spectrum-table-view-body>
	{#each items as item, i (keys[i])}
		<TableViewRowScope key={keys[i]} index={i}>
			{@render row(item, i)}
		</TableViewRowScope>
	{/each}
</tbody>
