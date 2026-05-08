import type { ClassValue, HTMLButtonAttributes } from 'svelte/elements';

export type ClearButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface ClearButtonProps extends Omit<HTMLButtonAttributes, 'type' | 'class'> {
	/**
	 * The size of the ClearButton. Drives both the hit-target size and the
	 * inner Cross glyph size.
	 * @default 'm'
	 */
	size?: ClearButtonSize;

	/**
	 * Whether the button is disabled. Applies the native `disabled` attribute
	 * and the disabled styling.
	 */
	isDisabled?: boolean;

	/**
	 * Reference to the underlying button element.
	 */
	ref?: HTMLButtonElement | null;

	class?: ClassValue;
}
