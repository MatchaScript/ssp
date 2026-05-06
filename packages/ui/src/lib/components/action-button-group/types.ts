import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ActionButtonSize, ActionButtonStaticColor } from '../action-button/types.js';

export type ActionButtonGroupOrientation = 'horizontal' | 'vertical';
export type ActionButtonGroupDensity = 'regular' | 'compact';

export type ActionButtonGroupRootPropsWithoutHTML = {
	ref?: HTMLElement | null;
	children?: Snippet;
	size?: ActionButtonSize;
	density?: ActionButtonGroupDensity;
	orientation?: ActionButtonGroupOrientation;
	isQuiet?: boolean;
	isJustified?: boolean;
	isDisabled?: boolean;
	staticColor?: ActionButtonStaticColor;
};

export type ActionButtonGroupRootProps = ActionButtonGroupRootPropsWithoutHTML &
	Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export type ActionButtonGroupItemPropsWithoutHTML = {
	ref?: HTMLElement | null;
	children?: Snippet;
	icon?: Snippet;
	size?: ActionButtonSize;
	isQuiet?: boolean;
	staticColor?: ActionButtonStaticColor;
};

type ItemAnchorElement = ActionButtonGroupItemPropsWithoutHTML &
	Omit<HTMLAnchorAttributes, 'href' | 'type'> & {
		href: HTMLAnchorAttributes['href'];
		type?: never;
		disabled?: HTMLButtonAttributes['disabled'];
	};

type ItemButtonElement = ActionButtonGroupItemPropsWithoutHTML &
	Omit<HTMLButtonAttributes, 'type' | 'href'> & {
		type?: HTMLButtonAttributes['type'];
		href?: never;
		disabled?: HTMLButtonAttributes['disabled'];
	};

export type ActionButtonGroupItemProps = ItemAnchorElement | ItemButtonElement;
