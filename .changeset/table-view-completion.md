---
'@matchalatte/ssp-ui': minor
---

TableView reaches feature parity with React Spectrum S2 (sans virtualization).

- **Column resize**: `allowsResizing` on `<TableView.Column>` enables a drag handle and a keyboard-driven "Resize column" menu entry. Width is specified as `number` (px), `${number}%`, or `${number}fr`; freeze-left semantics during drag mirror RS S2. Hidden range input owns a11y; pointer drag uses page-relative deltas with window-level listeners for robustness. RTL flips direction.
- **i18n**: every UI label and live-region announcement is routed through a new `StringFormatter` primitive backed by per-component message catalogues. Default locale is `en-US`; locale is resolved from `<html lang>`. Plural selection via `Intl.PluralRules`.
- **Cell-mode typeahead**: typing a letter while a cell is focused jumps to the matching row (matched on the row's `textValue` or rowheader cell text) and lands on the cell in the current column.
- **Row focus announcement**: tabbing into the table announces the row's position ("Alice, row 2 of 12").
