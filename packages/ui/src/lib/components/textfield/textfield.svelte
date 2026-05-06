<script lang="ts">
	import { Icon, AlertTriangle, Check } from '../icon/index.js';
	import { Label } from '../label/index.js';
	import { Field } from '../field/index.js';
	import '../field/field-input.css';
	import type { TextFieldProps } from './types.js';

	let {
		value = $bindable(''),
		type = 'text',
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
		placeholder,
		name,
		class: className,
		...restProps
	}: TextFieldProps = $props();
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
			{type}
			{name}
			{placeholder}
			bind:value
			disabled={isDisabled}
			readonly={isReadOnly}
			required={isRequired}
			aria-invalid={isError || undefined}
			aria-describedby={helpTextId}
			aria-label={hideLabel && label ? label : undefined}
			data-spectrum-field-input
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
