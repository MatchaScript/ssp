<script lang="ts">
	import { getTableContext } from './state/context.js';

	// Renders a <colgroup> chain. The checkbox column is fixed-width and
	// hardcoded against the --table-view-checkbox-col-width CSS variable; user
	// columns read their pixel width from TableColumnLayoutState. The colgroup
	// must be the first child of <table> per HTML spec, before <thead>.
	const tableState = getTableContext();
	const showCheckboxColumn = $derived(tableState.selectionMode !== 'none');
</script>

<colgroup>
	{#if showCheckboxColumn}
		<col data-spectrum-table-view-checkbox-col />
	{/if}
	{#each tableState.visibleColumns as col (col.id)}
		{@const w = tableState.columnWidth(col.id)}
		<col
			data-spectrum-table-view-col
			data-column-id={col.id}
			style:width={w > 0 ? `${w}px` : undefined}
		/>
	{/each}
</colgroup>

<style>
	[data-spectrum-table-view-checkbox-col] {
		width: var(--table-view-checkbox-col-width, 40px);
	}
</style>
