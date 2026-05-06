<script lang="ts">
	import { Label } from '../label/index.js';
	import type { MeterProps } from './types.js';

	let {
		value = 0,
		max = 100,
		min = 0,
		size = 'm',
		variant = 'informative',
		labelPosition = 'top',
		label,
		valueLabel,
		staticColor,
		child,
		children,
		ref = $bindable(null),
		class: className,
		...restProps
	}: MeterProps = $props();

	const resolvedMin = $derived(min ?? 0);
	const resolvedMax = $derived(max ?? 100);
	const resolvedValue = $derived(value ?? 0);
	const range = $derived(resolvedMax - resolvedMin);
	const percentage = $derived(
		range <= 0 ? 0 : Math.max(0, Math.min(100, ((resolvedValue - resolvedMin) / range) * 100))
	);

	const mergedProps = $derived({
		role: 'meter',
		value,
		'aria-valuemin': min,
		'aria-valuemax': max,
		'aria-valuenow': value,
		'data-value': value,
		'data-max': max,
		'data-min': min,
		'data-meter-root': '',
		'data-spectrum-meter': '',
		'data-size': size,
		'data-variant': variant,
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
		{#if label}
			<div data-spectrum-meter-label>
				<Label>
					{#if typeof label === 'string'}
						{label}
					{:else}
						{@render label()}
					{/if}
				</Label>
			</div>
			<span data-spectrum-meter-value>
				{valueLabel !== undefined ? valueLabel : `${Math.round(percentage)}%`}
			</span>
		{/if}
		<div class="track">
			<div class="fill" style="width: {percentage}%"></div>
		</div>
		{@render children?.()}
	</div>
{/if}

<style>
	[data-spectrum-meter] {
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

	[data-spectrum-meter][data-label-position='side'] {
		grid-template-columns: auto 1fr auto;
		grid-template-areas: 'label track value';
	}

	[data-spectrum-meter] > [data-spectrum-meter-label] {
		grid-area: label;
		font-size: var(--text-100);
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-meter-value] {
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
		border-radius: var(--corner-radius-full);
		transition: width var(--duration-normal) var(--ease-default);
	}

	/* Variants */
	[data-spectrum-meter][data-variant='informative'] .fill {
		background-color: var(--informative-visual-color);
	}

	[data-spectrum-meter][data-variant='positive'] .fill {
		background-color: var(--positive-visual-color);
	}

	[data-spectrum-meter][data-variant='notice'] .fill {
		background-color: var(--notice-visual-color);
	}

	[data-spectrum-meter][data-variant='negative'] .fill {
		background-color: var(--negative-visual-color);
	}

	/* Sizes */
	[data-spectrum-meter][data-size='s'] .track {
		height: 4px;
	}
	[data-spectrum-meter][data-size='s'] > [data-spectrum-meter-label],
	[data-spectrum-meter][data-size='s'] [data-spectrum-meter-value] {
		font-size: var(--text-75);
	}

	[data-spectrum-meter][data-size='m'] .track {
		height: 6px;
	}
	[data-spectrum-meter][data-size='m'] > [data-spectrum-meter-label],
	[data-spectrum-meter][data-size='m'] [data-spectrum-meter-value] {
		font-size: var(--text-100);
	}

	[data-spectrum-meter][data-size='l'] .track {
		height: 8px;
	}
	[data-spectrum-meter][data-size='l'] > [data-spectrum-meter-label],
	[data-spectrum-meter][data-size='l'] [data-spectrum-meter-value] {
		font-size: var(--text-200);
	}

	[data-spectrum-meter][data-size='xl'] .track {
		height: 10px;
	}
	[data-spectrum-meter][data-size='xl'] > [data-spectrum-meter-label],
	[data-spectrum-meter][data-size='xl'] [data-spectrum-meter-value] {
		font-size: var(--text-300);
	}

	/* Static Colors */
	[data-spectrum-meter][data-static-color='white'] > [data-spectrum-meter-label],
	[data-spectrum-meter][data-static-color='white'] [data-spectrum-meter-value] {
		color: white;
	}
	[data-spectrum-meter][data-static-color='white'] .track {
		background-color: var(--transparent-white-300);
	}
	[data-spectrum-meter][data-static-color='white'] .fill {
		background-color: var(--transparent-white-900);
	}

	[data-spectrum-meter][data-static-color='black'] > [data-spectrum-meter-label],
	[data-spectrum-meter][data-static-color='black'] [data-spectrum-meter-value] {
		color: black;
	}
	[data-spectrum-meter][data-static-color='black'] .track {
		background-color: var(--transparent-black-300);
	}
	[data-spectrum-meter][data-static-color='black'] .fill {
		background-color: var(--transparent-black-900);
	}
</style>
