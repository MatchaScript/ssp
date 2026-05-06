import { createContext } from 'svelte';
import type { DialogSize } from './types.js';

export interface DialogStateProps {
	readonly size: DialogSize;
	readonly isDismissible: boolean;
	readonly isKeyboardDismissDisabled: boolean;
	readonly isOpen: boolean;
	readonly requestOpen: () => void;
	readonly requestClose: () => void;
}

export class DialogState {
	#props: DialogStateProps;

	// Registered by child components for aria linking
	headingId = $state<string | undefined>(undefined);
	descriptionId = $state<string | undefined>(undefined);
	dialogId = $state<string | undefined>(undefined);

	constructor(props: DialogStateProps) {
		this.#props = props;
	}

	get size() {
		return this.#props.size;
	}
	get isDismissible() {
		return this.#props.isDismissible;
	}
	get isKeyboardDismissDisabled() {
		return this.#props.isKeyboardDismissDisabled;
	}
	get isOpen() {
		return this.#props.isOpen;
	}

	open() {
		this.#props.requestOpen();
	}
	close() {
		this.#props.requestClose();
	}
}

export const [getDialogContext, setDialogContext] = createContext<DialogState>();
