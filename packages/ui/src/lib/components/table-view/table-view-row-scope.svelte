<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getTableContext, setRowScope } from './state/context.js';

	// Establishes row identity for everything the consumer's `row` snippet
	// renders. Emits no DOM of its own: `<tbody>` must have `<tr>` as its direct
	// children, and the snippet is what produces them.
	//
	// It exists so identity lives in exactly one place. `<TableView.Row>` reads
	// it from context, so a snippet that branches between two different `<Row>`
	// markups still describes the same row.
	let { key, index, children }: { key: string; index: number; children: Snippet } = $props();

	const tableState = getTableContext();
	// One read of the table-wide keyboard target per row. Everything below (the
	// `<tr>`, its cells, its checkbox) reads this instead, so a focus move only
	// invalidates the two rows it actually touched.
	const focus = $derived(tableState.rowFocus(key));

	// Getters, not values: `index` changes when the consumer re-sorts without
	// remounting the row, and a value copy would freeze it at mount time.
	setRowScope({
		get key() {
			return key;
		},
		get index() {
			return index;
		},
		get focus() {
			return focus;
		}
	});
</script>

{@render children()}
