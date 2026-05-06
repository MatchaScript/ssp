import type { HTMLAttributes } from 'svelte/elements';

export interface DividerRootProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * How thick the Divider should be.
	 * @default 'm'
	 */
	size?: 's' | 'm' | 'l';

	/**
	 * The orientation of the Divider.
	 * @default 'horizontal'
	 */
	orientation?: 'horizontal' | 'vertical';

	/**
	 * The static color style to apply. Useful when the Divider appears over a color background.
	 */
	staticColor?: 'black' | 'white';

	/**
	 * Reference to the internal div element.
	 */
	ref?: HTMLDivElement | null;
}
