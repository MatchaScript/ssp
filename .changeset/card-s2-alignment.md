---
'@matchalatte/ssp-ui': patch
---

Align Card with React-Spectrum S2.

- **Sizes** expanded from `s/m/l` to `xs/s/m/l/xl`, with corresponding border-radius, heading, and description font-size mappings.
- **Density × size** spacing matrix exposed through `--_card-space` (15 cells), driving inner gaps, preview offsets, and footer/content padding from a single token.
- **Preview full-bleed** via negative `--_card-padding` margins (S2 parity). For `quiet`, `--_card-padding` is zeroed so the preview sits flush.
- **Content grid** with `:has`-style menu lane: default `grid-template-areas: 'heading' / 'description'`, with `[data-has-menu]` switching to `'heading menu' / 'description description'`.
- **New `menu` snippet slot** for ActionMenu / overflow controls next to the heading.
- **Icon barrel** gains `Ellipsis` for typical menu triggers.
