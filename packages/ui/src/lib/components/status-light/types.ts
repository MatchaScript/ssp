import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type StatusLightSize = 's' | 'm' | 'l' | 'xl';

export type StatusLightSemanticVariant =
	| 'neutral'
	| 'informative'
	| 'positive'
	| 'negative'
	| 'notice';

export type StatusLightVariant = 'neutral' | 'informative' | 'positive' | 'negative' | 'notice';

export type StatusLightRootProps = HTMLAttributes<HTMLDivElement> & {
	ref?: HTMLElement | null;
	children?: Snippet;
	variant?: StatusLightVariant;
	size?: StatusLightSize;
};
