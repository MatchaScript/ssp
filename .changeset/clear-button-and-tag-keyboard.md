---
'@matchalatte/ssp-ui': patch
---

Align TagGroup with React-Spectrum S2 and extract a shared `ClearButton` primitive.

- **Tag** styles now mirror S2 `tagStyles`: round-rect corners (not pill), height-relative paddings, `gray-100` / `gray-200` hover, neutral-filled selected, accent-filled emphasized+selected. Sizes track S2 `controlSize` (24/32/40 px for `s`/`m`/`l`).
- **New `ClearButton` component** — always-transparent square hit-target with a small Cross glyph, mirroring S2 ClearButton. TagGroup's remove button and SearchField's clear button both consume it. Icon size is bumped ~1.5× from S2's literal mapping to compensate for Lucide `X` being a stroked icon vs S2's filled glyph.
- **TagGroup keyboard model** rebuilt around react-aria's `keyboardNavigationBehavior: 'tab'`. The cell-mode toggle (ArrowDown → enter cell, Esc → exit) is removed; the row's `ClearButton` mirrors the row's roving tabindex so the browser's native Tab walk advances row → X → exit without a custom Tab handler. The X is now reachable from the keyboard, fixing a discoverability gap.
- **SearchField** clear button now joins the tab order (`tabindex={-1}` dropped) and matches S2 SearchField via the shared `ClearButton`.
