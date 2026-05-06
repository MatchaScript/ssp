<script lang="ts">
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { getColorEditorContext } from '$lib/contexts/color-editor';
	import { m } from '$lib/paraglide/messages';
	import ColorWheel from '$lib/components/features/color-wheel/color-wheel.svelte';
	import { LineChart } from '$lib/components/features/line-chart';
	import { COLOR_SPACES } from '$lib/types/color-space';

	const ctx = getColorEditorContext();
</script>

<div class="detail-page">
	<!-- Color Wheel + Preview -->
	<section class="section">
		<div class="wheel-area">
			<ColorWheel
				colorSpace={colorSpaceState.id}
				lightness={70}
				dots={ctx.wheelDots}
				paths={ctx.wheelPaths}
				showPaths
				size={170}
			/>
			<div class="wheel-side">
				<h2 class="section-heading">{m.create_preview()}</h2>
				{#if ctx.showOwn && ctx.previewSwatches.length > 0}
					<div class="preview-gradient" style:background={ctx.gradientCss}></div>
					<div class="preview-swatches">
						{#each ctx.previewSwatches as swatch, i (i)}
							<div
								class="preview-swatch"
								style:background-color={swatch}
								title={swatch}
							></div>
						{/each}
					</div>
				{/if}
				{#if ctx.showAdobe && ctx.adobeSwatches.length > 0}
					<h2 class="section-heading">{ctx.adobeRefColor} (Adobe)</h2>
					<div class="preview-swatches">
						{#each ctx.adobeSwatches as swatch, i (i)}
							<div
								class="preview-swatch"
								style:background-color={swatch}
								title={swatch}
							></div>
						{/each}
					</div>
				{/if}
				{#if ctx.showHelmlab && ctx.helmlabSwatches.length > 0}
					<h2 class="section-heading">{ctx.colorName} (Helmlab)</h2>
					<div class="preview-swatches">
						{#each ctx.helmlabSwatches as swatch, i (i)}
							<div
								class="preview-swatch"
								style:background-color={swatch}
								title={swatch}
							></div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Channel Charts -->
	{#if ctx.channelData[0].length > 0}
		<section class="section charts-section">
			{#each ctx.channels as ch, i (ch.key)}
				{@const series = ctx.channelData[i]}
				<div class="chart-block">
					<h3 class="chart-label">
						{ch.label}
						<span class="chart-label-space">({ctx.colorSpaceLabel})</span>
					</h3>
					<LineChart {series} yDomain={[ch.min, ch.max]} height={140} />
				</div>
			{/each}
		</section>
	{/if}
</div>

<style>
	.detail-page {
		padding: var(--spacing-400);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-500);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
	}

	.section-heading {
		font-size: var(--text-100);
		font-weight: 600;
		color: var(--neutral-subdued-content-color-default);
		margin: 0;
	}

	/* ── Preview gradient + swatches ── */

	.preview-gradient {
		width: 100%;
		height: 2rem;
		border-radius: var(--corner-radius-200);
		border: 1px solid var(--gray-200);
	}

	.preview-swatches {
		display: flex;
		gap: 2px;
	}

	.preview-swatch {
		flex: 1;
		aspect-ratio: 1;
		border-radius: var(--corner-radius-75);
		border: 1px solid var(--gray-200);
	}

	/* ── Color wheel ── */

	.wheel-area {
		display: flex;
		gap: var(--spacing-300);
		align-items: start;
	}

	.wheel-side {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
		flex: 1;
		min-width: 8rem;
	}

	/* ── Charts ── */

	.charts-section {
		gap: var(--spacing-300);
	}

	.chart-block {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-75);
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

	/* ── Responsive ── */

	@container app (max-width: 960px) {
		.wheel-area {
			flex-direction: column;
			align-items: center;
		}

		.wheel-side {
			width: 100%;
		}
	}
</style>
