<script lang="ts">
	import { untrack } from 'svelte';
	import type { TableViewHeaderProps } from './types.js';
	import { getTableContext } from './state/context.js';
	import { SELECTION_COLUMN_ID } from './state/table-state.svelte.js';
	import { CheckboxBox } from '../checkbox/index.js';

	let { children }: TableViewHeaderProps = $props();

	const tableState = getTableContext();

	const showCheckboxColumn = $derived(tableState.selectionMode !== 'none');

	// The selection column header is part of the keyboard nav as the leftmost
	// column. Register its element so 2D nav (ArrowLeft/Right between headers,
	// ArrowDown into the per-row checkbox cell) can target it.
	let checkboxRef: HTMLTableCellElement | null = $state(null);
	$effect(() => {
		const el = checkboxRef;
		if (!el || !showCheckboxColumn) return;
		return untrack(() => tableState.registerColumnHeader(SELECTION_COLUMN_ID, el));
	});

	const isCheckboxHeaderFocused = $derived(
		tableState.isColumnHeaderFocused(SELECTION_COLUMN_ID)
	);

	function handleCheckboxClick() {
		if (tableState.selectionMode === 'multiple') tableState.toggleSelectAll();
	}

	function handleCheckboxKeydown(e: KeyboardEvent) {
		if (e.target !== e.currentTarget) return;
		tableState.handleColumnHeaderKeyDown(e, SELECTION_COLUMN_ID);
	}
</script>

<!-- Explicit row-group / row roles inside `role="grid"` for AT consistency. -->
<!-- svelte-ignore a11y_no_redundant_roles -->
<thead role="rowgroup">
	<!-- svelte-ignore a11y_no_redundant_roles -->
	<tr role="row" data-spectrum-table-view-header-row aria-rowindex={1}>
		{#if showCheckboxColumn}
			<!-- Selection column header. Always focusable in cell-mode (RAC parity:
			     it's a real columnheader for nav purposes even in single-select
			     mode where it has no select-all action). Single-mode keeps
			     `role="presentation"` so AT doesn't announce it as a real column,
			     but the focus stop is still useful for keyboard exploration. -->
			<th
				bind:this={checkboxRef}
				data-spectrum-table-view-checkbox-header
				data-focused={isCheckboxHeaderFocused || undefined}
				role={tableState.selectionMode === 'multiple' ? 'columnheader' : 'presentation'}
				aria-colindex={1}
				aria-label={tableState.selectionMode === 'multiple' ? 'Select all' : undefined}
				tabindex={isCheckboxHeaderFocused ? 0 : -1}
				onclick={tableState.selectionMode === 'multiple' ? handleCheckboxClick : undefined}
				onkeydown={handleCheckboxKeydown}
			>
				{#if tableState.selectionMode === 'multiple'}
					<CheckboxBox
						checked={tableState.isAllSelected}
						indeterminate={tableState.isSomeSelected}
						isDisabled={tableState.isDisabled}
						size="s"
					/>
				{/if}
			</th>
		{/if}
		{@render children()}
	</tr>
</thead>

<style>
	[data-spectrum-table-view-header-row] {
		/* S2: header height is fixed at 32px (component-height-100 / medium scale),
		   independent of density. Density only affects body row heights. */
		height: 32px;
		/* S2: gray-75 (lighter than gray-100) matches the reference implementation. */
		background: var(--gray-75);
		border-top: var(--_table-header-top-border-width, 0px) solid var(--gray-300);
		border-bottom: 1px solid var(--gray-300);
	}

	[data-spectrum-table-view-checkbox-header] {
		width: 40px;
		padding: 0;
		vertical-align: middle;
		text-align: center;
		/* Cell-mode focus stop. Suppress UA outline; we paint our own ring. */
		outline: none;
		position: relative;
	}

</style>
