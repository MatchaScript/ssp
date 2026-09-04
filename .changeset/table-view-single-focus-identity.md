---
'@matchalatte/ssp-ui': minor
---

TableView holds one keyboard identity for rows, cells and column headers, and the whole table is one tab stop.

Three independent focus states — the shared collection's highlighted item, a focused cell, a focused column header — are replaced by a single target plus a derived resolution of it against the rows and columns that currently exist. Every `tabindex` reads that one value, so a target whose row or column has gone resolves to nothing and the container takes the tab stop back, rather than the table being left with no tab stop at all.

Behaviour changes for consumers:

- **Keyboard entry no longer depends on `selectionMode` or `isDisabled`.** A read-only grid is still a grid, and its rows still have to be reachable to be read.
- **One tab stop for the widget.** The column-menu trigger and the column resizer — including its visually hidden range input, which was tabbable on native focusability alone — leave the tab order. `Alt+ArrowDown` on a focused column header opens the menu, and the menu's "Resize column" entry is the route into the resizer.
- **A table with no enabled row enters at its first column header.** Empty, every row disabled, or `isDisabled`. Without it, a filter that emptied the table could not be cleared from the keyboard once the header controls stopped being tab stops.
- **Disabled rows and their cells carry no `tabindex` attribute**, rather than `-1`, which is still programmatically focusable.
- **Arrow direction follows the computed writing direction.** Both horizontal arrows enter cell mode, so RTL has a way in; previously the direction defaulted to `ltr` at every call site.
- **`PageUp` / `PageDown` move by a measured page** — the scroll box height over a real row height — and one value feeds both the 2D navigation and the shared collection. It is an approximation: a single row count only matches a pixel-based page while every row is the same height.

`SelectableCollection` gains three optional props — `orderedValues`, `highlightedValue` and `onHighlightChange` — so a consumer that already owns the order and the highlight identity can supply both instead of the collection deriving order from DOM position and owning the highlight itself. Menu, ListView and TagGroup pass none of them and are unaffected.

`ActionButton` now honours an explicit `tabindex` instead of always rendering `0`. `ActionBar` items therefore render the roving tabindex its toolbar was already computing, so the bar is a single tab stop with arrow-key traversal.
