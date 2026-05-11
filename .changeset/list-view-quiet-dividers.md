---
'@matchalatte/ssp-ui': patch
---

Keep row dividers in ListView quiet mode.

Quiet mode previously stripped the `border-block-end` from every item, leaving the list visually flat. S2 ListView keeps the dividers in quiet mode and only drops the trailing border on the last row (since there's no outer container border to clip it against). Switch the selector to `:not(:has(~ [data-spectrum-list-view-row]))` so only the final row's divider is removed.
