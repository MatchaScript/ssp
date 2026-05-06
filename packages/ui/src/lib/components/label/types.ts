import type { Snippet } from 'svelte';
import type { HTMLLabelAttributes } from 'svelte/elements';

/**
 * How required/optional state is communicated visually.
 * - `'icon'`: asterisk when required, nothing when optional.
 * - `'text'`: "(required)" or "(optional)" text after the label.
 */
export type NecessityIndicator = 'text' | 'icon';

export type LabelProps = HTMLLabelAttributes & {
	/**
	 * The ID of the form element this label is associated with.
	 */
	for?: string;

	/**
	 * Whether the associated field is required.
	 * @default false
	 */
	isRequired?: boolean;

	/**
	 * How to visually indicate required/optional state.
	 * @default 'icon'
	 */
	necessityIndicator?: NecessityIndicator;

	/**
	 * Label content.
	 */
	children?: Snippet;
};
