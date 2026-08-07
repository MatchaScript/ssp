<script lang="ts">
	import { configState } from '$lib/stores/config.svelte';
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { palettesState } from '$lib/stores/palettes.svelte';
	import { LineChart } from '$lib/components/features/line-chart';
	import {
		Picker,
		PickerTrigger,
		PickerContent,
		PickerItem
	} from '@matchalatte/ssp-ui/components/picker';
	import { Slider } from '@matchalatte/ssp-ui/components/slider';
	import { Switch } from '@matchalatte/ssp-ui/components/switch';
	import { m } from '$lib/paraglide/messages';
	import ColorWheel from '$lib/components/features/color-wheel/color-wheel.svelte';
	import { PageHeader } from '$lib/components/layout';
	import { COLOR_SPACES } from '$lib/types/color-space';
	import { wheelSettings } from '$lib/stores/wheel-settings.svelte';
	import { crossSectionTicks, nearestTickIndex } from '$lib/utils/cross-section';

	const colorSpaceLabel = $derived(COLOR_SPACES[colorSpaceState.id].label);
	const spaceConfig = $derived(COLOR_SPACES[colorSpaceState.id]);
	const channels = $derived(spaceConfig.channels);

	// ── Scale generation (shared between wheel + charts) ──

	interface ScaleData {
		name: string;
		baseHex: string;
		swatches: string[];
	}

	const levelCount = $derived(configState.raw.colorContrastTargets?.length ?? 16);

	const scales = $derived.by<ScaleData[]>(() =>
		configState.colors.map((entry) => ({
			name: entry.name,
			baseHex: entry.baseHex,
			swatches: palettesState.swatches(entry.name)
		}))
	);

	// ── Color wheel dots ──

	const dotModeLabel = $derived(
		wheelSettings.dotMode === 'keyColors' ? m.chromaticity_dots_keys() : m.chromaticity_dots_cross()
	);

	const ticks = $derived(crossSectionTicks(scales, levelCount, spaceConfig));

	// Snap the slider to the nearest level in cross-section mode (opt-in)
	$effect(() => {
		if (!wheelSettings.snapLightness || wheelSettings.dotMode !== 'crossSection') return;
		if (ticks.length === 0) return;

		const snapped = ticks[nearestTickIndex(wheelSettings.lightness, ticks)];
		if (Math.abs(snapped - wheelSettings.lightness) > 1e-6) {
			wheelSettings.lightness = snapped;
		}
	});

	const wheelDots = $derived.by(() => {
		if (wheelSettings.dotMode === 'keyColors') {
			return configState.colors.flatMap((entry) => [
				{ hex: entry.baseHex, name: entry.name },
				...Object.values(entry.scaleAnchors).map((hex) => ({ hex, name: entry.name }))
			]);
		}
		// crossSection: pick the swatch whose actual L matches the slider.
		// Ticks are built from swatches[i] directly, so tick index === swatch index.
		if (!ticks.length) return [];
		const level = nearestTickIndex(wheelSettings.lightness, ticks);
		return scales.map((s) => ({ hex: s.swatches[level], name: s.name }));
	});

	// ── Color wheel interpolation paths ──

	const wheelPaths = $derived(scales.map((s) => ({ name: s.name, swatches: s.swatches })));

	// ── Interpolation chart data ──
	// Each chart (channel) gets its own array of series with {index, value} points

	interface ValuePoint {
		index: number;
		value: number;
	}

	interface ChannelSeries {
		name: string;
		color: string;
		points: ValuePoint[];
	}

	/** [channel0 series[], channel1 series[], channel2 series[]] */
	const channelData = $derived.by<[ChannelSeries[], ChannelSeries[], ChannelSeries[]]>(() => {
		const extract = spaceConfig.extract;
		const ch0: ChannelSeries[] = [];
		const ch1: ChannelSeries[] = [];
		const ch2: ChannelSeries[] = [];

		for (const scale of scales) {
			const pts0: ValuePoint[] = [];
			const pts1: ValuePoint[] = [];
			const pts2: ValuePoint[] = [];

			for (let i = 0; i < scale.swatches.length; i++) {
				const [c0, c1, c2] = extract(scale.swatches[i]);
				const index = i + 1;
				pts0.push({ index, value: c0 });
				pts1.push({ index, value: c1 });
				pts2.push({ index, value: c2 });
			}

			ch0.push({ name: scale.name, color: scale.baseHex, points: pts0 });
			ch1.push({ name: scale.name, color: scale.baseHex, points: pts1 });
			ch2.push({ name: scale.name, color: scale.baseHex, points: pts2 });
		}

		return [ch0, ch1, ch2];
	});
</script>

<div class="chromaticity-page">
	<PageHeader title={m.chromaticity_title()} />

	<div class="chromaticity-body">
		<!-- Left: Color Wheel -->
		<div class="wheel-panel">
			<ColorWheel
				colorSpace={colorSpaceState.id}
				lightness={wheelSettings.lightness}
				dots={wheelDots}
				paths={wheelPaths}
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
					isDisabled={wheelSettings.dotMode === 'keyColors'}
					min={0}
					max={100}
					label={m.chromaticity_wheel_lightness()}
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

		<!-- Right: Interpolation Charts -->
		<div class="charts-panel">
			{#each channels as ch, i (ch.key)}
				{@const series = channelData[i]}
				<section class="chart-section">
					<h2 class="chart-label">
						{ch.label}
						<span class="chart-label-space">({colorSpaceLabel})</span>
					</h2>
					<LineChart {series} yDomain={[ch.min, ch.max]} />
				</section>
			{/each}
		</div>
	</div>
</div>

<style>
	.chromaticity-page {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		min-height: 0;
	}
	.chromaticity-body {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--spacing-400);
		overflow-y: auto;
		padding: var(--spacing-400);
		min-height: 0;
	}

	.wheel-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-300);
		align-self: start;
		position: sticky;
		top: 0;
	}

	.wheel-controls {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
		width: 100%;
	}

	.wheel-toggles {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-100);
	}

	.charts-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-400);
		min-width: 0;
	}

	.chart-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-100);
	}

	.chart-label {
		font-size: var(--text-75);
		font-weight: 600;
		color: var(--neutral-subdued-content-color-default);
		margin: 0;
	}

	.chart-label-space {
		font-weight: 400;
		opacity: 0.7;
	}

	@container app (max-width: 767px) {
		.chromaticity-body {
			grid-template-columns: 1fr;
		}

		.wheel-panel {
			position: static;
			align-items: center;
		}
	}
</style>
