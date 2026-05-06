import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type MeterProps = HTMLAttributes<HTMLElement> & {
	/**
	 * The current value of the meter.
	 *
	 * @default 0
	 */
	value?: number;

	/**
	 * The maximum value of the meter.
	 *
	 * @default 100
	 */
	max?: number;

	/**
	 * The minimum value of the meter.
	 *
	 * @default 0
	 */
	min?: number;

	/**
	 * The size of the meter.
	 * @default 'm'
	 */
	size?: 's' | 'm' | 'l' | 'xl';

	/**
	 * Visual intent of the meter color.
	 * @default 'informative'
	 */
	variant?: 'informative' | 'positive' | 'notice' | 'negative';

	/**
	 * Position of the label.
	 * @default 'top'
	 */
	labelPosition?: 'top' | 'side';

	/**
	 * Optional text label for the meter.
	 */
	label?: Snippet | string;

	/**
	 * Explicit override for the value text.
	 */
	valueLabel?: string;

	/**
	 * Force contrast coloring for dark/light scenarios.
	 */
	staticColor?: 'white' | 'black';

	/**
	 * Render your own element with the meter behaviors.
	 */
	child?: Snippet<[{ props: Record<string, unknown> }]>;

	/**
	 * Elements to render inside the default meter wrapper.
	 */
	children?: Snippet;

	/**
	 * Bind to the underlying element.
	 */
	ref?: HTMLElement | null;
};
