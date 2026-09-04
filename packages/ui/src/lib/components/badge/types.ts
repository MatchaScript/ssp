import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type BadgeSemanticVariant =
	'accent' | 'informative' | 'neutral' | 'positive' | 'notice' | 'negative';

export type BadgeColorVariant =
	| 'red'
	| 'orange'
	| 'yellow'
	| 'chartreuse'
	| 'celery'
	| 'green'
	| 'seafoam'
	| 'cyan'
	| 'blue'
	| 'indigo'
	| 'purple'
	| 'fuchsia'
	| 'magenta'
	| 'gray';

export type BadgeVariant = BadgeSemanticVariant | BadgeColorVariant;
export type BadgeSize = 's' | 'm' | 'l' | 'xl';
export type BadgeFillStyle = 'bold' | 'subtle' | 'outline';

export type BadgeProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
	variant?: BadgeVariant;
	size?: BadgeSize;
	fillStyle?: BadgeFillStyle;
	children?: Snippet;
	ref?: HTMLDivElement | null;
};
