import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { FieldSize, FieldLabelPosition, NecessityIndicator } from '../field/types.js';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'role'> {
	/** The selected value. */
	value?: string | null;

	/** Initial value (uncontrolled). */
	defaultValue?: string | null;

	/** Called when the selected value changes. */
	onValueChange?: (value: string) => void;

	/** Form name shared by all radios in the group. Auto-generated if omitted. */
	name?: string;

	/**
	 * The size of the radios in the group.
	 * @default 'm'
	 */
	size?: FieldSize;

	/**
	 * Layout direction.
	 * @default 'vertical'
	 */
	orientation?: RadioGroupOrientation;

	/** Whether the radios should be displayed with an emphasized style. */
	isEmphasized?: boolean;

	/** Whether the entire group is disabled. */
	isDisabled?: boolean;

	/** Whether the group is in an error state. */
	isError?: boolean;

	/** Whether the group is required for form submission. */
	isRequired?: boolean;

	/** Whether the group is read-only. */
	isReadOnly?: boolean;

	/** Group label. */
	label?: string;

	/**
	 * Position of the label relative to the field.
	 * @default 'top'
	 */
	labelPosition?: FieldLabelPosition;

	/**
	 * How required/optional state is communicated.
	 * @default 'icon'
	 */
	necessityIndicator?: NecessityIndicator;

	/** Neutral help text below the group. Replaced by errorMessage when isError is true. */
	helpText?: string;

	/** Error message displayed when isError is true. */
	errorMessage?: string;

	/** Radio items. */
	children?: Snippet;

	/** Additional CSS classes on the outer wrapper. */
	class?: string;
}

export interface RadioProps extends Omit<
	HTMLInputAttributes,
	'size' | 'class' | 'disabled' | 'value' | 'type' | 'name'
> {
	/** The value this radio represents (required). */
	value: string;

	/** Disable just this individual radio. */
	isDisabled?: boolean;

	/** Label content for this radio. Omit for an icon-only/standalone radio. */
	children?: Snippet;

	/** Additional CSS classes. */
	class?: string;
}
