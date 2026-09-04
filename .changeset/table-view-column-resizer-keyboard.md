---
'@matchalatte/ssp-ui': patch
---

Table view column resizer range input change actions step column width by ±10px instead of passing raw range values.

Pressing native slider keys (Home, End, PageUp, PageDown) on a column resizer no longer jumps the column to the ends of the input's range — the column's minimum width, or `Number.MAX_SAFE_INTEGER` where the column sets no `maxWidth`. Instead, each change event reads the direction relative to the current width and steps the column by 10px.
