import { createContext } from 'svelte';

export interface ActionBarStateProps {
	readonly isEmphasized: boolean;
}

export class ActionBarState {
	#props: ActionBarStateProps;

	constructor(props: ActionBarStateProps) {
		this.#props = props;
	}

	get isEmphasized() {
		return this.#props.isEmphasized;
	}
}

export const [getActionBarContext, setActionBarContext] = createContext<ActionBarState>();
