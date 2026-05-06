<script lang="ts">
	import { Label } from '../label/index.js';
	import type { ProgressBarProps } from './types.js';

	let {
		value = 0,
		min = 0,
		max = 100,
		isIndeterminate = false,
		size = 'm',
		labelPosition = 'top',
		staticColor,
		label,
		hideLabel = false,
		valueLabel,
		child,
		children,
		ref = $bindable(null),
		class: className,
		...restProps
	}: ProgressBarProps = $props();

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

	const ariaLabel = $derived(hideLabel && typeof label === 'string' ? label : undefined);

	const mergedProps = $derived({
		role: 'progressbar',
		'aria-valuemin': min,
		'aria-valuemax': max,
		'aria-valuenow': isIndeterminate ? undefined : value,
		'aria-valuetext': valueLabel,
		'aria-label': ariaLabel,
		'data-spectrum-progress-bar': '',
		'data-value': isIndeterminate ? undefined : value,
		'data-state': dataState,
		'data-max': max,
		'data-min': min,
		'data-size': size,
		'data-label-position': labelPosition,
		'data-static-color': staticColor,
		class: className,
		...restProps
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{#if label && !hideLabel}
			<div data-spectrum-progress-bar-label>
				<Label>
					{#if typeof label === 'string'}
						{label}
					{:else}
						{@render label()}
					{/if}
				</Label>
			</div>
			{#if !isIndeterminate}
				<span data-spectrum-progress-bar-value>
					{valueLabel !== undefined ? valueLabel : `${Math.round(percentage)}%`}
				</span>
			{/if}
		{/if}

		<div class="track">
			<div class="fill" style="width: {isIndeterminate ? 100 : percentage}%"></div>
		</div>

		{@render children?.()}
	</div>
{/if}

<style>
	[data-spectrum-progress-bar] {
		display: inline-grid;
		box-sizing: border-box;
		position: relative;
		width: 100%;
		font-family: inherit;

		/* Default grid layout (top label) */
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'label value'
			'track track';
		gap: var(--spacing-100) var(--spacing-200);
		align-items: center;
	}

	[data-spectrum-progress-bar][data-label-position='side'] {
		grid-template-columns: auto 1fr auto;
		grid-template-areas: 'label track value';
	}

	[data-spectrum-progress-bar][data-state='indeterminate'] {
		grid-template-columns: 1fr;
		grid-template-areas:
			'label'
			'track';
	}

	[data-spectrum-progress-bar][data-state='indeterminate'][data-label-position='side'] {
		grid-template-columns: auto 1fr;
		grid-template-areas: 'label track';
	}

	[data-spectrum-progress-bar] > [data-spectrum-progress-bar-label] {
		grid-area: label;
		font-size: var(--text-100);
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-progress-bar-value] {
		grid-area: value;
		font-size: var(--text-100);
		color: var(--neutral-content-color-default);
		text-align: right;
	}

	.track {
		grid-area: track;
		box-sizing: border-box;
		border-radius: var(--corner-radius-full);
		background-color: var(--neutral-subtle-background-color-default);
		height: 6px; /* default M size */
		width: 100%;
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	.fill {
		height: 100%;
		border: none;
		background-color: var(--accent-visual-color);
		transition: width var(--duration-normal) var(--ease-default);
	}

	/* Sizes */
	[data-spectrum-progress-bar][data-size='s'] .track {
		height: 4px;
	}
	[data-spectrum-progress-bar][data-size='s'] > [data-spectrum-progress-bar-label],
	[data-spectrum-progress-bar][data-size='s'] [data-spectrum-progress-bar-value] {
		font-size: var(--text-75);
	}

	[data-spectrum-progress-bar][data-size='m'] .track {
		height: 6px;
	}
	[data-spectrum-progress-bar][data-size='m'] > [data-spectrum-progress-bar-label],
	[data-spectrum-progress-bar][data-size='m'] [data-spectrum-progress-bar-value] {
		font-size: var(--text-100);
	}

	[data-spectrum-progress-bar][data-size='l'] .track {
		height: 8px;
	}
	[data-spectrum-progress-bar][data-size='l'] > [data-spectrum-progress-bar-label],
	[data-spectrum-progress-bar][data-size='l'] [data-spectrum-progress-bar-value] {
		font-size: var(--text-200);
	}

	[data-spectrum-progress-bar][data-size='xl'] .track {
		height: 10px;
	}
	[data-spectrum-progress-bar][data-size='xl'] > [data-spectrum-progress-bar-label],
	[data-spectrum-progress-bar][data-size='xl'] [data-spectrum-progress-bar-value] {
		font-size: var(--text-300);
	}

	/* Static Colors */
	[data-spectrum-progress-bar][data-static-color='white'] > [data-spectrum-progress-bar-label],
	[data-spectrum-progress-bar][data-static-color='white'] [data-spectrum-progress-bar-value] {
		color: white;
	}
	[data-spectrum-progress-bar][data-static-color='white'] .track {
		background-color: var(--transparent-white-300);
	}
	[data-spectrum-progress-bar][data-static-color='white'] .fill {
		background-color: var(--transparent-white-900);
	}

	[data-spectrum-progress-bar][data-static-color='black'] > [data-spectrum-progress-bar-label],
	[data-spectrum-progress-bar][data-static-color='black'] [data-spectrum-progress-bar-value] {
		color: black;
	}
	[data-spectrum-progress-bar][data-static-color='black'] .track {
		background-color: var(--transparent-black-300);
	}
	[data-spectrum-progress-bar][data-static-color='black'] .fill {
		background-color: var(--transparent-black-900);
	}

	/* Indeterminate Animation */
	[data-spectrum-progress-bar][data-state='indeterminate'] .fill {
		width: 100%;
		transform-origin: left;
		animation: indeterminate-ltr 1s infinite;
		animation-timing-function: ease-in-out;
		will-change: transform;
		position: relative;
	}

	@keyframes indeterminate-ltr {
		0% {
			transform: translateX(-70%) scaleX(0.7);
		}
		100% {
			transform: translateX(100%) scaleX(0.7);
		}
	}
</style>
