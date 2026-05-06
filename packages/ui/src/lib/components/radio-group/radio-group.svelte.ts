import { createContext } from 'svelte';
import type { FieldSize } from '../field/types.js';

export interface RadioGroupStateProps {
	readonly value: string | null;
	readonly name: string;
	readonly size: FieldSize;
	readonly isEmphasized: boolean;
	readonly isDisabled: boolean;
	readonly isError: boolean;
	readonly isReadOnly: boolean;
	readonly isRequired: boolean;
	readonly setValue: (value: string) => void;
}

export class RadioGroupState {
	#props: RadioGroupStateProps;

	constructor(props: RadioGroupStateProps) {
		this.#props = props;
	}

	get value() {
		return this.#props.value;
	}
	get name() {
		return this.#props.name;
	}
	get size() {
		return this.#props.size;
	}
	get isEmphasized() {
		return this.#props.isEmphasized;
	}
	get isDisabled() {
		return this.#props.isDisabled;
	}
	get isError() {
		return this.#props.isError;
	}
	get isReadOnly() {
		return this.#props.isReadOnly;
	}
	get isRequired() {
		return this.#props.isRequired;
	}

	isSelected(value: string): boolean {
		return this.#props.value === value;
	}

	setValue(value: string) {
		if (this.isDisabled || this.isReadOnly) return;
		this.#props.setValue(value);
	}
}

export const [getRadioGroupContext, setRadioGroupContext] = createContext<RadioGroupState>();
