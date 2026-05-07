import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ActionButtonSize, ActionButtonStaticColor } from '../action-button/types.js';

export type ToggleGroupSelectionMode = 'single' | 'multiple';
export type ToggleGroupOrientation = 'horizontal' | 'vertical';
export type ToggleGroupDensity = 'regular' | 'compact';

export type ToggleGroupRootPropsWithoutHTML = {
	ref?: HTMLElement | null;
	children?: Snippet;
	selectionMode?: ToggleGroupSelectionMode;
	value?: string[];
	onValueChange?: (value: string[]) => void;
	size?: ActionButtonSize;
	density?: ToggleGroupDensity;
	orientation?: ToggleGroupOrientation;
	isQuiet?: boolean;
	isJustified?: boolean;
	isDisabled?: boolean;
	isEmphasized?: boolean;
	staticColor?: ActionButtonStaticColor;
};

export type ToggleGroupRootProps = ToggleGroupRootPropsWithoutHTML &
	Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export type ToggleGroupItemPropsWithoutHTML = {
	ref?: HTMLElement | null;
	children?: Snippet;
	value: string;
	isDisabled?: boolean;
};

export type ToggleGroupItemProps = ToggleGroupItemPropsWithoutHTML &
	Omit<HTMLButtonAttributes, 'type' | 'value' | 'disabled'>;
