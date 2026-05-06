import type { SVGAttributes } from 'svelte/elements';
import type { IconNode as LucideIconNode } from 'lucide';

export type IconNode = LucideIconNode;

export type IconSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export type IconColor =
	| 'default'
	| 'negative'
	| 'positive'
	| 'notice'
	| 'informative'
	| 'accent'
	| 'gray';

type OwnProps = {
	/**
	 * Icon data — import alongside the component: `import { Icon, ChevronDown } from '$lib/components/icon'`
	 */
	icon: IconNode;
	/** @default 'm' */
	size?: IconSize;
	/** @default 'default' */
	color?: IconColor;
	/**
	 * Renders with stroke-width 3 instead of 2. Useful for small sizes.
	 * @default false
	 */
	bold?: boolean;
	/**
	 * Accessible label. When provided the icon is no longer aria-hidden.
	 */
	'aria-label'?: string;
	class?: string;
};

export type IconProps = OwnProps &
	Omit<
		SVGAttributes<SVGSVGElement>,
		keyof OwnProps | 'width' | 'height' | 'viewBox' | 'fill' | 'stroke'
	>;
