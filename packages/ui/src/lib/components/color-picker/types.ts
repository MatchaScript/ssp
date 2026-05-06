import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';

export type ColorPickerSize = 's' | 'm' | 'l' | 'xl';
export type ColorPickerRounding = 'default' | 'none' | 'full';

export type ColorPickerProps = Omit<HTMLInputAttributes, 'size' | 'value'> & {
	/** The current color value (hex string, e.g. "#ff0000"). */
	value?: string;
	/** A visual label displayed next to the swatch. */
	label?: string | Snippet;
	/**
	 * The size of the color swatch.
	 * @default "m"
	 */
	size?: ColorPickerSize;
	/**
	 * The corner rounding of the color swatch.
	 * @default "default"
	 */
	rounding?: ColorPickerRounding;
	/** Whether the color picker is disabled. */
	isDisabled?: boolean;
	/** Callback fired when the color value changes. */
	onInput?: (value: string) => void;
};
