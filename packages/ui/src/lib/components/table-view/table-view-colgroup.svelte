<script lang="ts">
	import { getTableContext } from './state/context.js';
	import { SELECTION_COLUMN_ID } from './state/table-state.svelte.js';

	// Renders a <colgroup> chain. Every column — including the synthetic
	// selection column when selection is on — is a layout column, so each <col>
	// reads its pixel width from TableColumnLayoutState and the widths sum to
	// the measured table width. The colgroup must be the first child of <table>
	// per HTML spec, before <thead>.
	const tableState = getTableContext();
	const showCheckboxColumn = $derived(tableState.selectionMode !== 'none');
</script>

<colgroup>
	{#if showCheckboxColumn}
		{@const w = tableState.columnWidth(SELECTION_COLUMN_ID)}
		<col data-spectrum-table-view-checkbox-col style:width={w > 0 ? `${w}px` : undefined} />
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
