import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

type OwnProps = {
	children?: Snippet;
	class?: string;
};

export type TextProps = OwnProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof OwnProps>;
