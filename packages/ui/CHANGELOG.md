# @matchalatte/ssp-ui

## 0.1.0-next.7

### Minor Changes

- Make Menu, Divider, and Badge component contracts consistent and copy-friendly. ([#127](https://github.com/MatchaScript/ssp/pull/127))

  - Menu now exports prop types for every public part, preserves consumer styles while applying anchor positioning, protects owned accessibility attributes, and renders dividers as a single semantic element.
  - Divider protects its separator semantics from forwarded HTML attributes.
  - Badge now exports its prop and variant types and uses the shared lowercase `s/m/l/xl` size convention. Uppercase Badge size values are no longer accepted, and its default size changes from `s` to `m`.

- TableView takes its columns and rows as data. This replaces the markup-only API and is a breaking change for every consumer. ([#119](https://github.com/MatchaScript/ssp/pull/119))

  ```svelte
  <TableView.Root aria-label="Team" selectionMode="multiple">
  	<TableView.Header columns={COLUMNS} />
  	<TableView.Body items={rows} getKey={(u) => u.id}>
  		{#snippet row(user)}
  			<TableView.Row textValue={user.name}>
  				<TableView.Cell column="name">{user.name}</TableView.Cell>
  			</TableView.Row>
  		{/snippet}
  	</TableView.Body>
  </TableView.Root>
  ```

  - **`<TableView.Column>` is gone.** Columns are objects on `<TableView.Header columns>`: `{ id, label, isRowHeader?, allowsSorting?, … }`. The same array drives the header cells, the `<colgroup>` and `aria-colindex`, so they can no longer disagree — declaring columns in one order and rendering `<th>`s in another used to put a column's declared width on a different physical column. Pass a `column` snippet to Header when the header cell needs more than the label.
  - **Rows come from `items` + `getKey` + a `row` snippet.** Row order is the array order. A consumer-side re-sort no longer has to be observed in the DOM, which is what previously left arrow keys, range selection and `aria-rowindex` disagreeing with each other after a sort.
  - **`<TableView.Cell column="…">` is required**, and cells may be written in any order or skipped. Dev builds warn on an id no column declares and on two cells claiming the same column in one row.
  - **`<TableView.Row key>` and `<TableView.Row isDisabled>` are gone.** Keys come from `getKey`; disabled rows are listed in Root's `disabledKeys`, so the server and the browser agree on which rows are selectable.
  - **`hideHeader` on Root** replaces hiding the header by omitting `<TableView.Header>`. A hidden header renders no column menu, resize handle, sort click target or select-all checkbox — those would be focus stops the user cannot see — while the column names stay in the accessibility tree.
  - **Cell `textValue`** is now read. Cells in a rowheader column supply the row's accessible name and its typeahead text, and a row with several rowheader columns is named from all of them.
  - The `TData` type parameter is gone; item data flows through `items`.

- TableView's selection column is a real checkbox, its column headers carry an id that names each resizer, and the ARIA index attributes that only make sense under virtualization are gone. ([#119](https://github.com/MatchaScript/ssp/pull/119))

  The selection column used to be a drawn box marked `aria-hidden`, so assistive technology was shown a table whose selection state had no control, no name and no checked state — the outcome of a toggle was only learnable afterwards, from the live region. Each row and the header now render an `<input type="checkbox">` that carries those semantics, with the visual box beside it. The select-all checkbox reports its third state as `aria-checked="mixed"`, so "does pressing this select everything or clear it?" is answerable before pressing it.

  Behaviour changes for consumers:

  - **The selection cells contain a real focusable control, parked at `tabindex="-1"`.** A checkbox is tabbable on native focusability alone, so counting `tabindex="0"` attributes is no longer a way to count the widget's tab stops. The table is still exactly one.
  - **A row checkbox is named after its row**, by pointing at the same rowheader cells the row's own `aria-labelledby` uses: "Select" followed by the row's name. The select-all is named `Select all`, and that name moved off the `<th>` onto the control so it is not read twice.
  - **The checkbox reflects the selection rather than its own click.** A toggle the table refuses — a disabled row, or clearing the last row under `disallowEmptySelection` — leaves the box showing what is actually selected.
  - **The select-all checkbox is disabled while there is no row it could select**: an empty table, a table whose every row is disabled, or a disabled table.
  - **`aria-rowcount`, `aria-colcount`, `<tr aria-rowindex>` and the data cells' `aria-colindex` are no longer emitted.** They describe a collection larger than the DOM, which is a virtualized table; emitting them from a fully rendered one tells assistive technology nothing it cannot already count, and goes wrong as soon as the counts and the rendered rows disagree. Column headers keep `aria-colindex`. The attributes come back with virtualization.
  - **Loader and empty-state rows carry `role="presentation"`**, so a table with no rows no longer reports one row to assistive technology.
  - **Column headers carry an `id`, and the column resizer is named from it.** Every resizer used to read as "Column resizer"; each now reads as its own label followed by the column it resizes.
  - **The live region only announces selection changes while focus is inside the table.** A consumer that rewrites `selectedKeys` from its own UI elsewhere on the page no longer makes the table speak over whatever the user is operating. A change that removes the row holding focus is still announced.

- TableView holds one keyboard identity for rows, cells and column headers, and the whole table is one tab stop. ([#119](https://github.com/MatchaScript/ssp/pull/119))

  Three independent focus states — the shared collection's highlighted item, a focused cell, a focused column header — are replaced by a single target plus a derived resolution of it against the rows and columns that currently exist. Every `tabindex` reads that one value, so a target whose row or column has gone resolves to nothing and the container takes the tab stop back, rather than the table being left with no tab stop at all.

  Behaviour changes for consumers:

  - **Keyboard entry no longer depends on `selectionMode` or `isDisabled`.** A read-only grid is still a grid, and its rows still have to be reachable to be read.
  - **One tab stop for the widget.** The column-menu trigger and the column resizer — including its visually hidden range input, which was tabbable on native focusability alone — leave the tab order. `Alt+ArrowDown` on a focused column header opens the menu, and the menu's "Resize column" entry is the route into the resizer.
  - **A table with no enabled row enters at its first column header.** Empty, every row disabled, or `isDisabled`. Without it, a filter that emptied the table could not be cleared from the keyboard once the header controls stopped being tab stops.
  - **Disabled rows and their cells carry no `tabindex` attribute**, rather than `-1`, which is still programmatically focusable.
  - **Arrow direction follows the computed writing direction.** Both horizontal arrows enter cell mode, so RTL has a way in; previously the direction defaulted to `ltr` at every call site.
  - **`PageUp` / `PageDown` move by a measured page** — the scroll box height over a real row height — and one value feeds both the 2D navigation and the shared collection. It is an approximation: a single row count only matches a pixel-based page while every row is the same height.

  `SelectableCollection` gains three optional props — `orderedValues`, `highlightedValue` and `onHighlightChange` — so a consumer that already owns the order and the highlight identity can supply both instead of the collection deriving order from DOM position and owning the highlight itself. Menu, ListView and TagGroup pass none of them and are unaffected.

  `ActionButton` now honours an explicit `tabindex` instead of always rendering `0`. `ActionBar` items therefore render the roving tabindex its toolbar was already computing, so the bar is a single tab stop with arrow-key traversal.

### Patch Changes

- Fix tab stops and range selection across Menu / ListView / TableView, and derive TableView's rows and columns from ordered lists. ([#119](https://github.com/MatchaScript/ssp/pull/119))

  - **One roving tabindex rule.** `SelectableCollection` now owns it (`containerTabIndex` / `itemTabIndex`), matching react-aria: the container is tabbable while nothing inside is focused, the focused item is tabbable afterwards, and disabled items get no `tabindex` at all. A standalone `<Menu>` previously had no tab stop; a `<ListView>` with a highlighted item previously had two.
  - **Shift-range selection keeps the rest of the selection.** `extendSelection` built a fresh set, so shift-clicking discarded rows selected outside the range while an ordinary click kept them.
  - **TableView rows and columns are two ordered lists.** The per-access collection rebuild is gone, so a row-level derived no longer re-runs when column state changes, and `aria-colindex` is computed from a single list instead of three call sites doing their own selection-mode arithmetic. No public API change.

- In row mode collections, a bare `a` or `A` keypress now routes to typeahead search when select-all is not performed, matching cell mode behavior and allowing rows starting with "a" to be reached by typing. ([#123](https://github.com/MatchaScript/ssp/pull/123))

- Side nav item text and suffix are placed from the end of the subgrid, so they stay on the right tracks in sections without icons. ([#128](https://github.com/MatchaScript/ssp/pull/128))

  A section drops the icon column when none of its items has an icon, leaving a three-track subgrid instead of four. Pinning the text to column 3 and the suffix to column 4 put the label in the suffix track and pushed the suffix into an implicit fifth column past the item's trailing edge. Placing them at `-3 / -2` and `-2 / -1` lands them on the same tracks either way.

- Table view column resizer range input change actions step column width by ±10px instead of passing raw range values. ([#125](https://github.com/MatchaScript/ssp/pull/125))

  Pressing native slider keys (Home, End, PageUp, PageDown) on a column resizer no longer jumps the column to the ends of the input's range — the column's minimum width, or `Number.MAX_SAFE_INTEGER` where the column sets no `maxWidth`. Instead, each change event reads the direction relative to the current width and steps the column by 10px.

## 0.1.0-next.6

### Minor Changes

- TableView reaches feature parity with React Spectrum S2 (sans virtualization). ([#44](https://github.com/MatchaScript/ssp/pull/44))
  - **Column resize**: `allowsResizing` on `<TableView.Column>` enables a drag handle and a keyboard-driven "Resize column" menu entry. Width is specified as `number` (px), `${number}%`, or `${number}fr`; freeze-left semantics during drag mirror RS S2. Hidden range input owns a11y; pointer drag uses page-relative deltas with window-level listeners for robustness. RTL flips direction.
  - **Cell-mode typeahead**: typing a letter while a cell is focused jumps to the matching row (matched on the row's `textValue` or rowheader cell text) and lands on the cell in the current column.
  - **Row focus announcement**: tabbing into the table announces the row's position ("Alice, row 2 of 12").

## 0.0.2-next.5

### Patch Changes

- Keep row dividers in ListView quiet mode. ([#20](https://github.com/MatchaScript/ssp/pull/20))

  Quiet mode previously stripped the `border-block-end` from every item, leaving the list visually flat. S2 ListView keeps the dividers in quiet mode and only drops the trailing border on the last row (since there's no outer container border to clip it against). Switch the selector to `:not(:has(~ [data-spectrum-list-view-row]))` so only the final row's divider is removed.

- SelectBox spacing and layout refinements. ([#21](https://github.com/MatchaScript/ssp/pull/21))
  - Background switches to the canonical `--background-layer-2-color` token (drops the legacy `--layer-2-background-color` fallback).
  - Vertical: outer padding bumps from `spacing-300` to `spacing-400`; the illustration→label gap moves from `row-gap` to an explicit `min-content var(--spacing-100) min-content` grid track so the gap is a real layout row (easier to override per-instance via the grid template).
  - Horizontal: outer padding bumps one step (`spacing-200`→`spacing-300`, `spacing-400`→`spacing-500`, `spacing-300`→`spacing-400`); illustration/text gap moves from `column-gap` to a fixed 10 px grid track, description/label gap to `var(--spacing-50)`.
  - Both orientations expose `--select-box-max-width` so consumers can clamp the card width without overriding `max-width` directly.

- Add TableView component aligned with React-Spectrum S2. ([#18](https://github.com/MatchaScript/ssp/pull/18))
  - **Markup-compositional API** mirroring RS S2: `<TableView.Root>` / `Header` / `Body` / `Column` / `Row` / `Cell` register themselves on mount. No data-passed-as-props alternative — columns and rows are declared as children.
  - **Selection** (`none` / `single` / `multiple`) with controlled / uncontrolled lock-in. Once a consumer supplies a defined `selectedKeys` / `sortDescriptor` / `hiddenColumns` / `columnFilters`, the component stays controlled for its lifetime.
  - **2D keyboard navigation** via a pure-function `TableKeyboardDelegate`: row mode, cell mode (ArrowRight to enter, ArrowLeft / Esc to exit), and column-header mode (ArrowDown into cells, Enter / Space toggles sort). Page Up / Down, Home / End, and typeahead all follow RAC semantics.
  - **Sort** with a 2-way header click toggle (ascending ⇄ descending). Sort state is descriptor-only — applying the sort to data is the consumer's responsibility (matches RAC).
  - **Column visibility & per-column filters** via a chevron-anchored column menu. Filter UI dispatches on `filterType`: text (`contains`), number (`between`), enum (`in`). Filter state lives next to the rest of the controlled props.
  - **Linked rows** via a stretched `<a>::after` over the rowheader cell, so cmd/middle/right-click context-menu and SvelteKit client-side nav all flow through a real anchor. `linkBehavior='override'` semantics — plain click on a linked row does not toggle selection.
  - **Loading / empty states** (`loading`, `loadingMore`, custom `renderEmptyState` snippet) and infinite scroll via `onLoadMore` with a 50 px scroll threshold.
  - **Live-region announcements** for selection, sort, and filter changes piped through the shared announcer utility (mirrors RAC's "speak invisible changes" workaround for `role='grid'`).
  - **Focus styling** centralised on `<TableView.Root>` to match S2's `cellFocus` (2 px focus-ring inset −2, 6 px corner radius); row leading-edge accent matches S2 TableView's `--rowFocusIndicatorColor` bar.

## 0.0.2-next.4

### Patch Changes

- Align Card with React-Spectrum S2. ([#16](https://github.com/MatchaScript/ssp/pull/16))
  - **Sizes** expanded from `s/m/l` to `xs/s/m/l/xl`, with corresponding border-radius, heading, and description font-size mappings.
  - **Density × size** spacing matrix exposed through `--_card-space` (15 cells), driving inner gaps, preview offsets, and footer/content padding from a single token.
  - **Preview full-bleed** via negative `--_card-padding` margins (S2 parity). For `quiet`, `--_card-padding` is zeroed so the preview sits flush.
  - **Content grid** with `:has`-style menu lane: default `grid-template-areas: 'heading' / 'description'`, with `[data-has-menu]` switching to `'heading menu' / 'description description'`.
  - **New `menu` snippet slot** for ActionMenu / overflow controls next to the heading.
  - **Icon barrel** gains `Ellipsis` for typical menu triggers.

## 0.0.2-next.3

### Patch Changes

- Align TagGroup with React-Spectrum S2 and extract a shared `ClearButton` primitive. ([#12](https://github.com/MatchaScript/ssp/pull/12))
  - **Tag** styles now mirror S2 `tagStyles`: round-rect corners (not pill), height-relative paddings, `gray-100` / `gray-200` hover, neutral-filled selected, accent-filled emphasized+selected. Sizes track S2 `controlSize` (24/32/40 px for `s`/`m`/`l`).
  - **New `ClearButton` component** — always-transparent square hit-target with a small Cross glyph, mirroring S2 ClearButton. TagGroup's remove button and SearchField's clear button both consume it. Icon size is bumped ~1.5× from S2's literal mapping to compensate for Lucide `X` being a stroked icon vs S2's filled glyph.
  - **TagGroup keyboard model** rebuilt around react-aria's `keyboardNavigationBehavior: 'tab'`. The cell-mode toggle (ArrowDown → enter cell, Esc → exit) is removed; the row's `ClearButton` mirrors the row's roving tabindex so the browser's native Tab walk advances row → X → exit without a custom Tab handler. The X is now reachable from the keyboard, fixing a discoverability gap.
  - **SearchField** clear button now joins the tab order (`tabindex={-1}` dropped) and matches S2 SearchField via the shared `ClearButton`.

## 0.0.2-next.2

### Patch Changes

- **Renamed `@matchalatte/ssp-core` → `@matchalatte/ssp-theme`** ([`90f9c2f`](https://github.com/MatchaScript/ssp/commit/90f9c2fd83a52016a4655a52782fe5f4db4db2e7))

  The package was renamed because "core" implied a required runtime foundation, while in practice this package is an optional build-time tool (Vite plugin + theme generation API + token data). The new name reflects its actual role.

  Update imports:

  ```diff
  - import { spectrumThemePlugin } from '@matchalatte/ssp-core';
  + import { spectrumThemePlugin } from '@matchalatte/ssp-theme';

  - import { generateSpectrumCss } from '@matchalatte/ssp-core/generate';
  + import { generateSpectrumCss } from '@matchalatte/ssp-theme/generate';

  - import semantic from '@matchalatte/ssp-core/tokens/semantic.json';
  + import semantic from '@matchalatte/ssp-theme/tokens/semantic.json';
  ```

  And in `package.json`:

  ```diff
  - "@matchalatte/ssp-core": "..."
  + "@matchalatte/ssp-theme": "..."
  ```

  **Breaking changes in `@matchalatte/ssp-ui`**

  Several components dropped their dedicated `icon` prop in favor of children-based composition. Pass icons inside the default snippet instead.

  Affected components: `Button`, `ActionButton`, `ActionBarItem`, `ActionButtonGroupItem`, `SegmentedControlItem`, `ToggleButton`, `ToggleGroupItem`, `SideNavItem`.

  ```diff
  - <Button icon={iconSnippet}>Save</Button>
  + <Button>{@render iconSnippet()} Save</Button>
  ```

  `ActionButton` additionally dropped its `label` snippet and `iconOnly` boolean — use `children` for everything (the component now infers icon-only layout from content).

  `SideNav` gained an `activeMatcher` prop for router-agnostic active-state highlighting:

  ```svelte
  <SideNav
  	activeMatcher={(href, { exact }) =>
  		exact ? page.url.pathname === href : page.url.pathname.startsWith(href)}
  >
  	<!-- ... -->
  </SideNav>
  ```

  Without it, no item is ever active — this keeps the library router-agnostic.

## 0.0.2-next.1

### Patch Changes

- Refactor `action-button-base` from a module-exported snippet into a standalone Svelte component so the per-component CSS hash is reliably emitted in production builds. ActionButton, ToggleButton, ActionButtonGroupItem, and ToggleGroupItem now render `<ActionButtonBase>` as a child. Also drop unused `@adobe/leonardo-contrast-colors`, `@adobe/spectrum-tokens`, and `culori` runtime dependencies from `ssp-ui`.

## 0.0.2-next.0

### Patch Changes

- Initial release
