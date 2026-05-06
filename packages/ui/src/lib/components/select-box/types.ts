import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type SelectBoxSelectionMode = 'single' | 'multiple';
export type SelectBoxOrientation = 'vertical' | 'horizontal';

export type SelectBoxGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
	selectionMode?: SelectBoxSelectionMode;
	orientation?: SelectBoxOrientation;
	isDisabled?: boolean;
	selectedKeys?: Set<string>;
	defaultSelectedKeys?: Set<string>;
	onSelectionChange?: (keys: Set<string>) => void;
	disabledKeys?: Set<string>;
	children?: Snippet;
};

export type SelectBoxProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
	key: string;
	textValue?: string;
	isDisabled?: boolean;
	illustration?: Snippet;
	description?: Snippet | string;
	children?: Snippet;
};
