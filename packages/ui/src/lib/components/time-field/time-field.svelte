<script lang="ts">
	import { Icon, AlertTriangle, Check } from '../icon/index.js';
	import { Label } from '../label/index.js';
	import { Field } from '../field/index.js';
	import '../field/field-input.css';
	import type { TimeFieldProps } from './types.js';

	let {
		value = $bindable(''),
		size = 'm',
		label,
		labelPosition = 'top',
		hideLabel = false,
		necessityIndicator = 'icon',
		isRequired = false,
		isDisabled = false,
		isReadOnly = false,
		isError = false,
		showValidIcon = false,
		helpText,
		errorMessage,
		name,
		class: className,
		...restProps
	}: TimeFieldProps = $props();
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
			type="time"
			{name}
			bind:value
			disabled={isDisabled}
			readonly={isReadOnly}
			required={isRequired}
			aria-invalid={isError || undefined}
			aria-describedby={helpTextId}
			aria-label={hideLabel && label ? label : undefined}
			data-spectrum-field-input
			data-spectrum-time-field-input
			{...restProps}
		/>
		{#if isError}
			<div data-spectrum-field-validation-icon>
				<Icon icon={AlertTriangle} color="negative" {size} />
			</div>
		{:else if showValidIcon}
			<div data-spectrum-field-validation-icon>
				<Icon icon={Check} color="positive" {size} />
			</div>
		{/if}
	{/snippet}
</Field>

<style>
	/* Native time input chrome — same approach as DateField:
	   - tabular-nums keeps glyph widths consistent across digits
	   - the picker indicator (clock affordance) opacity tracks interaction state */
	[data-spectrum-time-field-input] {
		font-variant-numeric: tabular-nums;
	}

	[data-spectrum-time-field-input]::-webkit-calendar-picker-indicator {
		cursor: pointer;
		opacity: 0.6;
	}

	[data-spectrum-time-field-input]:hover::-webkit-calendar-picker-indicator,
	[data-spectrum-time-field-input]:focus::-webkit-calendar-picker-indicator {
		opacity: 1;
	}

	[data-spectrum-time-field-input]:disabled::-webkit-calendar-picker-indicator {
		cursor: default;
		opacity: 0.4;
	}
</style>
