# @matchalatte/ssp-theme

## 0.1.0-next.3

### Minor Changes

- Previews are generated from the same code that renders the stylesheet. ([#101](https://github.com/MatchaScript/ssp/pull/101))

  - **`@matchalatte/ssp-theme`** exports `generatePalettes(config)` and `colorKeysFor(color)`, previously inlined in `generateSpectrumCss`. The rendered stylesheet is unchanged.
  - **Theme Colors** interpolated through CAM02p while the generator uses CAM02, and built its gray background in CAM02p rather than OKLCH, so its swatches were not the colours the exported CSS carries — 8 of 16 stops differed for the bundled blue. Its default state now reproduces the export exactly in both light and dark; the sliders still explore from there.
  - **Renaming** a colour onto a name already in use overwrote that colour; it is now rejected with an inline message. Scale names were also interpolated into a `RegExp`, so a name containing `(` threw while rendering the swatch labels.
  - **"Distribute lightness"** produced the same ratios as "distribute ratios". It now inverts the scale's own ratio-to-L\* samples so the generated swatches land on evenly spaced lightness.
  - **The JSON editor** applied any parseable input, so a half-typed edit could store a config missing keys the palette needs. Input is now validated before it is applied, and rejected input is reported.
  - **Unsaved edits** are indicated in the header and warned about on unload; Reset asks for confirmation.
  - **Colours can be added and removed** from the Create page instead of only through the JSON editor.
  - The index route served the SvelteKit scaffold page; it now goes to Create.
  - Page headers share one component and one heading scale, and the separate app header row is gone.

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
