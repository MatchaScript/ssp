import { createContext } from 'svelte';
import {
	SelectableCollection,
	type ItemRegistration,
	type SelectionInputModifiers
} from '$lib/utils/selectable-collection/index.js';
import type { ListViewDensity, ListViewSelectionMode, ListViewSelectionStyle } from './types.js';

export interface ListViewStateProps {
	readonly selectionMode: ListViewSelectionMode;
	readonly selectionStyle: ListViewSelectionStyle;
	readonly selectedKeys: Set<string>;
	readonly disabledKeys: Set<string>;
	readonly density: ListViewDensity;
	readonly isQuiet: boolean;
	readonly isDisabled: boolean;
	readonly onAction?: (key: string) => void;
	readonly onSelectionChange?: (keys: Set<string>) => void;
}

/**
 * ListView's stateful facade over `SelectableCollection`.
 *
 * Maps the public `selectionStyle: 'highlight' | 'checkbox'` onto the
 * collection's `selectionBehavior: 'replace' | 'toggle'`. Exposes only what
 * `<ListView>` and `<ListViewItem>` need (visual modifiers + delegation).
 */
export class ListViewState {
	#props: ListViewStateProps;
	#collection: SelectableCollection;

	constructor(props: ListViewStateProps) {
		this.#props = props;
		this.#collection = new SelectableCollection({
			get selectionMode() {
				return props.selectionMode;
			},
			get selectedKeys() {
				return props.selectedKeys;
			},
			get selectionBehavior() {
				return props.selectionStyle === 'highlight' ? 'replace' : 'toggle';
			},
			shouldFocusWrap: false,
			onSelectionChange: (keys) => props.onSelectionChange?.(keys)
		});
	}

	// ── Visual / mode getters ──

	get selectionMode() {
		return this.#props.selectionMode;
	}
	get selectionStyle() {
		return this.#props.selectionStyle;
	}
	get density() {
		return this.#props.density;
	}
	get isQuiet() {
		return this.#props.isQuiet;
	}
	get isDisabled() {
		return this.#props.isDisabled;
	}
	get onAction() {
		return this.#props.onAction;
	}

	/** Combine the parent-level disabled flag with per-key disabled keys. */
	isItemDisabled(value: string): boolean {
		return this.#props.isDisabled || this.#props.disabledKeys.has(value);
	}

	// ── Collection delegation ──

	get highlightedId() {
		return this.#collection.highlightedId;
	}

	registerItem(reg: ItemRegistration): () => void {
		return this.#collection.registerItem(reg);
	}

	updateItem(
		domId: string,
		updates: Partial<Pick<ItemRegistration, 'disabled' | 'textValue'>>
	) {
		this.#collection.updateItem(domId, updates);
	}

	highlight(domId: string | null, opts?: { focusVisible?: boolean }) {
		this.#collection.highlight(domId, opts);
	}

	syncHighlight(domId: string | null) {
		this.#collection.syncHighlight(domId);
	}

	focusFirst(opts?: { focusVisible?: boolean }) {
		this.#collection.focusFirst(opts);
	}

	isSelected(value: string): boolean {
		return this.#collection.isSelected(value);
	}

	selectFromInput(value: string, mods?: SelectionInputModifiers) {
		this.#collection.selectFromInput(value, mods);
	}

	/**
	 * Keyboard handler. Delegates to the collection for nav/select/typeahead;
	 * additionally fires `onAction` for the highlighted item when Enter is pressed.
	 */
	handleKeyDown(event: KeyboardEvent) {
		const activatedDomId = this.#collection.handleKeyDown(event);
		if (!activatedDomId) return;

		const value = this.#collection.getValue(activatedDomId);
		if (value === undefined) return;

		// Enter/Space both apply selection; only Enter additionally fires onAction.
		this.#collection.selectFromInput(value, {
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			metaKey: event.metaKey
		});
		if (event.key === 'Enter') this.#props.onAction?.(value);
	}
}

export const [getListViewContext, setListViewContext] = createContext<ListViewState>();
