import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
	id?: string;
	/** The id of the currently selected item (controlled) */
	selectedKey?: string;
	/** The id of the initial selected item (uncontrolled) */
	defaultSelectedKey?: string;
	/** Handler that is called when the selection changes */
	onSelectionChange?: (id: string) => void;
	/** Whether the segmented control is disabled */
	isDisabled?: boolean;
	/** Whether the items should divide the container width equally */
	isJustified?: boolean;
	/** The content to display */
	children: Snippet;
}

export interface SegmentedControlItemProps extends Omit<HTMLButtonAttributes, 'id' | 'value'> {
	/** The id of the item, matching the value used in SegmentedControl's selectedKey prop */
	id: string;
	/** Whether the item is disabled or not */
	isDisabled?: boolean;
	/** The content to display in the segmented control item */
	children?: Snippet;
}
