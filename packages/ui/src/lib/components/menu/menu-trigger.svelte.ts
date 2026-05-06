import type { FocusStrategy, MenuTriggerContext, PendingMenuFocus } from './menu.svelte.js';

export interface MenuTriggerStateProps {
	readonly anchorId: string;
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
}

export class MenuTriggerState implements MenuTriggerContext {
	#props: MenuTriggerStateProps;
	#pendingFocus: PendingMenuFocus | null = null;
	menuEl: HTMLElement | null = null;

	constructor(props: MenuTriggerStateProps) {
		this.#props = props;
	}

	get open() {
		return this.#props.open;
	}
	get anchorId() {
		return this.#props.anchorId;
	}
	get variant(): 'root' {
		return 'root';
	}

	/** Consume and clear the pending focus strategy (called by Menu on mount/open). */
	consumeFocusStrategy(): PendingMenuFocus | null {
		const s = this.#pendingFocus;
		this.#pendingFocus = null;
		return s;
	}

	openMenu(strategy: FocusStrategy, focusVisible: boolean) {
		if (this.open) return;
		this.#pendingFocus = { strategy, focusVisible };
		this.#props.onOpenChange(true);
	}

	closeMenu() {
		if (!this.open) return;
		this.#props.onOpenChange(false);
	}

	toggle(focusVisible: boolean) {
		if (this.open) {
			this.closeMenu();
		} else {
			this.openMenu('first', focusVisible);
		}
	}

	handleTriggerKeydown = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				this.openMenu('first', true);
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				this.openMenu('last', true);
				break;
			}
			case 'Enter':
			case ' ': {
				event.preventDefault();
				this.toggle(true);
				break;
			}
		}
	};

	handleTriggerClick = () => {
		this.toggle(false);
	};

	get triggerProps(): Record<string, unknown> {
		return {
			style: `anchor-name: ${this.anchorId}`,
			'aria-expanded': this.open,
			'aria-haspopup': 'menu' as const,
			onclick: this.handleTriggerClick,
			onkeydown: this.handleTriggerKeydown
		};
	}
}
