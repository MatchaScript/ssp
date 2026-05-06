import { createContext } from 'svelte';
import type { ActionButtonGroupDensity, ActionButtonGroupOrientation } from './types.js';
import type { ActionButtonSize, ActionButtonStaticColor } from '../action-button/types.js';

export interface ActionButtonGroupStateProps {
	readonly size: ActionButtonSize;
	readonly density: ActionButtonGroupDensity;
	readonly orientation: ActionButtonGroupOrientation;
	readonly isQuiet: boolean;
	readonly isJustified: boolean;
	readonly isDisabled: boolean;
	readonly staticColor: ActionButtonStaticColor | undefined;
}

export class ActionButtonGroupState {
	#props: ActionButtonGroupStateProps;

	constructor(props: ActionButtonGroupStateProps) {
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
	get staticColor() {
		return this.#props.staticColor;
	}
}

export const [getActionButtonGroupContext, setActionButtonGroupContext] =
	createContext<ActionButtonGroupState>();
