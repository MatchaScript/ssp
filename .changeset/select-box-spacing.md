---
'@matchalatte/ssp-ui': patch
---

SelectBox spacing and layout refinements.

- Background switches to the canonical `--background-layer-2-color` token (drops the legacy `--layer-2-background-color` fallback).
- Vertical: outer padding bumps from `spacing-300` to `spacing-400`; the illustration→label gap moves from `row-gap` to an explicit `min-content var(--spacing-100) min-content` grid track so the gap is a real layout row (easier to override per-instance via the grid template).
- Horizontal: outer padding bumps one step (`spacing-200`→`spacing-300`, `spacing-400`→`spacing-500`, `spacing-300`→`spacing-400`); illustration/text gap moves from `column-gap` to a fixed 10 px grid track, description/label gap to `var(--spacing-50)`.
- Both orientations expose `--select-box-max-width` so consumers can clamp the card width without overriding `max-width` directly.
