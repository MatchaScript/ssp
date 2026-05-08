---
'@matchalatte/ssp-color-editor': patch
'@matchalatte/ssp-theme': patch
'@matchalatte/ssp-ui': patch
---

**Renamed `@matchalatte/ssp-core` → `@matchalatte/ssp-theme`**

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
<SideNav activeMatcher={(href, { exact }) => exact ? page.url.pathname === href : page.url.pathname.startsWith(href)}>
  <!-- ... -->
</SideNav>
```

Without it, no item is ever active — this keeps the library router-agnostic.
