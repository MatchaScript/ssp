import type { HTMLTextareaAttributes } from 'svelte/elements';
import type { FieldSize, FieldLabelPosition, NecessityIndicator } from '../field/types.js';

export interface TextAreaProps extends Omit<
	HTMLTextareaAttributes,
	'cols' | 'class' | 'id' | 'disabled' | 'readonly' | 'required' | 'value'
> {
	/** The current value of the text area. */
	value?: string;

	/**
	 * The size of the text area.
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
	 * When true, the label is used as `aria-label` on the textarea.
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

	/** Placeholder text for the textarea. */
	placeholder?: string;

	/** The name attribute for the textarea. */
	name?: string;

	/**
	 * Initial / minimum number of visible text lines.
	 * Translated to a `min-block-size` so the value is honored even when
	 * `field-sizing: content` is active (which otherwise ignores the
	 * `rows` attribute).
	 * @default 3
	 */
	rows?: number;

	/**
	 * Whether the textarea grows to fit its content.
	 * When true, native user resize is disabled and the height tracks the
	 * content via CSS `field-sizing: content`. In browsers that don't
	 * support `field-sizing` (Firefox / Safari as of 2025), the textarea
	 * falls back to `resize: vertical` so users can drag to expand.
	 * @default true
	 */
	isAutoResize?: boolean;

	/** Additional CSS classes on the outer wrapper. */
	class?: string;
}
