<script lang="ts">
	import { Icon, AlertTriangle, Check } from '../icon/index.js';
	import { Label } from '../label/index.js';
	import { Field } from '../field/index.js';
	import '../field/field-input.css';
	import type { DateFieldProps } from './types.js';

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
	}: DateFieldProps = $props();
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
			type="date"
			{name}
			bind:value
			disabled={isDisabled}
			readonly={isReadOnly}
			required={isRequired}
			aria-invalid={isError || undefined}
			aria-describedby={helpTextId}
			aria-label={hideLabel && label ? label : undefined}
			data-spectrum-field-input
			data-spectrum-date-field-input
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
	/* Native date input chrome:
	   - tabular-nums keeps the placeholder/value glyphs aligned
	   - hide the spin buttons; the picker indicator is the canonical affordance
	   - color the picker indicator with currentColor so it follows our theme */
	[data-spectrum-date-field-input] {
		font-variant-numeric: tabular-nums;
	}

	[data-spectrum-date-field-input]::-webkit-calendar-picker-indicator {
		cursor: pointer;
		opacity: 0.6;
	}

	[data-spectrum-date-field-input]:hover::-webkit-calendar-picker-indicator,
	[data-spectrum-date-field-input]:focus::-webkit-calendar-picker-indicator {
		opacity: 1;
	}

	[data-spectrum-date-field-input]:disabled::-webkit-calendar-picker-indicator {
		cursor: default;
		opacity: 0.4;
	}
</style>
