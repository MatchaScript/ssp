import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type ListViewSelectionMode = 'none' | 'single' | 'multiple';
export type ListViewSelectionStyle = 'checkbox' | 'highlight';
export type ListViewDensity = 'compact' | 'regular' | 'spacious';

export type ListViewProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
	selectionMode?: ListViewSelectionMode;
	selectionStyle?: ListViewSelectionStyle;
	selectedKeys?: Set<string>;
	defaultSelectedKeys?: Set<string>;
	onSelectionChange?: (keys: Set<string>) => void;
	disabledKeys?: Set<string>;
	density?: ListViewDensity;
	isQuiet?: boolean;
	isDisabled?: boolean;
	onAction?: (key: string) => void;
	renderEmptyState?: Snippet;
	isLoading?: boolean;
	isLoadingMore?: boolean;
	onLoadMore?: () => void;
	children?: Snippet;
};

export type ListViewItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
	key: string;
	textValue?: string;
	href?: string;
	isDisabled?: boolean;
	children?: Snippet;
	description?: Snippet | string;
};
