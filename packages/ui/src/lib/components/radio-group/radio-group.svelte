<script lang="ts">
	import { Label } from '../label/index.js';
	import { HelpText } from '../field/index.js';
	import { RadioGroupState, setRadioGroupContext } from './radio-group.svelte.js';
	import type { RadioGroupProps } from './types.js';

	const uid = $props.id();

	let {
		value = $bindable(null),
		defaultValue = null,
		onValueChange,
		name = `radio-group-${uid}`,
		size = 'm',
		orientation = 'vertical',
		isEmphasized = false,
		isDisabled = false,
		isError = false,
		isRequired = false,
		isReadOnly = false,
		label,
		labelPosition = 'top',
		necessityIndicator = 'icon',
		helpText,
		errorMessage,
		children,
		class: className,
		...restProps
	}: RadioGroupProps = $props();

	// svelte-ignore state_referenced_locally
	let internalValue = $state<string | null>(value ?? defaultValue);
	const effectiveValue = $derived(value ?? internalValue);

	function setValue(next: string) {
		internalValue = next;
		value = next;
		onValueChange?.(next);
	}

	const groupId = `${uid}-group`;
	const helpTextId = $derived(helpText || errorMessage ? `${uid}-helptext` : undefined);

	const groupState = new RadioGroupState({
		get value() {
			return effectiveValue;
		},
		get name() {
			return name;
		},
		get size() {
			return size;
		},
		get isEmphasized() {
			return isEmphasized;
		},
		get isDisabled() {
			return isDisabled;
		},
		get isError() {
			return isError;
		},
		get isReadOnly() {
			return isReadOnly;
		},
		get isRequired() {
			return isRequired;
		},
		setValue
	});

	setRadioGroupContext(groupState);
</script>

<div
	class={className}
	data-spectrum-radio-group
	data-size={size}
	data-orientation={orientation}
	data-error={isError || undefined}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	data-label-position={labelPosition}
	{...restProps}
>
	{#if label}
		<div data-spectrum-radio-group-label>
			<Label {isRequired} {necessityIndicator} for={groupId}>
				{label}
			</Label>
		</div>
	{/if}

	<div
		id={groupId}
		role="radiogroup"
		aria-labelledby={label ? undefined : restProps['aria-labelledby']}
		aria-label={!label ? restProps['aria-label'] : undefined}
		aria-describedby={helpTextId}
		aria-orientation={orientation}
		aria-required={isRequired || undefined}
		aria-invalid={isError || undefined}
		aria-disabled={isDisabled || undefined}
		aria-readonly={isReadOnly || undefined}
		data-spectrum-radio-group-items
	>
		{@render children?.()}
	</div>

	<div data-spectrum-radio-group-helptext>
		<HelpText {size} {isError} {isDisabled} description={helpText} {errorMessage} id={helpTextId} />
	</div>
</div>

<style>
	[data-spectrum-radio-group] {
		display: flex;
		flex-direction: column;
		width: 100%;
		font-family: var(--font-sans);
	}

	[data-spectrum-radio-group][data-label-position='side'] {
		display: grid;
		grid-template-areas:
			'label items'
			'. helptext';
		grid-template-columns: auto 1fr;
		align-items: start;
		column-gap: var(--spacing-200);
	}
	[data-spectrum-radio-group][data-label-position='side'] > [data-spectrum-radio-group-label] {
		grid-area: label;
		padding-block-start: var(--spacing-75);
	}
	[data-spectrum-radio-group][data-label-position='side'] > [data-spectrum-radio-group-items] {
		grid-area: items;
	}
	[data-spectrum-radio-group][data-label-position='side'] > [data-spectrum-radio-group-helptext] {
		grid-area: helptext;
	}

	[data-spectrum-radio-group-label] {
		color: var(--neutral-content-color-default);
		padding-block-end: var(--spacing-75);
	}
	[data-spectrum-radio-group][data-disabled] > [data-spectrum-radio-group-label] {
		color: var(--disabled-content-color);
	}

	/* Label sizes mirror textfield */
	[data-spectrum-radio-group][data-size='s'] > [data-spectrum-radio-group-label] {
		font-size: var(--text-75);
	}
	[data-spectrum-radio-group][data-size='m'] > [data-spectrum-radio-group-label] {
		font-size: var(--text-100);
	}
	[data-spectrum-radio-group][data-size='l'] > [data-spectrum-radio-group-label] {
		font-size: var(--text-200);
	}
	[data-spectrum-radio-group][data-size='xl'] > [data-spectrum-radio-group-label] {
		font-size: var(--text-300);
	}

	/* Items wrapper — orientation */
	[data-spectrum-radio-group-items] {
		display: flex;
		flex-wrap: wrap;
	}
	[data-spectrum-radio-group][data-orientation='vertical'] [data-spectrum-radio-group-items] {
		flex-direction: column;
		row-gap: var(--spacing-100);
	}
	[data-spectrum-radio-group][data-orientation='horizontal'] [data-spectrum-radio-group-items] {
		flex-direction: row;
		column-gap: var(--spacing-200);
		row-gap: var(--spacing-100);
	}
</style>
