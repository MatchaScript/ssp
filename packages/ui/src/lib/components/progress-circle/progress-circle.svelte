<script lang="ts">
	import type { ProgressCircleProps } from './types.js';

	let {
		value = 0,
		min = 0,
		max = 100,
		isIndeterminate = false,
		size = 'm',
		staticColor,
		child,
		ref = $bindable(null),
		class: className,
		...restProps
	}: ProgressCircleProps = $props();

	const resolvedMin = $derived(min ?? 0);
	const resolvedMax = $derived(max ?? 100);
	const resolvedValue = $derived(value ?? 0);
	const range = $derived(resolvedMax - resolvedMin);
	const percentage = $derived(
		isIndeterminate || range <= 0
			? 0
			: Math.max(0, Math.min(100, ((resolvedValue - resolvedMin) / range) * 100))
	);

	const dataState = $derived<'indeterminate' | 'loading' | 'loaded'>(
		isIndeterminate ? 'indeterminate' : resolvedValue >= resolvedMax ? 'loaded' : 'loading'
	);

	const containerSize = $derived(size === 's' ? 16 : size === 'l' ? 64 : 32);
	const strokeWidth = $derived(size === 's' ? 2 : size === 'l' ? 4 : 3);
	const radius = $derived((containerSize - strokeWidth) / 2);

	const mergedProps = $derived({
		role: 'progressbar',
		'aria-valuemin': min,
		'aria-valuemax': max,
		'aria-valuenow': isIndeterminate ? undefined : value,
		'data-spectrum-progress-circle': '',
		'data-value': isIndeterminate ? undefined : value,
		'data-state': dataState,
		'data-size': size,
		'data-static-color': staticColor,
		class: className,
		...restProps
	});
</script>

{#snippet circleContent()}
	<svg fill="none" viewBox={`0 0 ${containerSize} ${containerSize}`}>
		<circle
			class="track"
			cx={containerSize / 2}
			cy={containerSize / 2}
			r={radius}
			stroke-width={strokeWidth}
		/>
		<circle
			class="fill"
			cx={containerSize / 2}
			cy={containerSize / 2}
			r={radius}
			stroke-width={strokeWidth}
			pathLength="100"
			stroke-dasharray="100 200"
			stroke-dashoffset={isIndeterminate ? undefined : 100 - percentage}
			stroke-linecap="round"
		/>
	</svg>
{/snippet}

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render circleContent()}
	</div>
{/if}

<style>
	[data-spectrum-progress-circle] {
		--track-color: var(--gray-300);
		--static-white-track-color: var(--transparent-white-300);
		--static-white-track-indicator-color: var(--transparent-white-900);
		--static-black-track-color: var(--transparent-black-300);
		--static-black-track-indicator-color: var(--transparent-black-900);

		display: inline-block;
		position: relative;
		inline-size: 32px;
		block-size: 32px;
		place-self: center;
	}

	[data-spectrum-progress-circle][data-size='s'] {
		inline-size: 16px;
		block-size: 16px;
	}

	[data-spectrum-progress-circle][data-size='l'] {
		inline-size: 64px;
		block-size: 64px;
	}

	.track {
		stroke: var(--track-color);
		fill: none;
	}

	.fill {
		stroke: var(--accent-content-color-default);
		fill: none;
		transform: rotate(-90deg);
		transform-origin: center;
	}

	[data-spectrum-progress-circle][data-state='indeterminate'] .fill {
		animation:
			fills-rotate 1s cubic-bezier(0.6, 0.1, 0.3, 0.9) infinite,
			dashoffset-animation 1s cubic-bezier(0.25, 0.1, 0.25, 1.3) infinite;
		will-change: transform;
	}

	/* Static Colors */
	[data-spectrum-progress-circle][data-static-color='white'] .track {
		stroke: var(--static-white-track-color);
	}
	[data-spectrum-progress-circle][data-static-color='white'] .fill {
		stroke: var(--static-white-track-indicator-color);
	}

	[data-spectrum-progress-circle][data-static-color='black'] .track {
		stroke: var(--static-black-track-color);
	}
	[data-spectrum-progress-circle][data-static-color='black'] .fill {
		stroke: var(--static-black-track-indicator-color);
	}

	/* Forced Colors */
	@media (forced-colors: active) {
		.track {
			stroke: Canvas;
		}
		.fill {
			stroke: Highlight;
		}
	}

	@keyframes fills-rotate {
		0% {
			transform: rotate(-90deg);
		}
		100% {
			transform: rotate(270deg);
		}
	}

	@keyframes dashoffset-animation {
		0%,
		100% {
			stroke-dashoffset: 75;
		}
		30% {
			stroke-dashoffset: 20;
		}
	}
</style>
