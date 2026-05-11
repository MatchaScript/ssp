# @matchalatte/ssp-ui

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
