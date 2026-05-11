# @matchalatte/ssp-ui

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
