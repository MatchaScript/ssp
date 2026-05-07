<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { line, curveCatmullRom } from 'd3-shape';

	interface Point {
		index: number;
		value: number;
	}

	interface Series {
		name: string;
		color: string;
		points: Point[];
		variant?: 'default' | 'adobe';
	}

	let {
		series,
		yDomain,
		height = 200
	}: {
		series: Series[];
		yDomain: [number, number];
		height?: number;
	} = $props();

	let containerWidth = $state(0);

	const margin = { top: 8, right: 8, bottom: 16, left: 36 };
	const innerWidth = $derived(Math.max(0, containerWidth - margin.left - margin.right));
	const innerHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	const xDomain = $derived.by<[number, number]>(() => {
		const indices = series.flatMap((s) => s.points.map((p) => p.index));
		if (indices.length === 0) return [0, 1];
		return [Math.min(...indices), Math.max(...indices)];
	});

	const xScale = $derived(scaleLinear().domain(xDomain).range([0, innerWidth]));
	const yScale = $derived(scaleLinear().domain(yDomain).range([innerHeight, 0]).nice());

	const yTicks = $derived(yScale.ticks(5));
	const xTicks = $derived(xScale.ticks(8));
	const yFormat = $derived(yScale.tickFormat(5));

	const lineGenerator = $derived(
		line<Point>()
			.x((p) => xScale(p.index))
			.y((p) => yScale(p.value))
			.curve(curveCatmullRom)
	);
</script>

<div class="line-chart" bind:clientWidth={containerWidth}>
	{#if containerWidth > 0}
		<svg width={containerWidth} {height}>
			<g transform="translate({margin.left},{margin.top})">
				<!-- Grid -->
				{#each yTicks as tick (tick)}
					<line class="grid-line" x1={0} y1={yScale(tick)} x2={innerWidth} y2={yScale(tick)} />
				{/each}
				{#each xTicks as tick (tick)}
					<line class="grid-line" x1={xScale(tick)} y1={0} x2={xScale(tick)} y2={innerHeight} />
				{/each}

				<!-- X axis (bottom) -->
				<line class="axis-x" x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} />

				<!-- Y tick labels -->
				{#each yTicks as tick (tick)}
					<text
						class="tick-label"
						x={-8}
						y={yScale(tick)}
						text-anchor="end"
						dominant-baseline="central">{yFormat(tick)}</text
					>
				{/each}

				<!-- Data lines -->
				{#each series as s (s.name)}
					{@const ref = s.variant && s.variant !== 'default'}
					<path
						class="data-line"
						d={lineGenerator(s.points) ?? ''}
						stroke={ref ? 'rgba(220, 80, 70, 0.85)' : s.color}
						stroke-dasharray={ref ? '6 4' : undefined}
					/>
				{/each}
			</g>
		</svg>
	{/if}
</div>

<style>
	.line-chart {
		width: 100%;
	}

	svg {
		display: block;
	}

	.grid-line {
		stroke: var(--gray-300);
		shape-rendering: crispEdges;
	}

	.axis-x {
		stroke: var(--neutral-content-color-default);
		stroke-width: 3px;
		stroke-linecap: round;
		shape-rendering: crispEdges;
	}

	.tick-label {
		fill: var(--neutral-subdued-content-color-default);
		font-size: var(--text-75);
	}

	.data-line {
		fill: none;
		stroke-width: 2;
	}
</style>
