import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface RangeSliderValue {
	/**
	 * The start (lower) value of the range.
	 */
	start: number;

	/**
	 * The end (upper) value of the range.
	 */
	end: number;
}

export interface RangeSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'value'> {
	/**
	 * The current range value as `{ start, end }`.
	 *
	 * @default { start: 0, end: 100 }
	 */
	value?: RangeSliderValue;

	/**
	 * The minimum value of the slider.
	 *
	 * @default 0
	 */
	min?: number;

	/**
	 * The maximum value of the slider.
	 *
	 * @default 100
	 */
	max?: number;

	/**
	 * The step increment of the slider.
	 *
	 * @default 1
	 */
	step?: number;

	/**
	 * The size of the slider.
	 *
	 * @default 'm'
	 */
	size?: 's' | 'm' | 'l' | 'xl';

	/**
	 * The label for the slider.
	 */
	label?: Snippet | string;

	/**
	 * The position of the label relative to the slider.
	 *
	 * @default 'top'
	 */
	labelPosition?: 'top' | 'side';

	/**
	 * Whether to use the emphasized (accent) color for the filled track and handles.
	 *
	 * @default false
	 */
	isEmphasized?: boolean;

	/**
	 * Whether the slider is disabled.
	 *
	 * @default false
	 */
	isDisabled?: boolean;

	/**
	 * Explicit override for the displayed value text.
	 * If provided, this string is shown instead of the default "start – end" format.
	 */
	valueLabel?: string;

	/**
	 * Whether to hide the value display.
	 *
	 * @default false
	 */
	hideValue?: boolean;

	/**
	 * Additional CSS classes.
	 */
	class?: string;
}
