import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ProgressCircleSize = 's' | 'm' | 'l';
export type ProgressCircleStaticColor = 'white' | 'black';

export type ProgressCircleProps = HTMLAttributes<HTMLElement> & {
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
	 * The size of the progress circle.
	 * @default 'm'
	 */
	size?: ProgressCircleSize;

	/**
	 * Optional static color for use on contrasting backgrounds.
	 */
	staticColor?: ProgressCircleStaticColor;

	/**
	 * Render your own element with the progress circle behaviors.
	 */
	child?: Snippet<[{ props: Record<string, unknown> }]>;

	/**
	 * Bind to the underlying element.
	 */
	ref?: HTMLElement | null;
};
