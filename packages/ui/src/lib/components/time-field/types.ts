import type { HTMLInputAttributes } from 'svelte/elements';
import type { FieldSize, FieldLabelPosition, NecessityIndicator } from '../field/types.js';

export interface TimeFieldProps extends Omit<
	HTMLInputAttributes,
	'size' | 'class' | 'id' | 'type' | 'disabled' | 'readonly' | 'required' | 'value'
> {
	/** The current value as a 24-hour time string (`HH:MM` or `HH:MM:SS`). */
	value?: string;

	/**
	 * The size of the field.
	 * @default 'm'
	 */
	size?: FieldSize;

	/** Visible label text. Should always be provided for accessibility. */
	label?: string;

	/**
	 * Position of the label relative to the field.
	 * @default 'top'
	 */
	labelPosition?: FieldLabelPosition;

	/**
	 * Whether to visually hide the label.
	 * When true, the label is used as `aria-label` on the input.
	 * @default false
	 */
	hideLabel?: boolean;

	/**
	 * How required/optional state is communicated visually.
	 * @default 'icon'
	 */
	necessityIndicator?: NecessityIndicator;

	/** @default false */
	isRequired?: boolean;

	/** @default false */
	isDisabled?: boolean;

	/** @default false */
	isReadOnly?: boolean;

	/** @default false */
	isError?: boolean;

	/**
	 * Whether to show a validation icon when the field is valid (not in error).
	 * @default false
	 */
	showValidIcon?: boolean;

	/** Neutral help text. Replaced by `errorMessage` when `isError` is true. */
	helpText?: string;

	/** Error message displayed below the field when `isError` is true. */
	errorMessage?: string;

	/** Form name for the input. */
	name?: string;

	/** Additional CSS classes on the outer wrapper. */
	class?: string;
}
