---
'@matchalatte/ssp-ui': patch
---

Add TableView component aligned with React-Spectrum S2.

- **Markup-compositional API** mirroring RS S2: `<TableView.Root>` / `Header` / `Body` / `Column` / `Row` / `Cell` register themselves on mount. No data-passed-as-props alternative — columns and rows are declared as children.
- **Selection** (`none` / `single` / `multiple`) with controlled / uncontrolled lock-in. Once a consumer supplies a defined `selectedKeys` / `sortDescriptor` / `hiddenColumns` / `columnFilters`, the component stays controlled for its lifetime.
- **2D keyboard navigation** via a pure-function `TableKeyboardDelegate`: row mode, cell mode (ArrowRight to enter, ArrowLeft / Esc to exit), and column-header mode (ArrowDown into cells, Enter / Space toggles sort). Page Up / Down, Home / End, and typeahead all follow RAC semantics.
- **Sort** with a 2-way header click toggle (ascending ⇄ descending). Sort state is descriptor-only — applying the sort to data is the consumer's responsibility (matches RAC).
- **Column visibility & per-column filters** via a chevron-anchored column menu. Filter UI dispatches on `filterType`: text (`contains`), number (`between`), enum (`in`). Filter state lives next to the rest of the controlled props.
- **Linked rows** via a stretched `<a>::after` over the rowheader cell, so cmd/middle/right-click context-menu and SvelteKit client-side nav all flow through a real anchor. `linkBehavior='override'` semantics — plain click on a linked row does not toggle selection.
- **Loading / empty states** (`loading`, `loadingMore`, custom `renderEmptyState` snippet) and infinite scroll via `onLoadMore` with a 50 px scroll threshold.
- **Live-region announcements** for selection, sort, and filter changes piped through the shared announcer utility (mirrors RAC's "speak invisible changes" workaround for `role='grid'`).
- **Focus styling** centralised on `<TableView.Root>` to match S2's `cellFocus` (2 px focus-ring inset −2, 6 px corner radius); row leading-edge accent matches S2 TableView's `--rowFocusIndicatorColor` bar.
