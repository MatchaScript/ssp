<script lang="ts">
	import { converter } from 'culori';
	import { configState } from '$lib/stores/config.svelte';
	import { themeColorsState } from '$lib/stores/theme-colors.svelte';
	import { NumberField } from '@matchalatte/ssp-ui/components/number-field';
	import { ActionButton, Text } from '@matchalatte/ssp-ui';
	import { Icon, Trash2, Plus } from '@matchalatte/ssp-ui/components/icon';
	import {
		Picker,
		PickerTrigger,
		PickerContent,
		PickerItem
	} from '@matchalatte/ssp-ui/components/picker';
	import { LineChart } from '$lib/components/features/line-chart';
	import { m } from '$lib/paraglide/messages';

	const toLch = converter('lch');

	// ── Preview color selection ──

	const colorNames = $derived(configState.colors.map((c) => c.name));
	let previewColorName = $state('');

	$effect(() => {
		if (!previewColorName && colorNames.length > 0) {
			previewColorName = colorNames[0];
		}
	});

	// ── Contrast targets from config ──

	const targets = $derived(configState.raw.colorContrastTargets);

	// ── Computed lightness & swatches from theme output ──

	interface StopData {
		index: number;
		ratio: number;
		lightness: number;
		hex: string;
	}

	const stops = $derived.by<StopData[]>(() => {
		const scale = themeColorsState.output.colorScales.find((s) => s.name === previewColorName);
		return targets.map((ratio, i) => {
			const generated = scale?.values[i];
			const hex = generated?.value ?? '#000000';
			const lch = toLch(hex);
			return {
				index: i,
				ratio,
				lightness: Math.round((lch?.l ?? 0) * 100) / 100,
				hex
			};
		});
	});

	// ── Gradient bar ──

	const gradientCss = $derived.by(() => {
		if (stops.length === 0) return 'var(--gray-200)';
		const colors = stops.map((s) => s.hex);
		return `linear-gradient(to bottom, ${colors.join(', ')})`;
	});

	// ── Actions ──

	function addStop() {
		const max = targets.length > 0 ? Math.max(...targets) : 1;
		configState.addContrastTarget(Math.round((max + 1) * 100) / 100);
	}

	function removeStop(index: number) {
		configState.removeContrastTarget(index);
	}

	function sortStops() {
		configState.sortContrastTargets();
	}

	function distributeRatios() {
		if (targets.length < 2) return;
		const min = Math.min(...targets);
		const max = Math.max(...targets);
		const distributed = targets.map((_, i) => {
			const t = i / (targets.length - 1);
			return Math.round((min * (1 - t) + max * t) * 1000) / 1000;
		});
		configState.setContrastTargets(distributed);
	}

	function distributeLightness() {
		if (stops.length < 2) return;

		// Approximate evenly-distributed lightness by linearly interpolating between
		// the smallest and largest contrast ratios in the current targets.
		const sortedRatios = [...targets].sort((a, b) => a - b);
		const minR = sortedRatios[0];
		const maxR = sortedRatios[sortedRatios.length - 1];
		const distributed = targets.map((_, i) => {
			const t = i / (targets.length - 1);
			return Math.round((minR * (1 - t) + maxR * t) * 1000) / 1000;
		});
		configState.setContrastTargets(distributed);
	}

	// ── Chart data ──

	interface ChartPoint {
		index: number;
		value: number;
	}

	interface ChartSeries {
		name: string;
		color: string;
		points: ChartPoint[];
	}

	const contrastSeries = $derived.by<ChartSeries[]>(() => {
		if (stops.length === 0) return [];
		const baseHex = configState.raw.colors[previewColorName]?.baseHex ?? '#666';
		return [
			{
				name: previewColorName,
				color: baseHex,
				points: stops.map((s, i) => ({ index: i + 1, value: s.ratio }))
			}
		];
	});

	const lightnessSeries = $derived.by<ChartSeries[]>(() => {
		if (stops.length === 0) return [];
		const baseHex = configState.raw.colors[previewColorName]?.baseHex ?? '#666';
		return [
			{
				name: previewColorName,
				color: baseHex,
				points: stops.map((s, i) => ({ index: i + 1, value: s.lightness }))
			}
		];
	});

	// ── Contrast ratio range for chart ──

	const contrastMax = $derived(Math.max(21, ...targets.map((t) => Math.ceil(t))));
</script>

<div class="lightness-page">
	<!-- Header -->
	<div class="page-header">
		<h1 class="page-title">{m.lightness_title()}</h1>
		<div class="header-controls">
			<div class="header-picker">
				<Picker
					bind:selectedKey={previewColorName}
					label={m.lightness_color_preview()}
					selectionMode="single"
					size="s"
				>
					<PickerTrigger />
					<PickerContent>
						{#each colorNames as name (name)}
							<PickerItem value={name} label={name} />
						{/each}
					</PickerContent>
				</Picker>
			</div>
		</div>
	</div>

	<div class="page-body">
		<!-- Left: Stop list -->
		<div class="stops-panel">
			<div class="stops-header">
				<h2 class="section-heading">{m.lightness_stops_heading()}</h2>
				<div class="stops-actions">
					<ActionButton size="s" onclick={addStop}>
						<Icon icon={Plus} />
						<Text>{m.lightness_add()}</Text>
					</ActionButton>
					<ActionButton size="s" isQuiet onclick={sortStops}>
						<Text>{m.lightness_sort()}</Text>
					</ActionButton>
					<ActionButton size="s" isQuiet onclick={distributeRatios}>
						<Text>{m.lightness_distribute_ratios()}</Text>
					</ActionButton>
					<ActionButton size="s" isQuiet onclick={distributeLightness}>
						<Text>{m.lightness_distribute_lightness()}</Text>
					</ActionButton>
				</div>
			</div>

			<!-- Gradient + Stop rows side by side -->
			<div class="stops-body">
				<div class="gradient-bar" style:background={gradientCss}>
					{#each stops as stop, i (i)}
						{@const pct = stops.length > 1 ? (i / (stops.length - 1)) * 100 : 50}
						<div class="gradient-dot" style:top="{pct}%" title="L* {stop.lightness}"></div>
					{/each}
				</div>

				<div class="stop-list">
					<div class="stop-list-header">
						<span class="col-index">#</span>
						<span class="col-swatch"></span>
						<span class="col-ratio">{m.lightness_contrast_ratio()}</span>
						<span class="col-lightness">{m.lightness_value()}</span>
						<span class="col-action"></span>
					</div>
					{#each stops as stop, i (i)}
						<div class="stop-row">
							<span class="col-index stop-index">{i + 1}</span>
							<div class="col-swatch stop-swatch" style:background-color={stop.hex}></div>
							<div class="col-ratio">
								<NumberField
									bind:value={configState.raw.colorContrastTargets[i]}
									min={1}
									max={21}
									step={0.01}
									hideStepper
									hideLabel
									label={m.lightness_contrast_ratio()}
									size="s"
								/>
							</div>
							<span class="col-lightness stop-lightness">{stop.lightness}</span>
							<div class="col-action">
								<ActionButton
									isQuiet
									size="s"
									disabled={targets.length < 2}
									aria-label={m.lightness_remove()}
									title={m.lightness_remove()}
									onclick={() => removeStop(i)}
								>
									<Icon icon={Trash2} />
								</ActionButton>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right: Charts -->
		<div class="charts-panel">
			<section class="chart-section">
				<h3 class="chart-label">{m.lightness_chart_contrast()}</h3>
				<LineChart series={contrastSeries} yDomain={[0, contrastMax]} height={200} />
			</section>
			<section class="chart-section">
				<h3 class="chart-label">{m.lightness_chart_lightness()}</h3>
				<LineChart series={lightnessSeries} yDomain={[0, 100]} height={200} />
			</section>
		</div>
	</div>
</div>

<style>
	.lightness-page {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		min-height: 0;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-300);
		padding: var(--spacing-200) var(--spacing-400);
		border-bottom: 1px solid var(--gray-200);
	}

	.page-title {
		flex: 1;
		font-size: var(--text-200);
		font-weight: 600;
		color: var(--neutral-content-color-default);
		margin: 0;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-200);
	}

	.header-picker {
		width: 10rem;
	}

	/* ── Body layout ── */

	.page-body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		overflow: hidden;
		min-height: 0;
	}

	/* ── Stops panel (left) ── */

	.stops-panel {
		overflow-y: auto;
		padding: var(--spacing-300);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-300);
		border-right: 1px solid var(--gray-200);
	}

	.stops-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-200);
	}

	.stops-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-75);
	}

	.section-heading {
		font-size: var(--text-100);
		font-weight: 600;
		color: var(--neutral-subdued-content-color-default);
		margin: 0;
	}

	/* ── Gradient + list side by side ── */

	.stops-body {
		display: grid;
		grid-template-columns: 1.25rem 1fr;
		gap: var(--spacing-200);
		flex: 1;
		min-height: 0;
	}

	.gradient-bar {
		position: relative;
		border-radius: var(--corner-radius-200);
		border: 1px solid var(--gray-200);
	}

	.gradient-dot {
		position: absolute;
		left: 50%;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--background-base-color);
		border: 2px solid var(--neutral-content-color-default);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	/* ── Stop list ── */

	.stop-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.stop-list-header,
	.stop-row {
		display: grid;
		grid-template-columns: 2rem 1.5rem 1fr 4rem auto;
		align-items: center;
		gap: var(--spacing-100);
		padding: var(--spacing-75) var(--spacing-100);
	}

	.stop-list-header {
		font-size: var(--text-75);
		font-weight: 600;
		color: var(--neutral-subdued-content-color-default);
		border-bottom: 1px solid var(--gray-200);
		padding-bottom: var(--spacing-100);
	}

	.stop-row {
		border-radius: var(--corner-radius-100);
		transition: background-color var(--duration-fast) var(--ease-default);
	}

	.stop-row:hover {
		background-color: var(--gray-100);
	}

	.stop-index {
		font-size: var(--text-75);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--neutral-subdued-content-color-default);
		text-align: end;
	}

	.stop-swatch {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: var(--corner-radius-75);
		border: 1px solid var(--gray-200);
	}

	.stop-lightness {
		font-size: var(--text-75);
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		color: var(--neutral-subdued-content-color-default);
		text-align: end;
	}

	/* ── Charts panel (right) ── */

	.charts-panel {
		overflow-y: auto;
		padding: var(--spacing-400);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-500);
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

	/* ── Responsive ── */

	@container app (max-width: 768px) {
		.page-body {
			grid-template-columns: 1fr;
			overflow-y: auto;
		}

		.stops-panel {
			border-right: none;
			border-bottom: 1px solid var(--gray-200);
			overflow-y: visible;
		}

		.charts-panel {
			overflow-y: visible;
		}
	}
</style>
