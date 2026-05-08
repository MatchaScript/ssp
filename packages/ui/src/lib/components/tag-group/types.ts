import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLAttributeAnchorTarget } from 'svelte/elements';
import type { NecessityIndicator } from '../label/index.js';

export type TagGroupSize = 's' | 'm' | 'l';
export type TagGroupSelectionMode = 'none' | 'single' | 'multiple';
export type TagGroupLabelPosition = 'top' | 'side';

export interface TagGroupRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	// children
	children?: Snippet;
	renderEmptyState?: Snippet;

	// selection
	selectionMode?: TagGroupSelectionMode;
	selectedKeys?: Set<string>;
	defaultSelectedKeys?: Iterable<string>;
	onSelectionChange?: (keys: Set<string>) => void;
	disallowEmptySelection?: boolean;

	// removal
	onRemove?: (keys: Set<string>) => void;

	// disabled
	isDisabled?: boolean;
	disabledKeys?: Set<string>;

	// Field integration
	label?: string | Snippet;
	labelPosition?: TagGroupLabelPosition;
	necessityIndicator?: NecessityIndicator;
	helpText?: string | Snippet;
	errorMessage?: string | Snippet;
	isError?: boolean;
	isReadOnly?: boolean;
	isRequired?: boolean;

	// visual
	size?: TagGroupSize;
	isEmphasized?: boolean;

	// imperative
	ref?: HTMLDivElement | null;

	class?: string;
}

export interface TagItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
	id: string;

	children?: Snippet;
	icon?: Snippet;
	textValue?: string;

	isDisabled?: boolean;

	// link-mode
	href?: string;
	target?: HTMLAttributeAnchorTarget;
	rel?: string;
	download?: string | boolean;

	ref?: HTMLDivElement | null;

	class?: string;
}
