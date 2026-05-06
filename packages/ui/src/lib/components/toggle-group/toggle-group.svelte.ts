import { createContext } from 'svelte';
import type { ActionButtonSize, ActionButtonStaticColor } from '../action-button/types.js';
import type { ToggleGroupDensity, ToggleGroupOrientation } from './types.js';

export interface ToggleGroupStateProps {
	readonly size: ActionButtonSize;
	readonly density: ToggleGroupDensity;
	readonly orientation: ToggleGroupOrientation;
	readonly isQuiet: boolean;
	readonly isJustified: boolean;
	readonly isDisabled: boolean;
	readonly isEmphasized: boolean;
	readonly staticColor: ActionButtonStaticColor | undefined;
}

export class ToggleGroupState {
	#props: ToggleGroupStateProps;

	constructor(props: ToggleGroupStateProps) {
		this.#props = props;
	}

	get size() {
		return this.#props.size;
	}
	get density() {
		return this.#props.density;
	}
	get orientation() {
		return this.#props.orientation;
	}
	get isQuiet() {
		return this.#props.isQuiet;
	}
	get isJustified() {
		return this.#props.isJustified;
	}
	get isDisabled() {
		return this.#props.isDisabled;
	}
	get isEmphasized() {
		return this.#props.isEmphasized;
	}
	get staticColor() {
		return this.#props.staticColor;
	}
}

export const [getToggleGroupContext, setToggleGroupContext] = createContext<ToggleGroupState>();
