import type {
	MenuTriggerContext,
	SubmenuTriggerContext,
	PendingMenuFocus
} from './menu.svelte.js';

const HOVER_OPEN_DELAY_MS = 200;
const HOVER_CLOSE_DELAY_MS = 200;

export interface SubmenuTriggerStateProps {
	readonly anchorId: string;
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
}

export class SubmenuTriggerState implements SubmenuTriggerContext, MenuTriggerContext {
	#props: SubmenuTriggerStateProps;
	#triggerEl: HTMLElement | null = null;
	#openTimer: ReturnType<typeof setTimeout> | null = null;
	#closeTimer: ReturnType<typeof setTimeout> | null = null;
	#pendingFocus: PendingMenuFocus | null = null;
	menuEl: HTMLElement | null = null;

	constructor(props: SubmenuTriggerStateProps) {
		this.#props = props;
	}

	// ── MenuTriggerContext ──

	get open() {
		return this.#props.open;
	}
	get anchorId() {
		return this.#props.anchorId;
	}
	get variant(): 'submenu' {
		return 'submenu';
	}

	consumeFocusStrategy(): PendingMenuFocus | null {
		const s = this.#pendingFocus;
		this.#pendingFocus = null;
		return s;
	}

	closeMenu() {
		this.closeSubmenu();
	}

	// ── SubmenuTriggerContext ──

	registerTriggerItem(el: HTMLElement) {
		this.#triggerEl = el;
	}

	openSubmenu() {
		this.#clearTimers();
		if (this.open) return;
		this.#pendingFocus = { strategy: 'first', focusVisible: true };
		this.#props.onOpenChange(true);
	}

	closeSubmenu() {
		this.#clearTimers();
		if (!this.open) return;
		this.#props.onOpenChange(false);
	}

	handleTriggerPointerEnter() {
		this.#clearCloseTimer();
		if (this.open) return;
		this.#openTimer = setTimeout(() => {
			this.#pendingFocus = null; // pointer open → don't auto-focus
			this.#props.onOpenChange(true);
		}, HOVER_OPEN_DELAY_MS);
	}

	handleTriggerPointerLeave() {
		this.#clearOpenTimer();
		if (!this.open) return;
		this.#closeTimer = setTimeout(() => {
			this.#props.onOpenChange(false);
		}, HOVER_CLOSE_DELAY_MS);
	}

	/** Called when pointer enters the submenu content — cancel pending close. */
	handleContentPointerEnter() {
		this.#clearCloseTimer();
	}

	/** Called when pointer leaves the submenu content. */
	handleContentPointerLeave() {
		if (!this.open) return;
		this.#closeTimer = setTimeout(() => {
			this.#props.onOpenChange(false);
		}, HOVER_CLOSE_DELAY_MS);
	}

	/** Keyboard: ArrowRight / Enter / Space on a sub-trigger opens the submenu and focuses
	 *  the first item. stopPropagation prevents the parent menu's selectItem flow from
	 *  firing onClose and tearing the whole menu down. */
	handleSubTriggerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			event.stopPropagation();
			this.openSubmenu();
		}
	}

	/** Keyboard: ArrowLeft (LTR) from inside the submenu closes it and refocuses trigger. */
	handleSubmenuKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			event.stopPropagation();
			this.closeSubmenu();
			this.#triggerEl?.focus({ focusVisible: true });
		}
	}

	get triggerEl() {
		return this.#triggerEl;
	}

	// ── Internal ──

	#clearOpenTimer() {
		if (this.#openTimer !== null) {
			clearTimeout(this.#openTimer);
			this.#openTimer = null;
		}
	}

	#clearCloseTimer() {
		if (this.#closeTimer !== null) {
			clearTimeout(this.#closeTimer);
			this.#closeTimer = null;
		}
	}

	#clearTimers() {
		this.#clearOpenTimer();
		this.#clearCloseTimer();
	}
}
