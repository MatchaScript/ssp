---
'@matchalatte/ssp-ui': patch
---

Side nav item text and suffix are placed from the end of the subgrid, so they stay on the right tracks in sections without icons.

A section drops the icon column when none of its items has an icon, leaving a three-track subgrid instead of four. Pinning the text to column 3 and the suffix to column 4 put the label in the suffix track and pushed the suffix into an implicit fifth column past the item's trailing edge. Placing them at `-3 / -2` and `-2 / -1` lands them on the same tracks either way.
