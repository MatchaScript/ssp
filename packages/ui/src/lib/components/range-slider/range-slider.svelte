<script lang="ts">
	import { Slider } from 'bits-ui';
	import { Label } from '../label/index.js';
	import type { RangeSliderProps } from './types.js';

	let {
		value = $bindable({ start: 0, end: 100 }),
		min = 0,
		max = 100,
		step = 1,
		size = 'm',
		label,
		labelPosition = 'top',
		isEmphasized = false,
		isDisabled = false,
		valueLabel,
		hideValue = false,
		class: className,
		...restProps
	}: RangeSliderProps = $props();

	const uid = $props.id();
	const labelId = `${uid}-label`;

	const displayValue = $derived(valueLabel ?? `${value.start} \u2013 ${value.end}`);
</script>

<div
	class={className}
	{...restProps}
	data-spectrum-range-slider
	data-size={size}
	data-label-position={label ? labelPosition : undefined}
	data-disabled={isDisabled || undefined}
	data-emphasized={isEmphasized || undefined}
>
	{#if label}
		<div data-spectrum-range-slider-label id={labelId}>
			<Label>
				{#if typeof label === 'string'}
					{label}
				{:else}
					{@render label()}
				{/if}
			</Label>
		</div>
	{/if}
	{#if !hideValue}
		<span data-spectrum-range-slider-value>
			{displayValue}
		</span>
	{/if}
	<Slider.Root
		type="multiple"
		value={[value.start, value.end]}
		onValueChange={(v) => {
			value = { start: v[0], end: v[1] };
		}}
		{min}
		{max}
		{step}
		disabled={isDisabled}
	>
		{#snippet child({ props, thumbItems })}
			<div
				{...props}
				data-spectrum-range-slider-control
				aria-labelledby={label ? labelId : undefined}
			>
				<Slider.Range>
					{#snippet child({ props: rangeProps })}
						<div {...rangeProps} data-spectrum-range-slider-fill></div>
					{/snippet}
				</Slider.Range>
				{#each thumbItems as item (item.index)}
					<Slider.Thumb index={item.index}>
						{#snippet child({ props: thumbProps, active })}
							<span
								{...thumbProps}
								data-spectrum-range-slider-thumb
								data-active={active || undefined}
							></span>
						{/snippet}
					</Slider.Thumb>
				{/each}
			</div>
		{/snippet}
	</Slider.Root>
</div>

<style>
	/* ── Root ── */
	[data-spectrum-range-slider] {
		--_handle: 20px;
		--_track: 4px;
		--_border-down: 6px;
		--_text: var(--text-100);

		display: inline-grid;
		box-sizing: border-box;
		position: relative;
		width: 100%;
		font-family: inherit;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'label value'
			'control control';
		gap: var(--spacing-75) var(--spacing-200);
		align-items: center;
	}

	[data-spectrum-range-slider][data-size='s'] {
		--_handle: 18px;
		--_border-down: 5px;
		--_text: var(--text-75);
	}

	[data-spectrum-range-slider][data-size='l'] {
		--_handle: 22px;
		--_border-down: 7px;
		--_text: var(--text-200);
	}

	[data-spectrum-range-slider][data-size='xl'] {
		--_handle: 24px;
		--_border-down: 8px;
		--_text: var(--text-300);
	}

	[data-spectrum-range-slider][data-label-position='side'] {
		grid-template-columns: auto 1fr auto;
		grid-template-areas: 'label control value';
	}

	/* ── Label & value ── */
	[data-spectrum-range-slider-label],
	[data-spectrum-range-slider-value] {
		font-size: var(--_text);
	}

	[data-spectrum-range-slider-label] {
		grid-area: label;
	}

	[data-spectrum-range-slider-value] {
		grid-area: value;
		text-align: end;
		font-variant-numeric: tabular-nums;
	}

	/* ── Control (bits-ui Slider.Root — doubles as track container) ── */
	[data-spectrum-range-slider-control] {
		--_fill: var(--neutral-subdued-content-color-default);

		grid-area: control;
		position: relative;
		height: var(--_handle);
	}

	/* Visual rail — inset by half a handle so thumb centers align with rail edges */
	[data-spectrum-range-slider-control]::before {
		content: '';
		position: absolute;
		inset-inline: calc(var(--_handle) / 2);
		top: 50%;
		transform: translateY(-50%);
		height: var(--_track);
		border-radius: var(--corner-radius-full);
		background-color: var(--neutral-subtle-background-color-default);
	}

	/* ── Fill (bits-ui Slider.Range — positioned automatically) ── */
	[data-spectrum-range-slider-fill] {
		/* bits-ui applies: position, left, right */
		top: 50%;
		transform: translateY(-50%);
		height: var(--_track);
		border-radius: var(--corner-radius-full);
		background-color: var(--_fill);
		z-index: 1;
	}

	/* ── Thumb ── */
	[data-spectrum-range-slider-thumb] {
		--_tb-color: var(--neutral-subdued-content-color-default);
		--_tb-width: 2px;

		/* bits-ui applies: position, left, top, translate */
		display: block;
		width: var(--_handle);
		height: var(--_handle);
		border-radius: var(--corner-radius-full);
		border: var(--_tb-width) solid var(--_tb-color);
		background-color: var(--background-base-color);
		box-sizing: border-box;
		z-index: 2;
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-default),
			border-width var(--duration-fast) var(--ease-default);
	}

	/* ── Thumb states ── */
	[data-spectrum-range-slider]:not([data-disabled]) [data-spectrum-range-slider-thumb]:hover {
		--_tb-color: var(--neutral-subdued-content-color-hover);
	}

	[data-spectrum-range-slider]:not([data-disabled]) [data-spectrum-range-slider-thumb][data-active],
	[data-spectrum-range-slider]:not([data-disabled]) [data-spectrum-range-slider-thumb]:active {
		--_tb-color: var(--neutral-subdued-content-color-down);
		--_tb-width: var(--_border-down);
	}

	/* ── Emphasized ── */
	[data-spectrum-range-slider][data-emphasized] [data-spectrum-range-slider-control] {
		--_fill: var(--accent-background-color-default);
	}

	[data-spectrum-range-slider][data-emphasized] [data-spectrum-range-slider-thumb] {
		--_tb-color: var(--accent-background-color-default);
	}

	[data-spectrum-range-slider][data-emphasized]:not([data-disabled])
		[data-spectrum-range-slider-thumb]:hover {
		--_tb-color: var(--accent-background-color-hover);
	}

	[data-spectrum-range-slider][data-emphasized]:not([data-disabled])
		[data-spectrum-range-slider-thumb][data-active],
	[data-spectrum-range-slider][data-emphasized]:not([data-disabled])
		[data-spectrum-range-slider-thumb]:active {
		--_tb-color: var(--accent-background-color-down);
	}

	/* ── Disabled ── */
	[data-spectrum-range-slider][data-disabled] [data-spectrum-range-slider-control] {
		--_fill: var(--disabled-content-color);
	}

	[data-spectrum-range-slider][data-disabled] [data-spectrum-range-slider-control]::before {
		background-color: var(--disabled-background-color);
	}

	[data-spectrum-range-slider][data-disabled] [data-spectrum-range-slider-thumb] {
		--_tb-color: var(--disabled-content-color);
		cursor: default;
	}

	[data-spectrum-range-slider][data-disabled] [data-spectrum-range-slider-label],
	[data-spectrum-range-slider][data-disabled] [data-spectrum-range-slider-value] {
		color: var(--disabled-content-color);
	}

	/* ── Focus ring ── */
	[data-spectrum-range-slider-thumb]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}
</style>
