import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';

export interface SliderProps extends Omit<HTMLInputAttributes, 'size' | 'class' | 'value'> {
	/**
	 * The current value of the slider.
	 */
	value?: number;

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
	 * Whether the track has a visible fill from the minimum value (or `fillStart`) to the current value.
	 *
	 * @default false
	 */
	hasFill?: boolean;

	/**
	 * The value from which the fill originates. Only applicable when `hasFill` is true.
	 * Defaults to `min`, so the fill starts from the left edge of the track.
	 *
	 * @default min
	 */
	fillStart?: number;

	/**
	 * Whether to use the emphasized (accent) color for the filled track.
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
	 * If provided, this string is shown instead of the raw numeric value.
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
