import type { HTMLInputAttributes } from 'svelte/elements';
import type { FieldSize, FieldLabelPosition, NecessityIndicator } from '../field/types.js';

export interface TextFieldProps extends Omit<
	HTMLInputAttributes,
	'size' | 'class' | 'id' | 'disabled' | 'readonly' | 'required' | 'value'
> {
	/** The current value of the text field. */
	value?: string;

	/**
	 * The type of input.
	 * @default 'text'
	 */
	type?: 'text' | 'password' | 'email' | 'tel' | 'url' | 'number' | 'search';

	/**
	 * The size of the text field.
	 * @default 'm'
	 */
	size?: FieldSize;

	/** The label text for the field. Should always be provided for accessibility. */
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

	/**
	 * Whether the field is required.
	 * @default false
	 */
	isRequired?: boolean;

	/**
	 * Whether the field is disabled.
	 * @default false
	 */
	isDisabled?: boolean;

	/**
	 * Whether the field is read-only.
	 * @default false
	 */
	isReadOnly?: boolean;

	/**
	 * Whether the field is in an error state.
	 * @default false
	 */
	isError?: boolean;

	/**
	 * Whether to show a validation icon when the field is valid (not in error).
	 * @default false
	 */
	showValidIcon?: boolean;

	/** Neutral help text displayed below the field. Replaced by errorMessage when isError is true. */
	helpText?: string;

	/** Error message displayed below the field when isError is true. */
	errorMessage?: string;

	/** Placeholder text for the input. */
	placeholder?: string;

	/** The name attribute for the input. */
	name?: string;

	/** Additional CSS classes on the outer wrapper. */
	class?: string;
}
