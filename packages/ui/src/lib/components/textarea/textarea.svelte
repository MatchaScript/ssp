<script lang="ts">
	import { Icon, AlertTriangle, Check } from '../icon/index.js';
	import { Label } from '../label/index.js';
	import { Field } from '../field/index.js';
	import '../field/field-input.css';
	import type { TextAreaProps } from './types.js';

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
		placeholder,
		name,
		rows = 3,
		isAutoResize = true,
		class: className,
		...restProps
	}: TextAreaProps = $props();

	const showIcon = $derived(isError || showValidIcon);
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
		<textarea
			{id}
			{name}
			{placeholder}
			{rows}
			bind:value
			disabled={isDisabled}
			readonly={isReadOnly}
			required={isRequired}
			aria-invalid={isError || undefined}
			aria-describedby={helpTextId}
			aria-label={hideLabel && label ? label : undefined}
			data-spectrum-field-input
			data-multiline
			data-auto-resize={isAutoResize || undefined}
			style:--textarea-rows={rows}
			{...restProps}
		></textarea>
		{#if showIcon}
			<div data-spectrum-textarea-validation-icon>
				<Icon
					icon={isError ? AlertTriangle : Check}
					color={isError ? 'negative' : 'positive'}
					{size}
				/>
			</div>
		{/if}
	{/snippet}
</Field>

<style>
	/* TextArea's validation icon is absolutely positioned — FieldGroup is flex
	   align-items: center and textarea grows vertically, so inline placement
	   would drift as content expands. Pin the icon to the top-right corner. */
	[data-spectrum-textarea-validation-icon] {
		position: absolute;
		display: flex;
		flex-shrink: 0;
		pointer-events: none;
	}

	/* Per-size positioning. The ancestor [data-spectrum-field] is rendered by
	   <Field>, so :global() is required on the ancestor while the subject
	   selector stays component-scoped. */
	:global([data-spectrum-field][data-size='s']) [data-spectrum-textarea-validation-icon] {
		top: var(--spacing-50);
		inset-inline-end: var(--spacing-75);
	}
	:global([data-spectrum-field][data-size='m']) [data-spectrum-textarea-validation-icon] {
		top: calc(var(--spacing-50) + var(--border-width-100));
		inset-inline-end: var(--spacing-100);
	}
	:global([data-spectrum-field][data-size='l']) [data-spectrum-textarea-validation-icon] {
		top: var(--spacing-100);
		inset-inline-end: var(--spacing-200);
	}
	:global([data-spectrum-field][data-size='xl']) [data-spectrum-textarea-validation-icon] {
		top: var(--spacing-200);
		inset-inline-end: var(--spacing-300);
	}
</style>
