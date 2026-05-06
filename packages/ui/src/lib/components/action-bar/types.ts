import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

/**
 * ActionBar is positioned `absolute` at the bottom of its parent container.
 * The parent element must have `position: relative` (or similar) set.
 */
export type ActionBarRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
	ref?: HTMLElement | null;
	children?: Snippet;
	/** Number of selected items. ActionBar is hidden when 0. */
	selectedItemCount: number;
	/** Called when the close button is clicked to clear selection. */
	onClearSelection: () => void;
	/** Inverts coloring to make the bar stand out. */
	isEmphasized?: boolean;
	/** Custom label. Defaults to "{selectedItemCount} selected". */
	label?: Snippet;
	/** i18n overrides */
	i18n?: {
		actionsLabel?: string;
		clearSelection?: string;
		selected?: (count: number) => string;
	};
};

export type ActionBarItemProps = Omit<HTMLButtonAttributes, 'children'> & {
	ref?: HTMLElement | null;
	children?: Snippet;
	icon?: Snippet;
	disabled?: boolean;
};
