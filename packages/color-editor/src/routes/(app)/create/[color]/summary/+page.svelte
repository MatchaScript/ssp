<script lang="ts">
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { getColorEditorContext } from '$lib/contexts/color-editor';
	import { wheelSettings } from '$lib/stores/wheel-settings.svelte';
	import { crossSectionTicks, nearestTickIndex } from '$lib/utils/cross-section';
	import { m } from '$lib/paraglide/messages';
	import ColorWheel from '$lib/components/features/color-wheel/color-wheel.svelte';
	import { Slider } from '@matchalatte/ssp-ui/components/slider';
	import { Switch } from '@matchalatte/ssp-ui/components/switch';
	import {
		Picker,
		PickerTrigger,
		PickerContent,
		PickerItem
	} from '@matchalatte/ssp-ui/components/picker';
	import { COLOR_SPACES } from '$lib/types/color-space';

	const ctx = getColorEditorContext();

	const spaceConfig = $derived(COLOR_SPACES[colorSpaceState.id]);

	// Own-palette scales only (exclude adobe reference scales)
	const ownScales = $derived(ctx.wheelPaths.filter((p) => !p.variant || p.variant === 'default'));

	const ticks = $derived(crossSectionTicks(ownScales, ctx.levelCount, spaceConfig));

	$effect(() => {
		if (!wheelSettings.snapLightness || wheelSettings.dotMode !== 'crossSection') return;
		if (ticks.length === 0) return;

		const snapped = ticks[nearestTickIndex(wheelSettings.lightness, ticks)];
		if (Math.abs(snapped - wheelSettings.lightness) > 1e-6) {
			wheelSettings.lightness = snapped;
		}
	});

	const wheelDots = $derived.by(() => {
		if (wheelSettings.dotMode === 'keyColors') return ctx.wheelDots;
		if (!ticks.length) return [];
		const level = nearestTickIndex(wheelSettings.lightness, ticks);
		return ownScales.map((s) => ({ hex: s.swatches[level], name: s.name }));
	});

	const dotModeLabel = $derived(
		wheelSettings.dotMode === 'keyColors' ? m.chromaticity_dots_keys() : m.chromaticity_dots_cross()
	);
</script>

<div class="summary-page">
	<div class="summary-body">
		<!-- Color Wheel -->
		<div class="wheel-panel">
			<ColorWheel
				colorSpace={colorSpaceState.id}
				lightness={wheelSettings.lightness}
				dots={wheelDots}
				paths={ctx.wheelPaths}
				showPaths={wheelSettings.showPaths}
				showHarmonyLines={wheelSettings.showHarmonyLines}
				showGamutBoundary={wheelSettings.showGamutBoundary}
			/>
			<div class="wheel-controls">
				<Picker
					bind:selectedKey={wheelSettings.dotMode}
					label={dotModeLabel}
					selectionMode="single"
				>
					<PickerTrigger />
					<PickerContent>
						<PickerItem value="keyColors" label={m.chromaticity_dots_keys()} />
						<PickerItem value="crossSection" label={m.chromaticity_dots_cross()} />
					</PickerContent>
				</Picker>
				<Slider
					bind:value={wheelSettings.lightness}
					min={0}
					max={100}
					label={m.create_wheel_lightness()}
				/>
				<div class="wheel-toggles">
					<Switch bind:checked={wheelSettings.showPaths}>
						{m.chromaticity_show_paths()}
					</Switch>
					<Switch bind:checked={wheelSettings.showHarmonyLines}>
						{m.chromaticity_show_harmony()}
					</Switch>
					<Switch bind:checked={wheelSettings.showGamutBoundary}>
						{m.chromaticity_show_gamut_boundary()}
					</Switch>
					<Switch
						bind:checked={wheelSettings.snapLightness}
						isDisabled={wheelSettings.dotMode !== 'crossSection'}
					>
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
