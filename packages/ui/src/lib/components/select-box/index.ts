import Root from './select-box-group.svelte';
import Item from './select-box.svelte';

export {
	Root,
	Item,
	//
	Root as SelectBoxGroup,
	Item as SelectBox
};

export type {
	SelectBoxGroupProps as Props,
	SelectBoxGroupProps,
	SelectBoxProps as ItemProps,
	SelectBoxProps,
	SelectBoxSelectionMode as SelectionMode,
	SelectBoxOrientation as Orientation
} from './types.js';
