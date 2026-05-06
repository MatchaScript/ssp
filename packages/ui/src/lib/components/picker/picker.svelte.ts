import { createContext } from 'svelte';

export interface PickerStateProps {
	readonly selectionMode: 'single' | 'multiple';
	readonly isDisabled: boolean;
	readonly isQuiet: boolean;
	readonly isInvalid: boolean;
	readonly size: 's' | 'm' | 'l' | 'xl';
	readonly anchorId: string;
	readonly selectedKey: string | string[] | undefined;
	readonly label: string | undefined;
}

export class PickerState {
	#props: PickerStateProps;

	constructor(props: PickerStateProps) {
		this.#props = props;
	}

	// ── Accessors ───────────────────────────────────

	get anchorId() {
		return this.#props.anchorId;
	}
	get selectedKey() {
		return this.#props.selectedKey;
	}
	get selectionMode() {
		return this.#props.selectionMode;
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

	/**
	 * Display label resolved in this order:
	 * 1. Explicit label prop (SSR-safe, always available)
	 * 2. Raw selectedKey as fallback
	 */
	get resolvedLabel(): string {
		if (this.#props.label !== undefined) return this.#props.label;

		const v = this.#props.selectedKey;
		if (v === undefined) return '';

		if (Array.isArray(v)) {
			return v.join(', ');
		}

		return v;
	}
}

export const [getPickerContext, setPickerContext] = createContext<PickerState>();
