import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export type TabsProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'selectedKey' | 'defaultSelectedKey' | 'onSelectionChange'
> & {
	selectedKey?: string | number;
	defaultSelectedKey?: string | number;
	onSelectionChange?: (key: string | number) => void;
	isDisabled?: boolean;
	density?: 'compact' | 'regular';
	children?: Snippet;
};

export type TabsListProps = HTMLAttributes<HTMLDivElement> & {
	children?: Snippet;
};

export type TabsTriggerProps = Omit<HTMLButtonAttributes, 'value'> & {
	value: string | number;
	isDisabled?: boolean;
	children?: Snippet;
};

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
	value: string | number;
	children?: Snippet;
};
