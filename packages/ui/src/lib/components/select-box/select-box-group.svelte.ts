import { createContext } from 'svelte';
import type { SelectBoxOrientation, SelectBoxSelectionMode } from './types.js';

export interface SelectBoxGroupStateProps {
	readonly selectionMode: SelectBoxSelectionMode;
	readonly orientation: SelectBoxOrientation;
	readonly selectedKeys: Set<string>;
	readonly disabledKeys: Set<string>;
	readonly isDisabled: boolean;
	readonly focusedKey: string | null;
	readonly toggleSelection: (key: string) => void;
	readonly setFocusedKey: (key: string | null) => void;
	readonly registerKey: (key: string) => void;
	readonly unregisterKey: (key: string) => void;
}

export class SelectBoxGroupState {
	#props: SelectBoxGroupStateProps;

	constructor(props: SelectBoxGroupStateProps) {
		this.#props = props;
	}

	get selectionMode() {
		return this.#props.selectionMode;
	}
	get orientation() {
		return this.#props.orientation;
	}
	get selectedKeys() {
		return this.#props.selectedKeys;
	}
	get isDisabled() {
		return this.#props.isDisabled;
	}
	get focusedKey() {
		return this.#props.focusedKey;
	}

	isSelected(key: string): boolean {
		return this.#props.selectedKeys.has(key);
	}

	isItemDisabled(key: string): boolean {
		return this.#props.isDisabled || this.#props.disabledKeys.has(key);
	}

	toggleSelection(key: string) {
		this.#props.toggleSelection(key);
	}
	setFocusedKey(key: string | null) {
		this.#props.setFocusedKey(key);
	}
	registerKey(key: string) {
		this.#props.registerKey(key);
	}
	unregisterKey(key: string) {
		this.#props.unregisterKey(key);
	}
}

export const [getSelectBoxGroupContext, setSelectBoxGroupContext] =
	createContext<SelectBoxGroupState>();
