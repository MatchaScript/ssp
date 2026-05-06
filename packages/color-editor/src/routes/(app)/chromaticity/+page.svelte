<script lang="ts">
	import { configState } from '$lib/stores/config.svelte';
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { Theme, Color, BackgroundColor } from '@adobe/leonardo-contrast-colors';
	import { buildColorKeys } from '$lib/utils/color-keys';
	import { LineChart } from '$lib/components/features/line-chart';
	import { Picker, PickerTrigger, PickerContent, PickerItem } from '@ssp/ui/components/picker';
	import { Slider } from '@ssp/ui/components/slider';
	import { Switch } from '@ssp/ui/components/switch';
	import { m } from '$lib/paraglide/messages';
	import ColorWheel from '$lib/components/features/color-wheel/color-wheel.svelte';
	import { COLOR_SPACES } from '$lib/types/color-space';
	import type { CssColor } from '@adobe/leonardo-contrast-colors';

	const bg = new BackgroundColor({
		name: 'bg',
		colorKeys: ['#888888' as CssColor],
		colorSpace: 'OKLCH',
		ratios: [1]
	});
	const STORAGE_KEY = 'chromaticity-settings';

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

	let wheelLightness = $state(70);
	let showPaths = $state(typeof saved.showPaths === 'boolean' ? saved.showPaths : true);
	let showHarmonyLines = $state(typeof saved.showHarmonyLines === 'boolean' ? saved.showHarmonyLines : false);
	let showGamutBoundary = $state(typeof saved.showGamutBoundary === 'boolean' ? saved.showGamutBoundary : false);
	let snapLightness = $state(typeof saved.snapLightness === 'boolean' ? saved.snapLightness : true);
	let dotMode = $state<DotMode>(saved.dotMode === 'crossSection' ? 'crossSection' : 'keyColors');

	$effect(() => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ dotMode, showPaths, showHarmonyLines, showGamutBoundary, snapLightness })
		);
	});

	const colorSpaceLabel = $derived(COLOR_SPACES[colorSpaceState.id].label);
	const spaceConfig = $derived(COLOR_SPACES[colorSpaceState.id]);
	const channels = $derived(spaceConfig.channels);

	// ── Scale generation (shared between wheel + charts) ──

	interface ScaleData {
		name: string;
		baseHex: string;
		swatches: string[];
	}

	const contrastTargets = $derived(configState.raw.colorContrastTargets);
	const previewLightness = $derived(configState.raw.themes.light.lightness);
	const levelCount = $derived(contrastTargets?.length ?? 16);

	const scales = $derived.by<ScaleData[]>(() => {
		if (!contrastTargets?.length) return [];
		return configState.colors.map((entry) => {
			const colorHue = new Color({
				name: entry.name,
				colorKeys: buildColorKeys(entry),
				colorSpace: 'CAM02',
				ratios: [...contrastTargets]
			});
			const theme = new Theme({
				colors: [bg, colorHue],
				backgroundColor: bg,
				lightness: previewLightness,
				output: 'HEX',
				formula: 'wcag2'
			});
			const [, ...colorEntries] = theme.contrastColors;
			const match = colorEntries.find((c) => c.name === entry.name);
			const swatches = match ? match.values.map((v) => v.value) : [];
			return { name: entry.name, baseHex: entry.baseHex, swatches };
		});
	});

	// ── Color wheel dots ──

	const dotModeLabel = $derived(
		dotMode === 'keyColors' ? m.chromaticity_dots_keys() : m.chromaticity_dots_cross()
	);

	// Tick positions (0–100) derived from each swatch level's actual lightness
	// in the current display color space, averaged across scales. Non-uniform
	// because Leonardo picks per-hue lightness per contrast ratio.
	const crossSectionTicks = $derived.by<number[]>(() => {
		if (!scales.length || !levelCount) return [];
		const lMax = spaceConfig.channels[2].max;
		const ticks: number[] = [];
		for (let i = 0; i < levelCount; i++) {
			let sum = 0;
			let n = 0;
			for (const s of scales) {
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

	// Snap the slider to the nearest tick in cross-section mode (opt-in)
	$effect(() => {
		if (!snapLightness || dotMode !== 'crossSection' || crossSectionTicks.length === 0) return;
		const idx = nearestTickIdx(wheelLightness, crossSectionTicks);
		const snapped = crossSectionTicks[idx];
		if (Math.abs(snapped - wheelLightness) > 1e-6) {
			wheelLightness = snapped;
		}
	});

	const wheelDots = $derived.by(() => {
		if (dotMode === 'keyColors') {
			return configState.colors.flatMap((entry) => {
				const dots = [{ hex: entry.baseHex, name: entry.name }];
				for (const hex of Object.values(entry.scaleAnchors)) {
					dots.push({ hex, name: entry.name });
				}
				return dots;
			});
		}
		// crossSection: pick the swatch whose actual L matches the slider.
		// Ticks are built from swatches[i] directly, so tickIdx === swatch index.
		if (!crossSectionTicks.length) return [];
		const idx = nearestTickIdx(wheelLightness, crossSectionTicks);
		return scales.map((s) => ({
			hex: s.swatches[idx],
			name: s.name
		}));
	});

	// ── Color wheel interpolation paths ──

	const wheelPaths = $derived(
		scales.map((s) => ({ name: s.name, swatches: s.swatches }))
	);

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
	<div class="chromaticity-header">
		<h1 class="chromaticity-title">{m.chromaticity_title()}</h1>
	</div>

	<div class="chromaticity-body">
		<!-- Left: Color Wheel -->
		<div class="wheel-panel">
			<ColorWheel
				colorSpace={colorSpaceState.id}
				lightness={wheelLightness}
				dots={wheelDots}
				paths={wheelPaths}
				{showPaths}
				{showHarmonyLines}
				{showGamutBoundary}
			/>
			<div class="wheel-controls">
				<Picker
					bind:selectedKey={dotMode}
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
					bind:value={wheelLightness}
					isDisabled={dotMode === 'keyColors'}
					min={0}
					max={100}
					label={m.chromaticity_wheel_lightness()}
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
	.chromaticity-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-300);
		padding: var(--spacing-200) var(--spacing-400);
		border-bottom: 1px solid var(--gray-200);
	}

	.chromaticity-title {
		flex: 1;
		font-size: var(--text-200);
		font-weight: 600;
		color: var(--neutral-content-color-default);
		margin: 0;
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
