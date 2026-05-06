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

## What's in the box

SSP ships three packages that work together:

| Package          | What it is                                                         |
| ---------------- | ------------------------------------------------------------------ |
| **`@ssp/ui`**    | A Svelte 5 component library with a Spectrum-flavored API          |
| **`@ssp/core`**  | A Vite plugin that turns `spectrum.config.json` into CSS variables |
| **color-editor** | An interactive `npx` tool for authoring `spectrum.config.json`     |

The intended workflow:

```
npx color-editor       → tweak colors in the browser
                        → export spectrum.config.json
                        ↓
@ssp/core              → reads the config, generates an OKLCH palette via Leonardo,
                        → resolves semantic tokens from @adobe/spectrum-tokens,
                        → injects everything as `virtual:ssp/theme.css`
                        ↓
@ssp/ui                → components reference semantic CSS variables
                        → (a default theme is bundled, so the plugin is optional)
```

## Status

🚧 **Pre-release / experimental.**

## Getting started

> Detailed installation docs and a hosted demo are coming. For now, the
> package layout is:

```sh
pnpm add @ssp/ui            # component library
pnpm add -D @ssp/core       # Vite plugin (optional — for custom themes)
```

```svelte
<script>
	import { Button } from '@ssp/ui/components/button';
</script>

<Button variant="accent">Hello Spectrum</Button>
```

To try the color-editor without installing:

```sh
npx @ssp/color-editor
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
token data redistributed under `packages/core/src/tokens/`.

[bits-ui]: https://bits-ui.com/
[leonardo]: https://github.com/adobe/leonardo
[spectrum-tokens]: https://github.com/adobe/spectrum-tokens
[culori]: https://culorijs.org/
