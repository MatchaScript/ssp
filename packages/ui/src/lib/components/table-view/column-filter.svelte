<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { Button } from '../button/index.js';
	import { TextField } from '../textfield/index.js';
	import { NumberField } from '../number-field/index.js';
	import { Checkbox } from '../checkbox/index.js';
	import type { ColumnFilter } from './types.js';
	import { getTableContext } from './state/context.js';

	// Per-column filter popover. Anchored to the column's `<th>` via CSS
	// anchor positioning so it lines up under the header rather than the
	// (much smaller) chevron button. Keeps an internal draft of the filter
	// inputs so the consumer's `columnFilters` only updates on Apply — typing
	// in the text field shouldn't fire `onColumnFiltersChange` per keystroke.
	let {
		columnId,
		anchorName,
		open = $bindable(false)
	}: {
		columnId: string;
		anchorName: string;
		open?: boolean;
	} = $props();

	const tableState = getTableContext();
	const column = $derived(tableState.getColumn(columnId));
	const filterType = $derived(column?.filterType);
	const enumOptions = $derived(column?.enumOptions ?? []);
	const existingFilter = $derived(tableState.getFilter(columnId));

	// Draft state — initialized from the active filter each time the popover
	// opens. Re-deriving on every `open` flip means the user always sees the
	// "current filter" rather than whatever they typed and abandoned last time.
	let draftText = $state('');
	let draftMin = $state<number | null>(null);
	let draftMax = $state<number | null>(null);
	let draftEnum = $state<Set<string>>(new Set());

	// Track previous open state to detect transitions; using `$effect` to
	// imperatively call showPopover() / hidePopover() on the actual element
	// keeps focus management close to where the popover element lives.
	let popoverEl: HTMLDivElement | null = $state(null);
	let firstFieldEl: HTMLElement | null = $state(null);

	$effect(() => {
		if (!open) {
			popoverEl?.hidePopover();
			return;
		}
		// Snapshot the active filter on the open transition only. Reading
		// `existingFilter` reactively would let an external `columnFilters`
		// update — say, the consumer calling `setColumnFilters` while the
		// user is mid-edit — overwrite the in-progress draft.
		untrack(() => {
			const f = existingFilter;
			if (f?.type === 'text') {
				draftText = f.value;
			} else {
				draftText = '';
			}
			if (f?.type === 'number') {
				draftMin = f.value.min;
				draftMax = f.value.max;
			} else {
				draftMin = null;
				draftMax = null;
			}
			if (f?.type === 'enum') {
				draftEnum = new Set(f.value);
			} else {
				draftEnum = new Set();
			}
		});

		popoverEl?.showPopover();
		// Defer focus until the first field has rendered.
		tick().then(() => firstFieldEl?.focus());
	});

	// Close on outside pointerdown / Escape. The HTML5 popover API gives us
	// `light dismiss` for free with `popover="auto"`, but we use `manual` here
	// so the trigger (the column-menu) controls open state — handle dismissal
	// ourselves to keep parity with how Menu does it.
	$effect(() => {
		if (!open) return;
		function handlePointerDown(e: PointerEvent) {
			const target = e.target as Node;
			if (popoverEl?.contains(target)) return;
			open = false;
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.stopPropagation();
				open = false;
			}
		}
		// `pointerdown` capture so we close before child popovers (column menu)
		// see the click and react to it. Without capture the menu would close
		// on the same click and re-open into a focus-trap fight.
		document.addEventListener('pointerdown', handlePointerDown, true);
		document.addEventListener('keydown', handleKey);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown, true);
			document.removeEventListener('keydown', handleKey);
		};
	});

	function buildFilter(): ColumnFilter | undefined {
		if (filterType === 'text') {
			return { column: columnId, type: 'text', operator: 'contains', value: draftText };
		}
		if (filterType === 'number') {
			return {
				column: columnId,
				type: 'number',
				operator: 'between',
				value: { min: draftMin, max: draftMax }
			};
		}
		if (filterType === 'enum') {
			return {
				column: columnId,
				type: 'enum',
				operator: 'in',
				value: [...draftEnum]
			};
		}
		return undefined;
	}

	function apply() {
		const filter = buildFilter();
		const wasFiltered = tableState.hasFilter(columnId);
		tableState.setFilter(columnId, filter);
		// `setFilter` no-ops when nothing changes; only announce on real
		// transitions. `hasFilter` post-call gives us the actual outcome.
		const isFiltered = tableState.hasFilter(columnId);
		if (wasFiltered !== isFiltered) {
			tableState.announceFilterChange(columnId, isFiltered);
		}
		open = false;
	}

	function clear() {
		const wasFiltered = tableState.hasFilter(columnId);
		tableState.clearFilter(columnId);
		if (wasFiltered) tableState.announceFilterChange(columnId, false);
		open = false;
	}

	function toggleEnum(value: string, checked: boolean) {
		// Replace the Set so reactivity sees a fresh identity. `SvelteSet`
		// would let us mutate in place but the regular `Set` form keeps the
		// component dependency-free and is plenty fast for filter UIs.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const next = new Set(draftEnum);
		if (checked) next.add(value);
		else next.delete(value);
		draftEnum = next;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		apply();
	}
</script>

<div
	bind:this={popoverEl}
	role="dialog"
	aria-label="Filter column"
	data-spectrum-table-view-column-filter
	popover="manual"
	style="position-anchor: {anchorName};"
>
	{#if open}
		<form onsubmit={handleSubmit}>
			{#if filterType === 'text'}
				<TextField
					label="Contains"
					hideLabel
					placeholder="Filter…"
					size="s"
					bind:value={draftText}
					{@attach (node) => {
						firstFieldEl = node.querySelector('input');
					}}
				/>
			{:else if filterType === 'number'}
				<div data-spectrum-table-view-column-filter-row>
					<NumberField
						label="Min"
						size="s"
						hideStepper
						bind:value={draftMin}
						{@attach (node) => {
							firstFieldEl = node.querySelector('input');
						}}
					/>
					<NumberField label="Max" size="s" hideStepper bind:value={draftMax} />
				</div>
			{:else if filterType === 'enum'}
				<div data-spectrum-table-view-column-filter-options>
					{#each enumOptions as option, i (option.value)}
						<Checkbox
							size="s"
							checked={draftEnum.has(option.value)}
							onchange={(e: Event) =>
								toggleEnum(option.value, (e.currentTarget as HTMLInputElement).checked)}
							{@attach (node) => {
								if (i === 0) firstFieldEl = node.querySelector('input');
							}}
						>
							{option.label}
						</Checkbox>
					{/each}
				</div>
			{/if}

			<div data-spectrum-table-view-column-filter-actions>
				<Button
					type="button"
					variant="secondary"
					treatment="outline"
					size="s"
					isDisabled={!tableState.hasFilter(columnId)}
					onclick={clear}
				>
					Clear
				</Button>
				<Button type="submit" variant="accent" treatment="fill" size="s">Apply</Button>
			</div>
		</form>
	{/if}
</div>

<style>
	[data-spectrum-table-view-column-filter] {
		position: fixed;
		inset: auto;
		margin: 0;
		padding: var(--spacing-200);
		background-color: var(--background-layer-2-color);
		border: var(--border-width-100) solid var(--popover-border-color);
		border-radius: var(--corner-radius-medium-default);
		box-shadow: var(--drop-shadow-elevated);
		min-width: 240px;
		max-width: 320px;
		box-sizing: border-box;
		/* Anchor position: snap to bottom-start of the column header. Mirrors
		   the chevron menu's `bottom span-right` so the popover lines up with
		   the data column rather than drifting to the right edge of the
		   viewport when the column is wide. */
		position-area: bottom span-right;
		position-try-fallbacks: flip-block;
		z-index: 1050;
	}

	[data-spectrum-table-view-column-filter]:not(:popover-open) {
		display: none;
	}

	[data-spectrum-table-view-column-filter] form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
	}

	[data-spectrum-table-view-column-filter-row] {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-100);
	}

	[data-spectrum-table-view-column-filter-options] {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-100);
		max-height: 240px;
		overflow-y: auto;
	}

	[data-spectrum-table-view-column-filter-actions] {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-100);
	}
</style>
