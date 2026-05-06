import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ProgressBarSize = 's' | 'm' | 'l' | 'xl';
export type ProgressBarLabelPosition = 'top' | 'side';
export type ProgressBarStaticColor = 'white' | 'black';

export type ProgressBarProps = HTMLAttributes<HTMLElement> & {
	/**
	 * The current progress value.
	 * @default 0
	 */
	value?: number;

	/**
	 * The minimum progress value.
	 * @default 0
	 */
	min?: number;

	/**
	 * The maximum progress value.
	 * @default 100
	 */
	max?: number;

	/**
	 * Whether the progress is indeterminate (ongoing, unknown duration).
	 * If true, `value` is ignored.
	 * @default false
	 */
	isIndeterminate?: boolean;

	/**
	 * The size of the progress bar.
	 * @default 'm'
	 */
	size?: ProgressBarSize;

	/**
	 * Position of the label relative to the progress bar.
	 * @default 'top'
	 */
	labelPosition?: ProgressBarLabelPosition;

	/**
	 * Optional static color for use on contrasting backgrounds.
	 */
	staticColor?: ProgressBarStaticColor;

	/**
	 * The label for the progress bar. Provide as a string or Snippet.
	 */
	label?: Snippet | string;

	/**
	 * Whether to visually hide the label.
	 * When true, the label is still used for `aria-label` but not rendered.
	 * @default false
	 */
	hideLabel?: boolean;

	/**
	 * Custom value text to display instead of the default percentage.
	 * Also used as `aria-valuetext`.
	 */
	valueLabel?: string;

	/**
	 * Render your own element with the progress bar behaviors.
	 */
	child?: Snippet<[{ props: Record<string, unknown> }]>;

	/**
	 * Elements to render inside the default progress bar wrapper.
	 */
	children?: Snippet;

	/**
	 * Bind to the underlying element.
	 */
	ref?: HTMLElement | null;
};
