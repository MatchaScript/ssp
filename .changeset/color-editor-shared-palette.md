---
'@matchalatte/ssp-color-editor': minor
'@matchalatte/ssp-theme': minor
---

Previews are generated from the same code that renders the stylesheet.

- **`@matchalatte/ssp-theme`** exports `generatePalettes(config)` and `colorKeysFor(color)`, previously inlined in `generateSpectrumCss`. The rendered stylesheet is unchanged.
- **Theme Colors** interpolated through CAM02p while the generator uses CAM02, and built its gray background in CAM02p rather than OKLCH, so its swatches were not the colours the exported CSS carries — 8 of 16 stops differed for the bundled blue. Its default state now reproduces the export exactly in both light and dark; the sliders still explore from there.
- **Renaming** a colour onto a name already in use overwrote that colour; it is now rejected with an inline message. Scale names were also interpolated into a `RegExp`, so a name containing `(` threw while rendering the swatch labels.
- **"Distribute lightness"** produced the same ratios as "distribute ratios". It now inverts the scale's own ratio-to-L\* samples so the generated swatches land on evenly spaced lightness.
- **The JSON editor** applied any parseable input, so a half-typed edit could store a config missing keys the palette needs. Input is now validated before it is applied, and rejected input is reported.
- **Unsaved edits** are indicated in the header and warned about on unload; Reset asks for confirmation.
- **Colours can be added and removed** from the Create page instead of only through the JSON editor.
- The index route served the SvelteKit scaffold page; it now goes to Create.
- Page headers share one component and one heading scale, and the separate app header row is gone.
