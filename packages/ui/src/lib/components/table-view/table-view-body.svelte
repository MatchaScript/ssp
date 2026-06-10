<script lang="ts">
	import type { TableViewBodyProps } from './types.js';
	import { getTableContext } from './state/context.js';

	let { children }: TableViewBodyProps = $props();

	const tableState = getTableContext();
	let ref: HTMLTableSectionElement | null = $state(null);

	// Wire the `<tbody>` into TableState so it can observe row reordering. A
	// keyed `{#each}` moves `<tr>` nodes on a consumer sort without
	// re-registering them; the observer is what keeps the canonical row order
	// (DOM order) fresh. Effects don't run on the server, so the observe is
	// browser-only and disconnects on unmount.
	$effect(() => {
		if (!ref) return;
		return tableState.registerBody(ref);
	});
</script>

<!-- Inside `role="grid"`, AT support is more reliable when row groups are
     marked explicitly (matches RAC / Adobe React Spectrum). -->
<!-- svelte-ignore a11y_no_redundant_roles -->
<tbody bind:this={ref} role="rowgroup" data-spectrum-table-view-body>
	{@render children?.()}
</tbody>
