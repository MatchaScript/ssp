---
'@matchalatte/ssp-ui': minor
---

TableView's selection column is a real checkbox, its column headers carry an id that names each resizer, and the ARIA index attributes that only make sense under virtualization are gone.

The selection column used to be a drawn box marked `aria-hidden`, so assistive technology was shown a table whose selection state had no control, no name and no checked state — the outcome of a toggle was only learnable afterwards, from the live region. Each row and the header now render an `<input type="checkbox">` that carries those semantics, with the visual box beside it. The select-all checkbox reports its third state as `aria-checked="mixed"`, so "does pressing this select everything or clear it?" is answerable before pressing it.

Behaviour changes for consumers:

- **The selection cells contain a real focusable control, parked at `tabindex="-1"`.** A checkbox is tabbable on native focusability alone, so counting `tabindex="0"` attributes is no longer a way to count the widget's tab stops. The table is still exactly one.
- **A row checkbox is named after its row**, by pointing at the same rowheader cells the row's own `aria-labelledby` uses: "Select" followed by the row's name. The select-all is named `Select all`, and that name moved off the `<th>` onto the control so it is not read twice.
- **The checkbox reflects the selection rather than its own click.** A toggle the table refuses — a disabled row, or clearing the last row under `disallowEmptySelection` — leaves the box showing what is actually selected.
- **The select-all checkbox is disabled while there is no row it could select**: an empty table, a table whose every row is disabled, or a disabled table.
- **`aria-rowcount`, `aria-colcount`, `<tr aria-rowindex>` and the data cells' `aria-colindex` are no longer emitted.** They describe a collection larger than the DOM, which is a virtualized table; emitting them from a fully rendered one tells assistive technology nothing it cannot already count, and goes wrong as soon as the counts and the rendered rows disagree. Column headers keep `aria-colindex`. The attributes come back with virtualization.
- **Loader and empty-state rows carry `role="presentation"`**, so a table with no rows no longer reports one row to assistive technology.
- **Column headers carry an `id`, and the column resizer is named from it.** Every resizer used to read as "Column resizer"; each now reads as its own label followed by the column it resizes.
- **The live region only announces selection changes while focus is inside the table.** A consumer that rewrites `selectedKeys` from its own UI elsewhere on the page no longer makes the table speak over whatever the user is operating. A change that removes the row holding focus is still announced.
