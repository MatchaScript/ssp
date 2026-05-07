import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ActionButtonSize, ActionButtonStaticColor } from '../action-button/types.js';

export type ToggleButtonRootPropsWithoutHTML = {
	ref?: HTMLElement | null;
	children?: Snippet;
	size?: ActionButtonSize;
	isQuiet?: boolean;
	isSelected?: boolean;
	isEmphasized?: boolean;
	staticColor?: ActionButtonStaticColor;
	onPressedChange?: (pressed: boolean) => void;
};

export type ToggleButtonRootProps = ToggleButtonRootPropsWithoutHTML &
	Omit<HTMLButtonAttributes, 'type'>;
