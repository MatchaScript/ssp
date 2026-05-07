import { createContext, getContext, setContext, hasContext } from 'svelte';
import {
	SelectableCollection,
	type ItemRegistration,
	type SelectionMode,
	type FocusStrategy
} from '$lib/utils/selectable-collection/index.js';

// ─── Types ───────────────────────────────────────────────────────────

export type MenuSize = 's' | 'm' | 'l' | 'xl';
export type { SelectionMode, FocusStrategy };

// ─── MenuState ───────────────────────────────────────────────────────

export interface MenuStateProps {
	readonly size: MenuSize;
	readonly selectionMode: SelectionMode;
	readonly selectedKeys: Set<string>;
	readonly onAction?: (id: string) => void;
	readonly onSelectionChange?: (keys: Set<string>) => void;
	readonly onClose?: () => void;
}

export class MenuState {
	#props: MenuStateProps;
	#collection: SelectableCollection;

	constructor(props: MenuStateProps) {
		this.#props = props;
		this.#collection = new SelectableCollection({
			get selectionMode() {
				return props.selectionMode;
			},
			get selectedKeys() {
				return props.selectedKeys;
			},
			shouldFocusWrap: true,
			onSelectionChange: (keys) => props.onSelectionChange?.(keys)
		});
	}

	get size() {
		return this.#props.size;
	}
	get selectionMode() {
		return this.#props.selectionMode;
	}
	get selectedKeys() {
		return this.#props.selectedKeys;
	}
	get highlightedId() {
		return this.#collection.highlightedId;
	}
	get onClose() {
		return this.#props.onClose;
	}

	// ── Delegates to SelectableCollection ──

	registerItem(reg: ItemRegistration): () => void {
		return this.#collection.registerItem(reg);
	}

	updateItem(domId: string, updates: Partial<Pick<ItemRegistration, 'disabled' | 'textValue'>>) {
		this.#collection.updateItem(domId, updates);
	}

	highlight(domId: string | null, opts?: { focusVisible?: boolean }) {
		this.#collection.highlight(domId, opts);
	}

	focusFirst(opts?: { focusVisible?: boolean }) {
		this.#collection.focusFirst(opts);
	}

	focusLast(opts?: { focusVisible?: boolean }) {
		this.#collection.focusLast(opts);
	}

	isSelected(value: string): boolean {
		return this.#collection.isSelected(value);
	}

	// ── Menu-specific: action + close orchestration ──

	selectItem(id: string) {
		const value = this.#collection.getValue(id);
		if (value === undefined) return;

		this.#props.onAction?.(value);

		if (this.selectionMode === 'none') {
			this.#props.onClose?.();
			return;
		}

		this.#collection.toggleSelection(value);

		if (this.selectionMode === 'single') {
			this.#props.onClose?.();
		}
	}

	// ── Keyboard: delegates nav to collection, handles Escape locally ──

	handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			// Stop bubbling so a nested submenu's Escape only closes itself, not all ancestor menus.
			event.stopPropagation();
			this.#props.onClose?.();
			return;
		}

		const activatedId = this.#collection.handleKeyDown(event);
		if (activatedId) {
			this.selectItem(activatedId);
		}
	}
}

// ─── MenuTriggerState types ──────────────────────────────────────────

export interface PendingMenuFocus {
	readonly strategy: FocusStrategy;
	/** Whether the opener was keyboard-driven. Maps to `.focus({ focusVisible })`. */
	readonly focusVisible: boolean;
}

export interface MenuTriggerContext {
	readonly open: boolean;
	readonly anchorId: string;
	/** 'submenu' when inside a SubmenuTrigger, 'root' otherwise */
	readonly variant: 'root' | 'submenu';
	closeMenu(): void;
	/** Consume and clear the pending focus strategy (called by Menu on mount/open). */
	consumeFocusStrategy(): PendingMenuFocus | null;
}

export interface SubmenuTriggerContext {
	readonly open: boolean;
	readonly anchorId: string;
	registerTriggerItem(el: HTMLElement): void;
	openSubmenu(): void;
	closeSubmenu(): void;
	handleTriggerPointerEnter(): void;
	handleTriggerPointerLeave(): void;
	handleContentPointerEnter(): void;
	handleContentPointerLeave(): void;
	handleSubTriggerKeydown(event: KeyboardEvent): void;
	/** Called by the submenu body on keydown — handles ArrowLeft to close + refocus trigger. */
	handleSubmenuKeydown(event: KeyboardEvent): void;
}

export interface MenuSectionContext {
	readonly headingId: string;
}

// ─── Context ─────────────────────────────────────────────────────────

export const [getMenuContext, setMenuContext] = createContext<MenuState>();
export const [getMenuSectionContext, setMenuSectionContext] = createContext<MenuSectionContext>();

// Optional contexts: may not exist when component is used standalone.
// Use string keys (not Symbols) to survive monorepo module duplication.

const MENU_TRIGGER_CTX = 'ssp:MenuTriggerContext';
const SUBMENU_TRIGGER_CTX = 'ssp:SubmenuTriggerContext';

export function setMenuTriggerContext(ctx: MenuTriggerContext) {
	setContext(MENU_TRIGGER_CTX, ctx);
}

/**
 * Get the MenuTriggerContext. Returns `null` when not inside a MenuTrigger/SubmenuTrigger.
 */
export function getMenuTriggerContext(): MenuTriggerContext | null {
	if (!hasContext(MENU_TRIGGER_CTX)) return null;
	return getContext<MenuTriggerContext>(MENU_TRIGGER_CTX);
}

export function setSubmenuTriggerContext(ctx: SubmenuTriggerContext) {
	setContext(SUBMENU_TRIGGER_CTX, ctx);
}

/**
 * Shadow the SubmenuTriggerContext for descendants. Used by `<Menu>` so that
 * MenuItems inside a submenu body don't inherit their parent SubmenuTrigger's
 * context and get mistakenly treated as sub-triggers.
 */
export function clearSubmenuTriggerContext() {
	setContext(SUBMENU_TRIGGER_CTX, null);
}

export function getSubmenuTriggerContext(): SubmenuTriggerContext | null {
	if (!hasContext(SUBMENU_TRIGGER_CTX)) return null;
	const ctx = getContext<SubmenuTriggerContext | null>(SUBMENU_TRIGGER_CTX);
	return ctx ?? null;
}
