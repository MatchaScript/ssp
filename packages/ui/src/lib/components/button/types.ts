import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

// Spectrum Button Variants
export type ButtonVariant = 'accent' | 'primary' | 'secondary' | 'negative';
export type ButtonTreatment = 'fill' | 'outline';
export type ButtonSize = 's' | 'm' | 'l' | 'xl';
export type ButtonStaticColor = 'white' | 'black';

export type ButtonRootPropsWithoutHTML = {
	ref?: HTMLElement | null;
	children?: Snippet;
	icon?: Snippet;
	variant?: ButtonVariant;
	treatment?: ButtonTreatment;
	size?: ButtonSize;
	staticColor?: ButtonStaticColor;
};

type AnchorElement = ButtonRootPropsWithoutHTML &
	Omit<HTMLAnchorAttributes, 'href' | 'type'> & {
		href: HTMLAnchorAttributes['href'];
		type?: never;
		isDisabled?: boolean;
	};

type ButtonElement = ButtonRootPropsWithoutHTML &
	Omit<HTMLButtonAttributes, 'type' | 'href' | 'disabled'> & {
		type?: HTMLButtonAttributes['type'];
		href?: never;
		isDisabled?: boolean;
	};

export type ButtonRootProps = AnchorElement | ButtonElement;
