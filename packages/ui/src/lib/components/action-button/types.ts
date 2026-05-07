import type { ClassValue, HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ActionButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';
export type ActionButtonStaticColor = 'white' | 'black' | 'auto';
export type ActionButtonDensity = 'regular' | 'compact';
export type ActionButtonGroupOrientation = 'horizontal' | 'vertical';

export type ActionButtonRootPropsWithoutHTML = {
	ref?: HTMLElement | null;
	children?: Snippet;
	size?: ActionButtonSize;
	isQuiet?: boolean;
	staticColor?: ActionButtonStaticColor;
};

type AnchorElement = ActionButtonRootPropsWithoutHTML &
	Omit<HTMLAnchorAttributes, 'href' | 'type'> & {
		href: HTMLAnchorAttributes['href'];
		type?: never;
		disabled?: HTMLButtonAttributes['disabled'];
	};

type ButtonElement = ActionButtonRootPropsWithoutHTML &
	Omit<HTMLButtonAttributes, 'type' | 'href'> & {
		type?: HTMLButtonAttributes['type'];
		href?: never;
		disabled?: HTMLButtonAttributes['disabled'];
	};

export type ActionButtonRootProps = AnchorElement | ButtonElement;

/**
 * Render-side props for `actionButtonSnippet` exported from `action-button-base.svelte`.
 *
 * All four wrapper components (ActionButton, ToggleButton, ActionButtonGroupItem,
 * ToggleGroupItem) pass their state through this shape so the base snippet owns
 * the element markup and scoped CSS in one place.
 */
export type ActionButtonRenderProps = {
	bitsProps?: Record<string, unknown>;
	restProps?: Record<string, unknown>;
	setRef?: (el: HTMLElement | null) => void;

	href?: string | null;
	type?: HTMLButtonAttributes['type'];
	disabled?: boolean | null;

	size: ActionButtonSize;
	isQuiet?: boolean;
	isSelected?: boolean;
	isEmphasized?: boolean;
	staticColor?: ActionButtonStaticColor;

	density?: ActionButtonDensity;
	groupOrientation?: ActionButtonGroupOrientation;
	isJustified?: boolean;

	className?: ClassValue | null;
	children?: Snippet;
};
