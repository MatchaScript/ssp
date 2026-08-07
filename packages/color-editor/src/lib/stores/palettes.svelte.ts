import { generatePalettes, type Palette } from '@matchalatte/ssp-theme/generate';
import { configState } from './config.svelte';

const EMPTY: Palette = { colors: {}, grays: {} };

/**
 * Palettes for the current config.
 *
 * Produced by the same function that renders the exported stylesheet, so what
 * the previews draw is what `spectrum.css` will contain. Nothing in the UI
 * should call Leonardo directly to reproduce these.
 */
class PalettesState {
	byTheme = $derived.by<Record<string, Palette>>(() => {
		if (!configState.raw.colorContrastTargets?.length) return {};
		return generatePalettes(configState.raw);
	});

	light = $derived<Palette>(this.byTheme.light ?? EMPTY);

	/** Generated swatch hexes for one color in the light theme. */
	swatches(name: string): string[] {
		return this.light.colors[name]?.map((c) => c.hex) ?? [];
	}
}

export const palettesState = new PalettesState();
