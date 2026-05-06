import type { HTMLInputAttributes } from 'svelte/elements';
import type { FieldSize, FieldLabelPosition } from '../field/types.js';
import type { IconNode } from '../icon/types.js';

export interface SearchFieldProps extends Omit<
	HTMLInputAttributes,
	'size' | 'class' | 'id' | 'disabled' | 'readonly' | 'required' | 'value' | 'type'
> {
	/** The current value of the search field. */
	value?: string;

	/**
	 * The size of the search field.
	 * @default 'm'
	 */
	size?: FieldSize;

	/** The label text for the field. Defaults to "Search". */
	label?: string;

	/**
	 * Position of the label relative to the field.
	 * @default 'top'
	 */
	labelPosition?: FieldLabelPosition;

	/**
	 * Whether to visually hide the label.
	 * When true, the label is used as `aria-label` on the input.
	 * @default true
	 */
	hideLabel?: boolean;

	/**
	 * Custom icon to replace the default search icon.
	 * Icon must be present if the label is hidden (SP2 requirement).
	 */
	icon?: IconNode;

	/**
	 * Whether the field is disabled.
	 * @default false
	 */
	isDisabled?: boolean;

	/** Neutral help text displayed below the field. */
	helpText?: string;

	/** Placeholder text for the input. */
	placeholder?: string;

	/** The name attribute for the input. */
	name?: string;

	/** Called when the user submits a search (Enter key). */
	onSubmit?: (value: string) => void;

	/** Called when the input value changes. */
	onChange?: (value: string) => void;

	/** Called when the user clears the field. */
	onClear?: () => void;

	/** Additional CSS classes on the outer wrapper. */
	class?: string;
}
