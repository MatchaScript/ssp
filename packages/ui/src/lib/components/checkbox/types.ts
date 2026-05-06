import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';

export interface CheckboxProps extends Omit<HTMLInputAttributes, 'size' | 'class' | 'disabled'> {
	/**
	 * Whether the Checkbox is checked.
	 */
	checked?: boolean;

	/**
	 * Whether the Checkbox is in an indeterminate state.
	 */
	indeterminate?: boolean;

	/**
	 * The size of the Checkbox.
	 * @default 'm'
	 */
	size?: 's' | 'm' | 'l' | 'xl';

	/**
	 * Whether the Checkbox should be displayed with an emphasized style.
	 */
	isEmphasized?: boolean;

	/**
	 * Whether the Checkbox is disabled.
	 */
	isDisabled?: boolean;

	/**
	 * Whether the Checkbox is in an error state.
	 */
	isError?: boolean;

	/**
	 * The children to render. Often used for the label. Omit for standalone use.
	 */
	children?: Snippet;

	/**
	 * Additional CSS classes.
	 */
	class?: string;
}
