---
'@matchalatte/ssp-color-editor': patch
'@matchalatte/ssp-ui': minor
---

Make Menu, Divider, and Badge component contracts consistent and copy-friendly.

- Menu now exports prop types for every public part, preserves consumer styles while applying anchor positioning, protects owned accessibility attributes, and renders dividers as a single semantic element.
- Divider protects its separator semantics from forwarded HTML attributes.
- Badge now exports its prop and variant types and uses the shared lowercase `s/m/l/xl` size convention. Uppercase Badge size values are no longer accepted, and its default size changes from `s` to `m`.
