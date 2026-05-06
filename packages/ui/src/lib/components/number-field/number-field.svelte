<script lang="ts">
	import { Icon, Minus, Plus, AlertTriangle } from '../icon/index.js';
	import { Label } from '../label/index.js';
	import { Field } from '../field/index.js';
	import '../field/field-input.css';
	import type { NumberFieldProps } from './types.js';

	let {
		value = $bindable(null),
		size = 'm',
		label,
		labelPosition = 'top',
		hideLabel = false,
		necessityIndicator = 'icon',
		isRequired = false,
		isDisabled = false,
		isReadOnly = false,
		isError = false,
		hideStepper = false,
		step = 1,
		min,
		max,
		helpText,
		errorMessage,
		placeholder,
		name,
		class: className
	}: NumberFieldProps = $props();

	// ===== Floating-point-safe step math (ported from React Aria) =====
	// `nudge` snaps the current value to the nearest step grid first; if the snap
	// moves in the requested direction we use it, otherwise we add ±step and snap.
	// All arithmetic goes through integer scaling to avoid 0.1+0.2=0.30000…004.

	function roundToStepPrecision(v: number, s: number): number {
		let precision = 0;
		const stepStr = s.toString();
		const eIndex = stepStr.toLowerCase().indexOf('e-');
		if (eIndex > 0) {
			precision = Math.abs(Math.floor(Math.log10(Math.abs(s)))) + eIndex;
		} else {
			const pointIndex = stepStr.indexOf('.');
			if (pointIndex >= 0) {
				precision = stepStr.length - pointIndex;
			}
		}
		if (precision > 0) {
			const pow = 10 ** precision;
			return Math.round(v * pow) / pow;
		}
		return v;
	}

	function snapValueToStep(
		v: number,
		lo: number | undefined,
		hi: number | undefined,
		s: number
	): number {
		const origin = lo ?? 0;
		const remainder = (v - origin) % s;
		let snapped =
			Math.abs(remainder) * 2 >= s
				? v + Math.sign(remainder) * (s - Math.abs(remainder))
				: v - remainder;
		snapped = roundToStepPrecision(snapped, s);

		if (lo != null) {
			if (snapped < lo) snapped = lo;
			else if (hi != null && snapped > hi) {
				snapped = lo + Math.floor(roundToStepPrecision((hi - lo) / s, s)) * s;
			}
		} else if (hi != null && snapped > hi) {
			snapped = Math.floor(roundToStepPrecision(hi / s, s)) * s;
		}

		return roundToStepPrecision(snapped, s);
	}

	function decimalOp(op: '+' | '-', a: number, b: number): number {
		if (a % 1 === 0 && b % 1 === 0) {
			return op === '+' ? a + b : a - b;
		}
		const aDecimals = a.toString().split('.')[1]?.length ?? 0;
		const bDecimals = b.toString().split('.')[1]?.length ?? 0;
		const mult = 10 ** Math.max(aDecimals, bDecimals);
		const ai = Math.round(a * mult);
		const bi = Math.round(b * mult);
		return (op === '+' ? ai + bi : ai - bi) / mult;
	}

	function commit(raw: string) {
		if (raw === '') {
			value = null;
			return;
		}
		const parsed = Number(raw);
		if (Number.isNaN(parsed)) return;
		value = snapValueToStep(parsed, min, max, step);
	}

	function nudge(direction: 1 | -1) {
		// Empty: seed from min on increment, max on decrement (fall back to 0).
		if (value == null) {
			const seed = direction === 1 ? (min ?? 0) : (max ?? 0);
			value = snapValueToStep(seed, min, max, step);
			return;
		}
		// Snap first; if it already moved in the requested direction, that's the new value.
		const snapped = snapValueToStep(value, min, max, step);
		if ((direction === 1 && snapped > value) || (direction === -1 && snapped < value)) {
			value = snapped;
			return;
		}
		// Otherwise step then snap.
		const stepped = decimalOp(direction === 1 ? '+' : '-', value, step);
		value = snapValueToStep(stepped, min, max, step);
	}

	function preventFocus(e: MouseEvent) {
		e.preventDefault();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isReadOnly) return;
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			nudge(1);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			nudge(-1);
		}
	}

	const canIncrement = $derived.by(() => {
		if (value == null) return true;
		if (max == null) return true;
		const snapped = snapValueToStep(value, min, max, step);
		if (snapped > value) return true;
		return decimalOp('+', value, step) <= max;
	});

	const canDecrement = $derived.by(() => {
		if (value == null) return true;
		if (min == null) return true;
		const snapped = snapValueToStep(value, min, max, step);
		if (snapped < value) return true;
		return decimalOp('-', value, step) >= min;
	});

	const displayValue = $derived(value == null ? '' : String(value));
	const stepButtonIconSize = $derived(size === 'xl' ? 'm' : size === 'l' ? 's' : 'xs');
</script>

{#snippet labelContent({ id }: { id: string })}
	<Label for={id} {isRequired} {necessityIndicator}>{label}</Label>
{/snippet}

<Field
	{size}
	{labelPosition}
	{isError}
	{isDisabled}
	{isReadOnly}
	{helpText}
	{errorMessage}
	class={className}
	label={label && !hideLabel ? labelContent : undefined}
>
	{#snippet children({ id, helpTextId }: { id: string; helpTextId: string | undefined })}
		<input
			{id}
			type="text"
			inputmode="decimal"
			value={displayValue}
			{name}
			{placeholder}
			disabled={isDisabled}
			readonly={isReadOnly}
			required={isRequired}
			aria-invalid={isError || undefined}
			aria-describedby={helpTextId}
			aria-label={hideLabel && label ? label : undefined}
			aria-valuenow={value ?? undefined}
			aria-valuemin={min}
			aria-valuemax={max}
			role="spinbutton"
			data-spectrum-field-input
			onkeydown={handleKeydown}
			onchange={(e) => commit(e.currentTarget.value)}
		/>
		{#if isError}
			<div data-spectrum-field-validation-icon>
				<Icon icon={AlertTriangle} color="negative" {size} />
			</div>
		{/if}
		{#if !hideStepper && !isReadOnly}
			<div data-spectrum-number-field-stepper>
				<button
					type="button"
					data-spectrum-number-field-step-button
					data-type="decrement"
					aria-label="Decrement"
					tabindex={-1}
					disabled={isDisabled || !canDecrement}
					onmousedown={preventFocus}
					onclick={() => nudge(-1)}
				>
					<Icon icon={Minus} size={stepButtonIconSize} bold />
				</button>
				<button
					type="button"
					data-spectrum-number-field-step-button
					data-type="increment"
					aria-label="Increment"
					tabindex={-1}
					disabled={isDisabled || !canIncrement}
					onmousedown={preventFocus}
					onclick={() => nudge(1)}
				>
					<Icon icon={Plus} size={stepButtonIconSize} bold />
				</button>
			</div>
		{/if}
	{/snippet}
</Field>

<style>
	/* ===== Stepper container =====
	   The stepper sits trailing as a FieldGroup sibling, so the input loses
	   its :last-child trailing padding automatically. The stepper provides
	   the right-edge spacing via its own padding-inline-end. */
	[data-spectrum-number-field-stepper] {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-shrink: 0;
	}

	/* ===== Step buttons ===== */
	[data-spectrum-number-field-step-button] {
		display: flex;
		align-items: center;
		justify-content: center;
		appearance: none;
		border: none;
		flex-shrink: 0;
		cursor: default;
		aspect-ratio: 1;
		border-radius: var(--corner-radius-small-default);
		background-color: var(--gray-100);
		color: var(--neutral-content-color-default);
		transition:
			background-color var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-number-field-step-button]:hover:not(:disabled) {
		background-color: var(--gray-200);
	}

	[data-spectrum-number-field-step-button]:active:not(:disabled) {
		background-color: var(--gray-300);
		transform: scale(0.9);
	}

	[data-spectrum-number-field-step-button]:disabled {
		background-color: var(--disabled-background-color);
		color: var(--disabled-content-color);
		cursor: default;
	}

	/* Size-specific dimensions. The ancestor [data-spectrum-field] is rendered
	   by <Field> (a child component), so :global() is required on the ancestor
	   while the stepper selector itself stays component-scoped.

	   padding-inline-end pulls from --field-pad-inline so the trailing edge
	   matches the leading edge of the input. The gap scales with size. */
	:global([data-spectrum-field][data-size='s']) [data-spectrum-number-field-stepper] {
		gap: var(--spacing-50);
		padding-inline-end: var(--field-pad-inline);
	}
	:global([data-spectrum-field][data-size='s']) [data-spectrum-number-field-step-button] {
		width: 16px;
	}

	:global([data-spectrum-field][data-size='m']) [data-spectrum-number-field-stepper] {
		gap: var(--spacing-50);
		padding-inline-end: var(--field-pad-inline);
	}
	:global([data-spectrum-field][data-size='m']) [data-spectrum-number-field-step-button] {
		width: 20px;
	}

	:global([data-spectrum-field][data-size='l']) [data-spectrum-number-field-stepper] {
		gap: var(--spacing-75);
		padding-inline-end: var(--field-pad-inline);
	}
	:global([data-spectrum-field][data-size='l']) [data-spectrum-number-field-step-button] {
		width: 24px;
	}

	:global([data-spectrum-field][data-size='xl']) [data-spectrum-number-field-stepper] {
		gap: var(--spacing-75);
		padding-inline-end: var(--field-pad-inline);
	}
	:global([data-spectrum-field][data-size='xl']) [data-spectrum-number-field-step-button] {
		width: 32px;
	}
</style>
