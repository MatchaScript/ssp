---
'@matchalatte/ssp-ui': patch
---

Table view column resizer range input change actions step column width by ±10px instead of passing raw range values.

Pressing native slider keys (Home, End, PageUp, PageDown) on an unconstrained column resizer range input no longer snaps column width to `Number.MAX_SAFE_INTEGER` or `0`. Instead, input change events evaluate direction relative to current width and adjust column width in 10px increments.
