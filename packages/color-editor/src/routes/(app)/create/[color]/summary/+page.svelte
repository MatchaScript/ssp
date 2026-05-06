<script lang="ts">
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { getColorEditorContext } from '$lib/contexts/color-editor';
	import { wheelLightnessStore } from '$lib/stores/wheel-lightness.svelte';
	import { m } from '$lib/paraglide/messages';
	import ColorWheel from '$lib/components/features/color-wheel/color-wheel.svelte';
	import { Slider } from '@matchalatte/ssp-ui/components/slider';
	import { Switch } from '@matchalatte/ssp-ui/components/switch';
	import { Picker, PickerTrigger, PickerContent, PickerItem } from '@matchalatte/ssp-ui/components/picker';
	import { COLOR_SPACES } from '$lib/types/color-space';

	const ctx = getColorEditorContext();
	const STORAGE_KEY = 'summary-wheel-settings';

	type DotMode = 'keyColors' | 'crossSection';
	interface SavedSettings {
		dotMode?: DotMode;
		showPaths?: boolean;
		showHarmonyLines?: boolean;
		showGamutBoundary?: boolean;
		snapLightness?: boolean;
	}

	function loadSettings(): SavedSettings {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
		} catch {
			return {};
		}
	}

	const saved = loadSettings();

	let showPaths = $state(typeof saved.showPaths === 'boolean' ? saved.showPaths : true);
	let showHarmonyLines = $state(
		typeof saved.showHarmonyLines === 'boolean' ? saved.showHarmonyLines : false
	);
	let showGamutBoundary = $state(
		typeof saved.showGamutBoundary === 'boolean' ? saved.showGamutBoundary : false
	);
	let snapLightness = $state(typeof saved.snapLightness === 'boolean' ? saved.snapLightness : true);
	let dotMode = $state<DotMode>(saved.dotMode === 'crossSection' ? 'crossSection' : 'keyColors');

	$effect(() => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ dotMode, showPaths, showHarmonyLines, showGamutBoundary, snapLightness })
		);
	});

	const spaceConfig = $derived(COLOR_SPACES[colorSpaceState.id]);

	// Own-palette scales only (exclude adobe/helmlab reference scales)
	const ownScales = $derived(ctx.wheelPaths.filter((p) => !p.variant || p.variant === 'default'));

	// Tick positions (0–100): per-level actual L in the display color space,
	// averaged across own scales. Non-uniform because Leonardo picks per-hue L.
	const crossSectionTicks = $derived.by<number[]>(() => {
		if (!ownScales.length || !ctx.levelCount) return [];
		const lMax = spaceConfig.channels[2].max;
		const ticks: number[] = [];
		for (let i = 0; i < ctx.levelCount; i++) {
			let sum = 0;
			let n = 0;
			for (const s of ownScales) {
				const hex = s.swatches[i];
				if (!hex) continue;
				sum += spaceConfig.extract(hex)[2];
				n++;
			}
			if (n > 0) ticks.push((sum / n / lMax) * 100);
		}
		return ticks;
	});

	function nearestTickIdx(value: number, ticks: number[]): number {
		let best = 0;
		let bestD = Infinity;
		for (let i = 0; i < ticks.length; i++) {
			const d = Math.abs(ticks[i] - value);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		return best;
	}

	$effect(() => {
		if (!snapLightness || dotMode !== 'crossSection' || crossSectionTicks.length === 0) return;
		const idx = nearestTickIdx(wheelLightnessStore.value, crossSectionTicks);
		const snapped = crossSectionTicks[idx];
		if (Math.abs(snapped - wheelLightnessStore.value) > 1e-6) {
			wheelLightnessStore.value = snapped;
		}
	});

	const wheelDots = $derived.by(() => {
		if (dotMode === 'keyColors') return ctx.wheelDots;
		if (!crossSectionTicks.length) return [];
		const idx = nearestTickIdx(wheelLightnessStore.value, crossSectionTicks);
		return ownScales.map((s) => ({ hex: s.swatches[idx], name: s.name }));
	});

	const dotModeLabel = $derived(
		dotMode === 'keyColors' ? m.chromaticity_dots_keys() : m.chromaticity_dots_cross()
	);
</script>

<div class="summary-page">
	<div class="summary-body">
		<!-- Color Wheel -->
		<div class="wheel-panel">
			<ColorWheel
				colorSpace={colorSpaceState.id}
				lightness={wheelLightnessStore.value}
				dots={wheelDots}
				paths={ctx.wheelPaths}
				{showPaths}
				{showHarmonyLines}
				{showGamutBoundary}
			/>
			<div class="wheel-controls">
				<Picker bind:selectedKey={dotMode} label={dotModeLabel} selectionMode="single">
					<PickerTrigger />
					<PickerContent>
						<PickerItem value="keyColors" label={m.chromaticity_dots_keys()} />
						<PickerItem value="crossSection" label={m.chromaticity_dots_cross()} />
					</PickerContent>
				</Picker>
				<Slider
					bind:value={wheelLightnessStore.value}
					min={0}
					max={100}
					label={m.create_wheel_lightness()}
				/>
				<div class="wheel-toggles">
					<Switch bind:checked={showPaths}>
						{m.chromaticity_show_paths()}
					</Switch>
					<Switch bind:checked={showHarmonyLines}>
						{m.chromaticity_show_harmony()}
					</Switch>
					<Switch bind:checked={showGamutBoundary}>
						{m.chromaticity_show_gamut_boundary()}
					</Switch>
					<Switch bind:checked={snapLightness} isDisabled={dotMode !== 'crossSection'}>
						{m.chromaticity_snap_lightness()}
					</Switch>
				</div>
			</div>
		</div>

		<!-- Preview Swatches -->
		{#if ctx.previewSwatches.length > 0}
			<div class="swatches-panel">
				<h2 class="section-heading">{m.create_preview()}</h2>
				<div class="preview-swatches">
					{#each ctx.previewSwatches as swatch, i (i)}
						<div class="preview-swatch" style:background-color={swatch} title={swatch}></div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.summary-page {
		padding: var(--spacing-400);
		height: 100%;
	}

	.summary-body {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--spacing-400);
		align-items: start;
	}

	.wheel-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-300);
		align-items: center;
	}

	.wheel-controls {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
		width: 100%;
		max-width: 320px;
	}

	.wheel-toggles {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-100);
	}

	/* ── Swatches (vertical strip) ── */

	.swatches-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
		position: sticky;
		top: var(--spacing-400);
	}

	.section-heading {
		font-size: var(--text-100);
		font-weight: 600;
		color: var(--neutral-subdued-content-color-default);
		margin: 0;
	}

	.preview-swatches {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.preview-swatch {
		width: 2rem;
		aspect-ratio: 1;
		border-radius: var(--corner-radius-75);
		border: 1px solid var(--gray-200);
	}
</style>
