---
'@matchalatte/ssp-ui': patch
---

Fix tab stops and range selection across Menu / ListView / TableView, and derive TableView's rows and columns from ordered lists.

- **One roving tabindex rule.** `SelectableCollection` now owns it (`containerTabIndex` / `itemTabIndex`), matching react-aria: the container is tabbable while nothing inside is focused, the focused item is tabbable afterwards, and disabled items get no `tabindex` at all. A standalone `<Menu>` previously had no tab stop; a `<ListView>` with a highlighted item previously had two.
- **Shift-range selection keeps the rest of the selection.** `extendSelection` built a fresh set, so shift-clicking discarded rows selected outside the range while an ordinary click kept them.
- **TableView rows and columns are two ordered lists.** The per-access collection rebuild is gone, so a row-level derived no longer re-runs when column state changes, and `aria-colindex` is computed from a single list instead of three call sites doing their own selection-mode arithmetic. No public API change.
