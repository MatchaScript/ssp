import { createContext } from 'svelte';
import {
	SelectableCollection,
	type SelectionInputModifiers
} from '$lib/utils/selectable-collection/index.js';
import { getElementDirection } from '$lib/utils/direction.js';
import { getAnnouncer } from '$lib/utils/announcer/index.js';
import {
	handleTagRowKeydown,
	handleTagCellKeydown,
	type CellId,
	type FocusTarget,
	type KeyboardOutcome,
	type RowKeydownContext,
	type CellKeydownContext
} from './keyboard.js';
import type { TagGroupSelectionMode, TagGroupSize } from './types.js';

interface TagEntry {
	readonly key: string;
	readonly isDisabled: boolean;
	readonly textValue: string;
	readonly isLink: boolean;
}

export interface TagRegistration {
	domId: string;
	value: string;
	el: HTMLElement;
	disabled: boolean;
	textValue: string;
	isLink: boolean;
}

export interface TagGroupStateProps {
	readonly size: TagGroupSize;
	readonly isEmphasized: boolean;
	readonly isDisabled: boolean;
	readonly isReadOnly: boolean;
	readonly disabledKeys: ReadonlySet<string>;
	readonly selectionMode: TagGroupSelectionMode;
	readonly selectedKeys: ReadonlySet<string>;
	readonly disallowEmptySelection: boolean;
	readonly onSelectionChange?: (keys: Set<string>) => void;
	readonly onRemove?: (keys: Set<string>) => void;
}

const FOCUS_OPTS = { focusVisible: true } as FocusOptions;

/**
 * Owns the runtime state for a single TagGroup instance. Selection / typeahead /
 * roving focus on the row level are delegated to a shared `SelectableCollection`.
 * Cell-mode 2D nav is a TagGroup-local concern: a `$state` slot tracks the focused
 * cell and DOM elements are discovered at handler call time via `data-spectrum-tag-cell-id`.
 */
export class TagGroupState {
	#props: TagGroupStateProps;
	#collection: SelectableCollection;

	#tags: TagEntry[] = $state([]); // markup order, source of truth for `rows` snapshot

	#focusedCell: { rowKey: string; cellId: CellId } | null = $state(null);

	#focusHostEl: HTMLElement | null = null; // set by tag-group.svelte via setFocusHost()

	#hasFocusWithin = $state(false);
	#focusinTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(props: TagGroupStateProps) {
		this.#props = props;
		this.#collection = new SelectableCollection({
			get selectionMode() {
				return props.selectionMode;
			},
			get selectedKeys() {
				return props.selectedKeys as Set<string>;
			},
			selectionBehavior: 'toggle',
			shouldFocusWrap: false,
			get disallowEmptySelection() {
				return props.disallowEmptySelection;
			},
			onSelectionChange: (keys) => {
				const prev = new Set(props.selectedKeys);
				props.onSelectionChange?.(keys);
				this.#announceSelection(prev, keys);
			}
		});
	}

	// ── option pass-through ──────────────────────────────────────
	get size() {
		return this.#props.size;
	}
	get isEmphasized() {
		return this.#props.isEmphasized;
	}
	get isDisabled() {
		return this.#props.isDisabled;
	}
	get isReadOnly() {
		return this.#props.isReadOnly;
	}
	get selectionMode() {
		return this.#props.selectionMode;
	}
	get allowsRemoving() {
		return this.#props.onRemove !== undefined && !this.#props.isReadOnly;
	}
	get isEmpty() {
		return this.#tags.length === 0;
	}
	get hasFocusWithin() {
		return this.#hasFocusWithin;
	}
	get hasHighlight(): boolean {
		return this.#collection.highlightedId !== null;
	}

	// ── focus host wiring ───────────────────────────────────────
	setFocusHost(el: HTMLElement | null) {
		this.#focusHostEl = el;
	}
	onFocusIn() {
		if (this.#focusinTimer) clearTimeout(this.#focusinTimer);
		this.#hasFocusWithin = true;
	}
	onFocusOut() {
		// Defer: focus moves between siblings within the grid all the time. A
		// short tick lets us collapse those into "still inside".
		if (this.#focusinTimer) clearTimeout(this.#focusinTimer);
		this.#focusinTimer = setTimeout(() => {
			this.#hasFocusWithin = false;
			this.#focusedCell = null;
		}, 0);
	}

	// ── tag registration ────────────────────────────────────────
	registerTag(reg: TagRegistration): () => void {
		this.#tags = [
			...this.#tags,
			{
				key: reg.value,
				isDisabled: reg.disabled,
				textValue: reg.textValue,
				isLink: reg.isLink
			}
		];
		const unregister = this.#collection.registerItem({
			domId: reg.domId,
			value: reg.value,
			el: reg.el,
			disabled: reg.disabled,
			textValue: reg.textValue
		});
		return () => {
			this.#tags = this.#tags.filter((t) => t.key !== reg.value);
			unregister();
		};
	}

	updateTag(
		domId: string,
		updates: { disabled?: boolean; textValue?: string; isLink?: boolean }
	) {
		this.#collection.updateItem(domId, {
			disabled: updates.disabled,
			textValue: updates.textValue
		});
		// We need to keep #tags in sync too, since `keyboard.ts` reads from it.
		// Tags are keyed by value, but updateTag is keyed by domId — resolve via
		// SelectableCollection's getValue.
		const value = this.#collection.getValue(domId);
		if (!value) return;
		this.#tags = this.#tags.map((t) =>
			t.key === value
				? {
						...t,
						isDisabled: updates.disabled ?? t.isDisabled,
						textValue: updates.textValue ?? t.textValue,
						isLink: updates.isLink ?? t.isLink
					}
				: t
		);
	}

	// ── queries ─────────────────────────────────────────────────
	isSelected(value: string): boolean {
		return this.#collection.isSelected(value);
	}
	isTagDisabled(value: string): boolean {
		return this.#props.isDisabled || this.#props.disabledKeys.has(value);
	}
	isLink(value: string): boolean {
		return this.#tags.find((t) => t.key === value)?.isLink ?? false;
	}
	isCellFocused(rowKey: string, cellId: CellId): boolean {
		const f = this.#focusedCell;
		return f !== null && f.rowKey === rowKey && f.cellId === cellId;
	}
	isRowFocused(domId: string): boolean {
		// In cell mode, no row carries tabindex=0 for focus highlighting.
		if (this.#focusedCell !== null) return false;
		return this.#collection.highlightedId === domId;
	}
	get isCellModeActive(): boolean {
		return this.#focusedCell !== null;
	}

	// ── tabindex helpers (single tab stop) ──────────────────────
	getContainerTabIndex(): 0 | -1 {
		// Empty grid is the only candidate when there are no tags.
		return this.isEmpty ? 0 : -1;
	}
	getRowTabIndex(domId: string): 0 | -1 {
		if (this.isCellModeActive) return -1;
		const highlighted = this.#collection.highlightedId;
		if (highlighted === null) {
			// No highlight yet — first enabled row gets the tab stop.
			const first = this.#firstEnabledTag();
			if (!first) return -1;
			return this.#collection.getDomId(first.key) === domId ? 0 : -1;
		}
		return highlighted === domId ? 0 : -1;
	}
	getCellTabIndex(rowKey: string, cellId: CellId): 0 | -1 {
		return this.isCellFocused(rowKey, cellId) ? 0 : -1;
	}

	// ── high-level event entry points ───────────────────────────
	onRowFocus(domId: string): void {
		this.#focusedCell = null;
		this.#collection.syncHighlight(domId);
	}
	onCellFocus(rowKey: string, cellId: CellId): void {
		this.#focusedCell = { rowKey, cellId };
		const domId = this.#collection.getDomId(rowKey);
		if (domId) this.#collection.syncHighlight(domId);
	}

	onRowClick(rowKey: string, event: MouseEvent): void {
		if (this.isTagDisabled(rowKey)) return;
		if (this.isLink(rowKey)) return; // native <a> handles click
		if (this.#props.selectionMode === 'none') return;
		this.#collection.selectFromInput(rowKey, mouseModifiers(event));
	}

	onRowKeydown(event: KeyboardEvent, rowKey: string): void {
		const ctx = this.#rowCtx(rowKey);
		const outcome = handleTagRowKeydown(event, ctx);
		this.#applyOutcome(event, outcome, rowKey);
	}
	onCellKeydown(event: KeyboardEvent, rowKey: string, cellId: CellId): void {
		const ctx: CellKeydownContext = { ...this.#rowCtx(rowKey), currentCellId: cellId };
		const outcome = handleTagCellKeydown(event, ctx);
		this.#applyOutcome(event, outcome, rowKey);
	}

	focusFirst(opts: { focusVisible?: boolean } = {}): void {
		this.#focusedCell = null;
		this.#collection.focusFirst(opts);
	}

	// ── removal ─────────────────────────────────────────────────
	removeKey(rowKey: string): void {
		const onRemove = this.#props.onRemove;
		if (!onRemove) return;
		if (this.isTagDisabled(rowKey)) return;
		const selected = this.#props.selectedKeys;
		const keys =
			selected.has(rowKey) && selected.size > 1 ? new Set(selected) : new Set([rowKey]);
		onRemove(keys);
		const announcer = this.#getAnnouncer();
		if (announcer) {
			if (keys.size === 1) {
				const tag = this.#tags.find((t) => t.key === rowKey);
				announcer.announce(`${tag?.textValue ?? rowKey} removed`, 'polite');
			} else {
				announcer.announce(`${keys.size} tags removed`, 'polite');
			}
		}
	}

	// ── internals ───────────────────────────────────────────────
	#rowCtx(rowKey: string): RowKeydownContext {
		const dir = getElementDirection(this.#focusHostEl);
		return {
			rows: this.#tags.map((t) => ({ key: t.key, disabled: t.isDisabled, isLink: t.isLink })),
			currentRowKey: rowKey,
			dir,
			hasRemoveButton: () => this.allowsRemoving,
			selectionMode: this.#props.selectionMode,
			allowsSelectAll: !this.#props.isReadOnly && !this.#props.isDisabled
		};
	}

	#applyOutcome(event: KeyboardEvent, outcome: KeyboardOutcome, rowKey: string): void {
		if (!outcome) return;
		event.preventDefault();
		switch (outcome.type) {
			case 'focus':
				this.#focusTarget(outcome.target);
				return;
			case 'select':
				this.#collection.selectFromInput(outcome.rowKey, {
					shiftKey: outcome.modifiers.shift,
					ctrlKey: outcome.modifiers.ctrlOrMeta,
					metaKey: outcome.modifiers.ctrlOrMeta
				});
				return;
			case 'activateLink':
				this.#activateLink(outcome.rowKey, outcome.modifiers);
				return;
			case 'remove':
				this.removeKey(outcome.rowKey);
				return;
			case 'selectAll':
				this.#selectAllNonLink();
				return;
			case 'clearSelection':
				this.#collection.clearSelection();
				return;
			case 'typeahead':
				// Forward to SelectableCollection (it consumes event.key via its handler).
				this.#collection.handleKeyDown(event);
				return;
		}
	}

	#focusTarget(target: FocusTarget): void {
		if (target.kind === 'row') {
			this.#focusedCell = null;
			const domId = this.#collection.getDomId(target.rowKey);
			if (!domId) return;
			this.#collection.highlight(domId, FOCUS_OPTS);
			return;
		}
		// cell
		this.#focusedCell = { rowKey: target.rowKey, cellId: target.cellId };
		const rowDomId = this.#collection.getDomId(target.rowKey);
		if (rowDomId) this.#collection.syncHighlight(rowDomId);
		// Discover the cell element from the DOM (no registry).
		const rowEl = rowDomId ? this.#collection.getElement(rowDomId) : null;
		const cellEl = rowEl?.querySelector<HTMLElement>(
			`[data-spectrum-tag-cell-id="${target.cellId}"]`
		);
		cellEl?.focus(FOCUS_OPTS);
	}

	#activateLink(rowKey: string, mods: { shift: boolean; ctrlOrMeta: boolean }): void {
		const domId = this.#collection.getDomId(rowKey);
		const rowEl = domId ? this.#collection.getElement(domId) : null;
		const linkEl = rowEl?.querySelector<HTMLAnchorElement>('a[data-tag-link]');
		if (!linkEl) return;
		const synthetic = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			button: 0,
			ctrlKey: mods.ctrlOrMeta,
			metaKey: mods.ctrlOrMeta,
			shiftKey: mods.shift
		});
		linkEl.dispatchEvent(synthetic);
	}

	#firstEnabledTag(): TagEntry | null {
		return this.#tags.find((t) => !t.isDisabled) ?? null;
	}

	/**
	 * Ctrl/Cmd+A in multiple mode. Spec: link tags are skipped — they don't
	 * participate in selection. We bypass `SelectableCollection.selectAll()`
	 * (which has no link awareness) and dispatch a single onSelectionChange.
	 */
	#selectAllNonLink(): void {
		if (this.#props.selectionMode !== 'multiple') return;
		const next = new Set<string>();
		for (const tag of this.#tags) {
			if (tag.isLink) continue;
			if (tag.isDisabled) continue;
			if (this.#props.disabledKeys.has(tag.key)) continue;
			next.add(tag.key);
		}
		const prev = new Set(this.#props.selectedKeys);
		this.#props.onSelectionChange?.(next);
		this.#announceSelection(prev, next);
	}

	#getAnnouncer() {
		if (typeof document === 'undefined') return null;
		return getAnnouncer(document);
	}

	#announceSelection(prev: ReadonlySet<string>, next: ReadonlySet<string>): void {
		if (this.#props.selectionMode === 'none') return;
		if (!this.#hasFocusWithin) return;
		const announcer = this.#getAnnouncer();
		if (!announcer) return;
		const added: string[] = [];
		const removed: string[] = [];
		for (const k of next) if (!prev.has(k)) added.push(k);
		for (const k of prev) if (!next.has(k)) removed.push(k);

		if (added.length === 1 && removed.length === 0) {
			const tag = this.#tags.find((t) => t.key === added[0]);
			announcer.announce(`${tag?.textValue ?? added[0]} selected`, 'polite');
			return;
		}
		if (removed.length === 1 && added.length === 0) {
			const tag = this.#tags.find((t) => t.key === removed[0]);
			announcer.announce(`${tag?.textValue ?? removed[0]} not selected`, 'polite');
			return;
		}
		if (next.size === 0) {
			announcer.announce('Selection cleared', 'polite');
			return;
		}
		announcer.announce(`${next.size} items selected`, 'polite');
	}
}

function mouseModifiers(e: MouseEvent): SelectionInputModifiers {
	return {
		shiftKey: e.shiftKey,
		ctrlKey: e.ctrlKey,
		metaKey: e.metaKey,
		pointerType: 'mouse'
	};
}

export const [getTagGroupContext, setTagGroupContext] = createContext<TagGroupState>();
