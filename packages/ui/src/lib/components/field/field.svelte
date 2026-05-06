<script lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		FieldSize,
		FieldLabelPosition,
		FieldState,
		FieldLabelState
	} from './types.js';
	import FieldGroup from './field-group.svelte';
	import HelpText from './help-text.svelte';

	interface Props {
		size?: FieldSize;
		labelPosition?: FieldLabelPosition;
		isError?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		helpText?: string;
		errorMessage?: string;
		/** Minimum width preset. 'text' = 1.5× field height, 'search' = 3× field height. */
		minWidth?: 'text' | 'search';
		id?: string;
		class?: string;
		label?: Snippet<[FieldLabelState]>;
		children?: Snippet<[FieldState]>;
	}

	let {
		size = 'm',
		labelPosition = 'top',
		isError = false,
		isDisabled = false,
		isReadOnly = false,
		helpText,
		errorMessage,
		minWidth = 'text',
		id: idProp,
		class: className,
		label,
		children
	}: Props = $props();

	const fallbackId = $props.id();
	const id = $derived(idProp ?? fallbackId);
	const helpTextId = $derived(helpText || errorMessage ? `${id}-helptext` : undefined);
</script>

<div
	class={className}
	data-spectrum-field
	data-size={size}
	data-label-position={labelPosition}
	data-min-width={minWidth}
	data-error={isError || undefined}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
>
	{#if label}
		<div data-spectrum-field-label>
			{@render label({ id })}
		</div>
	{/if}
	<FieldGroup {size} {isError} {isDisabled} {isReadOnly}>
		{@render children?.({ id, helpTextId })}
	</FieldGroup>
	<HelpText
		{size}
		{isError}
		{isDisabled}
		description={helpText}
		{errorMessage}
		id={helpTextId}
	/>
</div>

<style>
	/* ===== Layout ===== */
	[data-spectrum-field] {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	[data-spectrum-field][data-label-position='side'] {
		display: grid;
		grid-template-areas:
			'label field'
			'. helptext';
		grid-template-columns: auto 1fr;
		align-items: start;
		column-gap: var(--spacing-200);
	}

	/* Label is rendered directly by this component, so scoped CSS reaches it. */
	[data-spectrum-field][data-label-position='side'] > [data-spectrum-field-label] {
		grid-area: label;
		/* Align label baseline with first text line inside FieldGroup. FieldGroup
		   has a border-width-200 top border plus size-dependent block padding. */
		padding-block-start: calc(var(--border-width-200) + var(--spacing-75));
		padding-block-end: 0;
	}

	/* FieldGroup and HelpText are child components — :global() escapes scoping
	   for the subject, the ancestor selector stays scoped to this component. */
	[data-spectrum-field][data-label-position='side'] > :global([data-spectrum-field-group]) {
		grid-area: field;
	}

	[data-spectrum-field][data-label-position='side'] > :global([data-spectrum-help-text]) {
		grid-area: helptext;
	}

	/* ===== Label ===== */
	[data-spectrum-field-label] {
		color: var(--neutral-content-color-default);
		padding-block-end: var(--spacing-75);
	}

	[data-spectrum-field][data-disabled] > [data-spectrum-field-label] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-field][data-size='s'] > [data-spectrum-field-label] {
		font-size: var(--text-75);
	}
	[data-spectrum-field][data-size='m'] > [data-spectrum-field-label] {
		font-size: var(--text-100);
	}
	[data-spectrum-field][data-size='l'] > [data-spectrum-field-label] {
		font-size: var(--text-200);
	}
	[data-spectrum-field][data-size='xl'] > [data-spectrum-field-label] {
		font-size: var(--text-300);
	}

	/* ===== Per-size custom properties =====
	   These cascade to FieldGroup and descendants — consumer-rendered
	   <input data-spectrum-field-input>, icons, stepper buttons, etc. read
	   them via var() so children never hard-code per-size values. */
	[data-spectrum-field][data-size='s'] {
		--field-pad-inline: var(--spacing-75);
		--field-pad-block: var(--spacing-50);
		font-size: var(--text-75);
	}

	[data-spectrum-field][data-size='m'] {
		--field-pad-inline: var(--spacing-100);
		--field-pad-block: calc(var(--spacing-50) + var(--border-width-100));
		font-size: var(--text-100);
	}

	[data-spectrum-field][data-size='l'] {
		--field-pad-inline: var(--spacing-200);
		--field-pad-block: var(--spacing-100);
		font-size: var(--text-200);
	}

	[data-spectrum-field][data-size='xl'] {
		--field-pad-inline: var(--spacing-300);
		--field-pad-block: var(--spacing-200);
		font-size: var(--text-300);
	}

	/* ===== Minimum width per SP2 =====
	   text preset = 1.5× field height (TextField, TextArea, NumberField)
	   search preset = 3× field height (SearchField) */
	[data-spectrum-field][data-min-width='text'][data-size='s'] {
		min-width: 36px;
	}
	[data-spectrum-field][data-min-width='text'][data-size='m'] {
		min-width: 48px;
	}
	[data-spectrum-field][data-min-width='text'][data-size='l'] {
		min-width: 60px;
	}
	[data-spectrum-field][data-min-width='text'][data-size='xl'] {
		min-width: 72px;
	}

	[data-spectrum-field][data-min-width='search'][data-size='s'] {
		min-width: 72px;
	}
	[data-spectrum-field][data-min-width='search'][data-size='m'] {
		min-width: 96px;
	}
	[data-spectrum-field][data-min-width='search'][data-size='l'] {
		min-width: 120px;
	}
	[data-spectrum-field][data-min-width='search'][data-size='xl'] {
		min-width: 144px;
	}
</style>
