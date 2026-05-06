<script lang="ts">
	import { Label } from '../label/index.js';
	import type { SliderProps } from './types.js';

	let {
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		size = 'm',
		label,
		labelPosition = 'top',
		hasFill = false,
		fillStart,
		isEmphasized = false,
		isDisabled = false,
		valueLabel,
		hideValue = false,
		id,
		class: className,
		...restProps
	}: SliderProps = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? uid);
	const labelId = $derived(`${inputId}-label`);

	const range = $derived(max - min);
	const percentage = $derived(range <= 0 ? 0 : ((value - min) / range) * 100);
	const resolvedFillStart = $derived(fillStart ?? min);
	const fillStartPct = $derived(
		range <= 0 ? 0 : Math.max(0, Math.min(100, ((resolvedFillStart - min) / range) * 100))
	);
	const clampedPct = $derived(Math.max(0, Math.min(100, percentage)));
	const fillLeft = $derived(Math.min(clampedPct, fillStartPct));
	const fillWidth = $derived(Math.abs(clampedPct - fillStartPct));
	const displayValue = $derived(valueLabel ?? `${value}`);
</script>

<div
	class={className}
	data-spectrum-slider
	data-size={size}
	data-label-position={label ? labelPosition : undefined}
	data-disabled={isDisabled || undefined}
	data-has-fill={hasFill || undefined}
	data-emphasized={isEmphasized || undefined}
>
	{#if label}
		<div data-spectrum-slider-label id={labelId}>
			<Label for={inputId}>
				{#if typeof label === 'string'}
					{label}
				{:else}
					{@render label()}
				{/if}
			</Label>
		</div>
	{/if}
	{#if !hideValue}
		<span data-spectrum-slider-value>
			{displayValue}
		</span>
	{/if}
	<div data-spectrum-slider-control>
		<div data-spectrum-slider-track>
			{#if hasFill && fillWidth > 0}
				<div
					data-spectrum-slider-fill
					style:--_fill-start={fillLeft / 100}
					style:--_fill-size={fillWidth / 100}
				></div>
			{/if}
		</div>
		<input
			type="range"
			id={inputId}
			bind:value
			{min}
			{max}
			{step}
			disabled={isDisabled}
			aria-labelledby={label ? labelId : undefined}
			aria-valuetext={valueLabel}
			{...restProps}
		/>
	</div>
</div>

<style>
	/* ── Root ── */
	[data-spectrum-slider] {
		--_handle: 20px;
		--_control-height: var(--spacing-500);
		--_track-height: var(--spacing-75);
		--_text: var(--text-100);
		--_gap: var(--spacing-300);

		display: inline-grid;
		box-sizing: border-box;
		position: relative;
		width: 100%;
		font-family: inherit;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'label value'
			'control control';
		gap: var(--spacing-75) var(--_gap);
		align-items: center;
	}

	[data-spectrum-slider][data-size='s'] {
		--_handle: 18px;
		--_control-height: var(--spacing-400);
		--_text: var(--text-75);
	}

	[data-spectrum-slider][data-size='l'] {
		--_handle: 22px;
		--_control-height: var(--spacing-600);
		--_text: var(--text-200);
		--_gap: 20px;
	}

	[data-spectrum-slider][data-size='xl'] {
		--_handle: 24px;
		--_control-height: var(--spacing-700);
		--_text: var(--text-300);
		--_gap: var(--spacing-400);
	}

	[data-spectrum-slider][data-label-position='side'] {
		grid-template-columns: auto 1fr auto;
		grid-template-areas: 'label control value';
	}

	/* ── Handle state — scoped to control so label hover does not trigger ── */
	[data-spectrum-slider-control] {
		--_border-color: var(--neutral-subdued-content-color-default);
		--_bg: var(--background-base-color);
		--_fill-color: var(--neutral-subdued-content-color-default);

		grid-area: control;
		position: relative;
		height: var(--_control-height);
		display: flex;
		align-items: center;
	}

	[data-spectrum-slider]:not([data-disabled]) [data-spectrum-slider-control]:hover {
		--_border-color: var(--neutral-subdued-content-color-hover);
	}

	[data-spectrum-slider]:not([data-disabled]) [data-spectrum-slider-control]:has(input:active) {
		--_border-color: var(--neutral-subdued-content-color-down);
	}

	/* ── Emphasized ── */
	[data-spectrum-slider][data-emphasized] [data-spectrum-slider-control] {
		--_border-color: var(--accent-background-color-default);
		--_fill-color: var(--accent-background-color-default);
	}

	[data-spectrum-slider][data-emphasized]:not([data-disabled])
		[data-spectrum-slider-control]:hover {
		--_border-color: var(--accent-background-color-hover);
	}

	[data-spectrum-slider][data-emphasized]:not([data-disabled])
		[data-spectrum-slider-control]:has(input:active) {
		--_border-color: var(--accent-background-color-down);
	}

	/* ── Disabled ── */
	[data-spectrum-slider][data-disabled] [data-spectrum-slider-control] {
		--_border-color: var(--disabled-content-color);
		--_fill-color: var(--disabled-content-color);
	}

	[data-spectrum-slider][data-disabled] [data-spectrum-slider-track] {
		background-color: var(--disabled-background-color);
	}

	[data-spectrum-slider][data-disabled] [data-spectrum-slider-label],
	[data-spectrum-slider][data-disabled] [data-spectrum-slider-value] {
		color: var(--disabled-content-color);
	}

	/* ── Label & value ── */
	[data-spectrum-slider-label],
	[data-spectrum-slider-value] {
		font-size: var(--_text);
	}

	[data-spectrum-slider-label] {
		grid-area: label;
	}

	[data-spectrum-slider-value] {
		grid-area: value;
		text-align: end;
		font-variant-numeric: tabular-nums;
	}

	/* ── Track ── */
	[data-spectrum-slider-track] {
		width: 100%;
		height: var(--_track-height);
		border-radius: var(--corner-radius-full);
		background-color: var(--neutral-subtle-background-color-default);
		position: relative;
		overflow: hidden;
	}

	/* ── Fill — no border-radius needed; track clips edges via overflow:hidden ── */
	[data-spectrum-slider-fill] {
		position: absolute;
		inset-block: 0;
		left: calc(var(--_fill-start, 0) * 100%);
		width: calc(var(--_fill-size, 0) * 100%);
		background-color: var(--_fill-color);
		pointer-events: none;
	}

	/* ── Native input ── */
	[data-spectrum-slider-control] > input[type='range'] {
		position: absolute;
		inset-block: 0;
		left: 0;
		width: 100%;
		appearance: none;
		-webkit-appearance: none;
		margin: 0;
		background: transparent;
		cursor: pointer;
		z-index: 1;
	}

	[data-spectrum-slider-control] > input[type='range']:disabled {
		cursor: default;
	}

	/* ── Thumb ── */
	[data-spectrum-slider-control] > input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: var(--_handle);
		height: var(--_handle);
		border-radius: var(--corner-radius-full);
		border: var(--border-width-200) solid var(--_border-color);
		background-color: var(--_bg);
		box-sizing: border-box;
		transition: border-color var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-slider-control] > input[type='range']::-moz-range-thumb {
		width: var(--_handle);
		height: var(--_handle);
		border-radius: var(--corner-radius-full);
		border: var(--border-width-200) solid var(--_border-color);
		background-color: var(--_bg);
		box-sizing: border-box;
		transition: border-color var(--duration-fast) var(--ease-default);
	}

	/* ── Native track (invisible — height for thumb alignment) ── */
	[data-spectrum-slider-control] > input[type='range']::-webkit-slider-runnable-track {
		height: var(--_handle);
		background: transparent;
	}

	[data-spectrum-slider-control] > input[type='range']::-moz-range-track {
		height: var(--_handle);
		background: transparent;
		border: none;
	}

	/* ── Focus ring ── */
	[data-spectrum-slider-control] > input[type='range']:focus-visible::-webkit-slider-thumb {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	[data-spectrum-slider-control] > input[type='range']:focus-visible::-moz-range-thumb {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}
</style>
