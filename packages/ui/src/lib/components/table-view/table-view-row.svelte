<script lang="ts">
	import { untrack } from 'svelte';
	import type { TableViewRowProps } from './types.js';
	import { getTableContext, getRowScope, setRowContext } from './state/context.js';
	import { SELECTION_COLUMN_ID } from './state/table-state.svelte.js';
	import { CheckboxBox } from '../checkbox/index.js';

	let {
		textValue,
		href,
		target,
		download,
		rel,
		onAction: onRowAction,
		children
	}: TableViewRowProps = $props();

	const tableState = getTableContext();
	const scope = getRowScope();
	const key = $derived(scope.key);
	const domId = $props.id();
	let ref: HTMLTableRowElement | null = $state(null);

	// All getters: identity comes from the row scope, and the link / a11y props
	// must stay live for descendant <TableView.Cell> — a value copy would leave
	// the stretched <a> overlay (and aria-label) stale when `href` changes.
	// The keyboard target while it points at this row. One read of the
	// table-wide state per row, from the row scope; the `<tr>`, its cells and
	// its checkbox all answer "am I the target?" from this one value.
	const rowFocus = $derived(scope.focus);

	setRowContext({
		get rowKey() {
			return key;
		},
		rowDomId: domId,
		get focus() {
			return rowFocus;
		},
		get href() {
			return href;
		},
		get target() {
			return target;
		},
		get rel() {
			return rel;
		},
		get download() {
			return download;
		},
		get textValue() {
			return textValue;
		}
	});

	const isSelected = $derived(tableState.isSelected(key));
	const isDisabled = $derived(tableState.isRowDisabled(key));
	// The row is "focused" whenever the target names it, in either mode — that
	// is what paints the row-level accent while a cell inside it owns the
	// keyboard. It only owns the tab stop in row mode.
	const isFocused = $derived(rowFocus !== null);
	const isRowKeyboardTarget = $derived(rowFocus?.type === 'row');
	// A disabled row (and its cells) gets no `tabindex` attribute at all rather
	// than -1: -1 is still programmatically focusable, which would let
	// `.focus()` land on a row the keyboard deliberately skips. Same rule the
	// shared primitive's `itemTabIndex` applies, and upstream's
	// `useSelectableItem`.
	const showCheckbox = $derived(tableState.selectionMode !== 'none');
	const resolvedTextValue = $derived(textValue ?? '');
	const isLink = $derived(href !== undefined);

	// `aria-labelledby` points at the rowheader cell. Cell ids follow the
	// deterministic pattern `${rowDomId}-cell-${columnId}` (cells generate
	// their own id from the row context using the same template), so the row
	// can predict the id without the cell having to push it back. If no
	// rowheader column is registered (e.g. transient state during column
	// registration) `aria-labelledby` is omitted and SR falls back to the
	// row's textual content.
	// All rowheader cells, space-joined — a table may declare more than one, and
	// naming the row from only the first splits its accessible name.
	const ariaLabelledBy = $derived(
		tableState.rowHeaderColumnIds.length > 0
			? tableState.rowHeaderColumnIds.map((id) => `${domId}-cell-${id}`).join(' ')
			: undefined
	);
	// 1-based; the header row is always row 1, so body rows start at 2. The
	// position comes from the row scope, i.e. the consumer's array index.
	const ariaRowIndex = $derived(scope.index + 2);

	$effect(() => {
		const el = ref;
		if (!el) return;
		return untrack(() =>
			tableState.registerRow({
				domId,
				value: key,
				el,
				disabled: isDisabled,
				textValue: resolvedTextValue,
				href,
				onAction: onRowAction
			})
		);
	});
	// Push reactive updates to the row's `textValue` so typeahead /
	// announcement labels stay in sync. When the consumer omits
	// `textValue`, scrape it from the rowheader cell's textContent — this
	// makes a row "just work" for typeahead without
	// requiring every consumer to mirror their data into a `textValue`
	// prop. We only run the scrape lazily (when no explicit textValue is
	// provided) and only post-mount, so child cells have already rendered.
	// Label resolution, in the same order as upstream `getTextValue`: the row's
	// own `textValue`, then its rowheader cells' `textValue`. Scraping the
	// rendered `<th>` is the last resort, kept so a consumer who supplies
	// neither still gets working typeahead and announcements.
	$effect(() => {
		// Only the row's own `textValue` is stored. The rowheader-cell text and
		// the DOM scrape are resolved on read (`#rowLabel`), so a cell whose text
		// changes after mount is reflected without the row having to re-register.
		tableState.updateRow(domId, {
			disabled: isDisabled,
			textValue: textValue ?? ''
		});
	});
	// `href` and per-row `onAction` may change after mount (e.g. consumer
	// re-derives them). Keep TableState's row metadata in sync without
	// re-registering with SelectableCollection.
	$effect(() => {
		tableState.updateRowMeta(key, { href, onAction: onRowAction });
	});

	// Suppress row-level selection / action when the click originates from an
	// interactive descendant (e.g. a Button or Link inside a Cell). Includes the
	// stretched row-link `<a>` itself so its native click drives navigation
	// without the row also firing a selection toggle.
	const INTERACTIVE_SELECTOR =
		'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="tab"]';
	function isInteractiveTarget(target: EventTarget | null): boolean {
		return target instanceof Element && !!target.closest(INTERACTIVE_SELECTOR);
	}

	function handleClick(e: MouseEvent) {
		if (isDisabled) return;
		if (isInteractiveTarget(e.target)) return;
		// For linked rows the stretched `<a>` covers the whole `<tr>` and
		// receives the actual click — modifier keys (cmd/ctrl/middle) flow to
		// the browser natively. Plain row click does NOT toggle selection
		// (RAC `linkBehavior='override'`); selection still works through the
		// dedicated checkbox column.
		if (isLink) return;

		if (tableState.selectionMode !== 'none') {
			tableState.selectFromInput(key, {
				shiftKey: e.shiftKey,
				ctrlKey: e.ctrlKey,
				metaKey: e.metaKey,
				pointerType: 'mouse'
			});
		}
	}

	function handleDoubleClick(e: MouseEvent) {
		if (isDisabled) return;
		if (isInteractiveTarget(e.target)) return;
		// Linked rows already navigate on single click — no double-click action.
		if (isLink) return;
		(onRowAction ?? tableState.onAction)?.(key);
	}

	function handleFocus() {
		if (isDisabled) return;
		tableState.setRowFocus(key);
	}

	// Keyboard nav lives at the row level so descendant keystrokes (Button /
	// Link / Input inside a Cell) don't bubble into row navigation. The
	// `e.target === e.currentTarget` guard ensures only keys fired *on* the
	// `<tr>` itself drive selection / nav / typeahead.
	function handleKeydown(e: KeyboardEvent) {
		if (isDisabled) return;
		if (e.target !== e.currentTarget) return;
		tableState.handleRowKeyDown(e, key);
	}

	function handleCheckboxClick(e: MouseEvent) {
		// The row's onclick handler also fires; for non-linked rows we'd toggle
		// twice. Stop propagation so the cell click is the single source of
		// truth for the checkbox column.
		e.stopPropagation();
		if (isDisabled) return;
		tableState.selectFromInput(key, {
			shiftKey: e.shiftKey,
			ctrlKey: e.ctrlKey,
			metaKey: e.metaKey,
			pointerType: 'mouse'
		});
	}

	// Per-row checkbox cell — registered as a cell under SELECTION_COLUMN_ID so
	// 2D nav reaches it (RAC parity). Keydown filters to keys fired on the
	// `<td>` itself; descendant keystrokes (e.g. inside a future custom cell
	// renderer) shouldn't drive grid navigation.
	let checkboxCellRef: HTMLTableCellElement | null = $state(null);
	$effect(() => {
		const el = checkboxCellRef;
		if (!el || !showCheckbox) return;
		return untrack(() => tableState.registerCell(key, SELECTION_COLUMN_ID, el));
	});

	const isCheckboxCellFocused = $derived(
		rowFocus?.type === 'cell' && rowFocus.columnId === SELECTION_COLUMN_ID
	);
	// Same expression every other column index uses — the selection column is
	// simply the one that sits at index 0 of the nav order.
	const checkboxColIndex = $derived(tableState.navColumns.indexOf(SELECTION_COLUMN_ID) + 1);

	function handleCheckboxKeydown(e: KeyboardEvent) {
		if (isDisabled) return;
		if (e.target !== e.currentTarget) return;
		tableState.handleCellKeyDown(e, key, SELECTION_COLUMN_ID);
	}
</script>

<!-- `<tr>` has implicit role="row", but inside `role="grid"` AT support is
     more reliable when the role is set explicitly (matches RAC). -->
<!-- svelte-ignore a11y_no_redundant_roles -->
<tr
	bind:this={ref}
	role="row"
	data-spectrum-table-view-row
	data-key={key}
	data-selected={isSelected || undefined}
	data-disabled={isDisabled || undefined}
	data-focused={isFocused || undefined}
	data-link={isLink || undefined}
	aria-selected={tableState.selectionMode !== 'none' ? isSelected : undefined}
	aria-disabled={isDisabled || undefined}
	aria-labelledby={ariaLabelledBy}
	aria-rowindex={ariaRowIndex}
	tabindex={isDisabled ? undefined : isRowKeyboardTarget ? 0 : -1}
	onclick={handleClick}
	ondblclick={handleDoubleClick}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
>
	{#if showCheckbox}
		<td
			bind:this={checkboxCellRef}
			role="gridcell"
			data-spectrum-table-view-checkbox-cell
			data-focused={isCheckboxCellFocused || undefined}
			aria-colindex={checkboxColIndex}
			tabindex={isDisabled ? undefined : isCheckboxCellFocused ? 0 : -1}
			onfocus={() => tableState.setCellFocus(key, SELECTION_COLUMN_ID)}
			onclick={handleCheckboxClick}
			onkeydown={handleCheckboxKeydown}
		>
			<!-- Row focus indicator. Rendered inside the leading cell rather
			     than as a `<tr>` child to stay within the valid table content
			     model. The mirror in `<TableView.Cell>` handles the no-checkbox
			     case. Styles are `:global` because the matching element lives in
			     two different components. -->
			<span data-spectrum-table-view-row-focus-indicator aria-hidden="true"></span>
			<CheckboxBox checked={isSelected} {isDisabled} size="s" />
		</td>
	{/if}
	{@render children()}
</tr>

<style>
	[data-spectrum-table-view-row] {
		/* S2: default row text = neutral-subdued; bumps to neutral when selected. */
		--_row-text-color: var(--neutral-subdued-content-color-default);
		height: var(--table-view-row-height);
		border-bottom: 1px solid var(--gray-300);
		transition: background-color var(--duration-fast) var(--ease-out);
		outline: none;
		cursor: default;
		/* Establish a positioning context so the stretched row-link `<a>::after`
		   covers the entire row. `position: relative` on `<tr>` is well-supported
		   in modern browsers (Chrome, Firefox, Safari since ~2017). */
		position: relative;
	}

	/* Linked row: click cursor + the row-link overlay sits in the layer below
	   any interactive descendants (which get z-index: 1 below). */
	[data-spectrum-table-view-row][data-link]:not([data-disabled]) {
		cursor: pointer;
	}

	/* Hover — SP2: table-row-hover-color, table-row-hover-opacity=0.07.
	   Gated on `(hover: hover) and (pointer: fine)` so touch / coarse-pointer
	   devices don't flash the hover state on tap-then-release. */
	@media (hover: hover) and (pointer: fine) {
		[data-spectrum-table-view-row]:not([data-disabled]):hover {
			background-color: color-mix(in srgb, var(--table-row-hover-color) 7%, transparent);
		}
		[data-spectrum-table-view-row][data-selected]:not([data-disabled]):hover {
			background-color: color-mix(in srgb, var(--table-row-hover-color) 10%, transparent);
		}
	}

	/* Down/active — SP2: table-row-down-opacity=0.1. Stays outside the hover
	   media query: pointerdown fires on touch + mouse alike, and the visual
	   confirmation is wanted in both cases. */
	[data-spectrum-table-view-row]:not([data-disabled]):active {
		background-color: color-mix(in srgb, var(--table-row-hover-color) 10%, transparent);
	}

	/* Row focus indicator. Mirrors S2 TableView (`@react-spectrum/s2`): a 3px
	   accent at the row's leading edge, painted only on `:focus-visible`.
	   `inset-block-end: 1px` keeps the bar clear of the row's bottom border so
	   it lines up with the cell content area, matching S2's `margin-block-end: 1px`.
	   z-index 3 follows S2 so the bar sits above the checkbox cell and the
	   stretched row-link overlay. Rendered as a real `<span>` in the leading
	   cell of the row — `<TableView.Row>` handles the checkbox td case,
	   `<TableView.Cell>` handles the no-checkbox case. `:global` is required
	   because the indicator is rendered in two different components. */
	:global([data-spectrum-table-view-row-focus-indicator]) {
		position: absolute;
		inset-block-start: 0;
		inset-block-end: 1px;
		inset-inline-start: 0;
		width: 3px;
		background-color: transparent;
		pointer-events: none;
		z-index: 3;
	}
	[data-spectrum-table-view-row]:focus-visible
		:global([data-spectrum-table-view-row-focus-indicator]) {
		background-color: var(--focus-indicator-color);
	}

	/* Selected row — S2 uses gray-900 7% on the base bg; same family as hover. */
	[data-spectrum-table-view-row][data-selected] {
		--_row-text-color: var(--neutral-content-color-default);
		background-color: color-mix(in srgb, var(--table-row-hover-color) 7%, transparent);
	}

	/* Row-level highlight when a descendant (inline action button, link in a
	   cell, the row's own keyboard focus) takes focus-visible. `:has()` keeps
	   this purely declarative — no JS focusin/focusout tracking needed.
	   Bumps selected + focused to the 10% tier to match selected:hover. */
	[data-spectrum-table-view-row]:not([data-disabled]):has(:focus-visible) {
		background-color: color-mix(in srgb, var(--table-row-hover-color) 7%, transparent);
	}
	[data-spectrum-table-view-row][data-selected]:not([data-disabled]):has(:focus-visible) {
		background-color: color-mix(in srgb, var(--table-row-hover-color) 10%, transparent);
	}

	/* Disabled row */
	[data-spectrum-table-view-row][data-disabled] {
		--_row-text-color: var(--disabled-content-color);
		color: var(--disabled-content-color);
		cursor: not-allowed;
	}

	/* ── Checkbox Cell ─────────────────────────────────────────── */

	[data-spectrum-table-view-checkbox-cell] {
		padding: 0;
		vertical-align: middle;
		text-align: center;
		/* Above the row-link `::after` overlay so the checkbox click isn't
		   stolen by row navigation. */
		position: relative;
		z-index: 1;
		/* Cell-mode focus stop. Suppress UA outline; we paint our own ring. */
		outline: none;
	}

	/* ── Lift interactive descendants above the stretched row-link overlay ──
	   The row-link `<a>::after` sits at z-index 0 (positioned, painted on top
	   of non-positioned siblings). User-provided interactive elements inside
	   cells must opt out of that interception so their own clicks fire. We
	   scope the `:global` rule to linked rows only, and use a curated
	   interactive-element list (parallel to `INTERACTIVE_SELECTOR` in script). */
	[data-spectrum-table-view-row][data-link] :global(button),
	[data-spectrum-table-view-row][data-link] :global(a:not([data-row-link])),
	[data-spectrum-table-view-row][data-link] :global(input),
	[data-spectrum-table-view-row][data-link] :global(select),
	[data-spectrum-table-view-row][data-link] :global(textarea),
	[data-spectrum-table-view-row][data-link] :global([role='button']),
	[data-spectrum-table-view-row][data-link] :global([role='link']),
	[data-spectrum-table-view-row][data-link] :global([role='checkbox']),
	[data-spectrum-table-view-row][data-link] :global([role='switch']),
	[data-spectrum-table-view-row][data-link] :global([role='menuitem']) {
		position: relative;
		z-index: 1;
	}
</style>
