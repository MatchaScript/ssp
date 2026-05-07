# @matchalatte/ssp-color-editor

## 0.0.2-next.1

### Patch Changes

- Refactor `action-button-base` from a module-exported snippet into a standalone Svelte component so the per-component CSS hash is reliably emitted in production builds. ActionButton, ToggleButton, ActionButtonGroupItem, and ToggleGroupItem now render `<ActionButtonBase>` as a child. Also drop unused `@adobe/leonardo-contrast-colors`, `@adobe/spectrum-tokens`, and `culori` runtime dependencies from `ssp-ui`.

## 0.0.2-next.0

### Patch Changes

- Initial release
