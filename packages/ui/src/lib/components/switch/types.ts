import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';

export interface SwitchProps extends Omit<HTMLInputAttributes, 'size' | 'class' | 'disabled'> {
	/**
	 * Whether the Switch is checked.
	 */
	checked?: boolean;

	/**
	 * The size of the Switch.
	 * @default 'm'
	 */
	size?: 's' | 'm' | 'l' | 'xl';

	/**
	 * Whether the Switch is disabled.
	 */
	isDisabled?: boolean;

	/**
	 * Whether the Switch should be displayed with an emphasized style.
	 */
	isEmphasized?: boolean;

	/**
	 * The children to render. Often used for the label.
	 */
	children?: Snippet;

	/**
	 * Additional CSS classes.
	 */
	class?: string;
}
