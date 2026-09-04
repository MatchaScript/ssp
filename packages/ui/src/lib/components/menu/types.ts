import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';
import type { DividerRootProps } from '../divider/types.js';
import type { SelectionMode } from '$lib/utils/selectable-collection/index.js';

export type MenuSize = 's' | 'm' | 'l' | 'xl';
export type { SelectionMode };

export type MenuProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'role' | 'tabindex' | 'popover'
> & {
	children: Snippet;
	size?: MenuSize;
	selectionMode?: SelectionMode;
	selectedKeys?: Set<string>;
	onAction?: (id: string) => void;
	onSelectionChange?: (keys: Set<string>) => void;
	onClose?: () => void;
	ref?: HTMLDivElement | null;
};

export type MenuItemProps = Omit<
	HTMLAttributes<HTMLElement>,
	'children' | 'id' | 'role'
> & {
	/** Semantic key for selection and action callbacks. */
	id: string;
	children?: Snippet;
	icon?: Snippet;
	description?: Snippet | string;
	value?: Snippet | string;
	shortcut?: Snippet | string;
	isDisabled?: boolean;
	/** Text for typeahead matching. Defaults to the element text content. */
	textValue?: string;
	href?: HTMLAnchorAttributes['href'];
	target?: HTMLAnchorAttributes['target'];
	rel?: HTMLAnchorAttributes['rel'];
	download?: HTMLAnchorAttributes['download'];
	/** Suppress the external-link icon on target="_blank" links. */
	hideLinkOutIcon?: boolean;
	ref?: HTMLElement | null;
};

export type MenuDividerProps = Omit<DividerRootProps, 'size' | 'orientation'>;

export type MenuSectionProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'role' | 'aria-labelledby'
> & {
	children: Snippet;
};

export type MenuSectionHeadingProps = Omit<
	HTMLAttributes<HTMLHeadingElement>,
	'children' | 'id'
> & {
	children: Snippet;
};

export type MenuTriggerProps = {
	/** Named snippet for the trigger element. Receives props that must be spread on it. */
	trigger: Snippet<[{ triggerProps: Record<string, unknown> }]>;
	/** Should contain a Menu component. */
	children: Snippet;
	open?: boolean;
};

export type SubmenuTriggerProps = {
	/** Should contain a MenuItem trigger followed by its Menu. */
	children: Snippet;
	open?: boolean;
};
