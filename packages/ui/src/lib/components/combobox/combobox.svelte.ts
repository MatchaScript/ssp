import { createContext } from 'svelte';

export interface ComboboxStateProps {
	readonly selectedKey: string | undefined;
	readonly isDisabled: boolean;
	readonly isQuiet: boolean;
	readonly isInvalid: boolean;
	readonly size: 's' | 'm' | 'l' | 'xl';
	readonly anchorId: string;
}

export class ComboboxState {
	#props: ComboboxStateProps;

	constructor(props: ComboboxStateProps) {
		this.#props = props;
	}

	get anchorId() {
		return this.#props.anchorId;
	}
	get selectedKey() {
		return this.#props.selectedKey;
	}
	get isDisabled() {
		return this.#props.isDisabled;
	}
	get isQuiet() {
		return this.#props.isQuiet;
	}
	get isInvalid() {
		return this.#props.isInvalid;
	}
	get size() {
		return this.#props.size;
	}
}

export const [getComboboxContext, setComboboxContext] = createContext<ComboboxState>();
