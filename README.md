# SSP — Svelte Spectrum

A Spectrum-inspired design system toolkit for Svelte 5.

> [!IMPORTANT]
> **This is an unofficial, community project.** SSP is not affiliated with,
> endorsed by, or sponsored by Adobe Inc. "Adobe Spectrum" and "Spectrum" are
> trademarks of Adobe. This project draws design inspiration from the publicly
> available Spectrum design system and consumes the Apache-2.0 licensed
> [`@adobe/spectrum-tokens`][spectrum-tokens] and
> [`@adobe/leonardo-contrast-colors`][leonardo] packages.

---

## Packages

SSP is published as three packages. Only `ssp-ui` is required at runtime; the
other two support custom theming workflows.

| Package                      | Role                                                                              | Required? |
| ---------------------------- | --------------------------------------------------------------------------------- | --------- |
| **`@matchalatte/ssp-ui`**    | Svelte 5 component library with a Spectrum-flavored API                           | yes       |
| **`@matchalatte/ssp-theme`** | Vite plugin that exposes a generated theme as a virtual module for live reloading | optional  |
| **color-editor**             | Interactive `npx` tool for authoring `spectrum.config.json`                       | optional  |

`ssp-ui` includes a default theme stylesheet, so importing the components and
the theme CSS is enough to get started. To use a custom palette, author one
with `color-editor` and either:

- emit the resulting CSS once and ship it as a regular stylesheet, or
- install `ssp-theme` to consume `spectrum.config.json` through the
  `virtual:ssp/theme.css` Vite virtual module, which adds HMR during
  development.

Either way, theming work happens at build time — `ssp-theme`, when used, is
never part of the runtime dependency graph.

## Status

**Pre-release / experimental.**

## Getting started

> Detailed installation docs and a hosted demo are coming.

```sh
pnpm add @matchalatte/ssp-ui            # component library
pnpm add -D @matchalatte/ssp-theme      # optional: Vite plugin for live-reloading custom themes
```

```svelte
<script>
	import { Button } from '@matchalatte/ssp-ui/components/button';
</script>

<Button variant="accent">Hello Spectrum</Button>
```

To try the color-editor without installing:

```sh
npx @matchalatte/ssp-color-editor
```

## Built on

- [bits-ui][bits-ui] — headless primitives for accessibility and keyboard behavior
- [`@adobe/leonardo-contrast-colors`][leonardo] — contrast-ratio-driven OKLCH palette generation
- [`@adobe/spectrum-tokens`][spectrum-tokens] — Spectrum design token definitions
- [culori][culori] — color space conversion

## Development

This is a pnpm workspace orchestrated with Turborepo.

```sh
pnpm install
pnpm dev      # start all dev servers
pnpm build    # build every package
pnpm check    # type-check
pnpm lint     # eslint
```

Toolchain versions are pinned in `mise.toml` (`mise install` to provision).

## License

[MIT](./LICENSE) © MatchaScript

Spectrum tokens and Leonardo are used under the Apache License 2.0. See
[NOTICE](./NOTICE) for third-party attribution covering the Adobe Spectrum
token data redistributed under `packages/theme/src/tokens/`.

[bits-ui]: https://bits-ui.com/
[leonardo]: https://github.com/adobe/leonardo
[spectrum-tokens]: https://github.com/adobe/spectrum-tokens
[culori]: https://culorijs.org/
