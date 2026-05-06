import { createContext } from 'svelte';

// ── Types ───────────────────────────────────────

export type DisclosureSize = 's' | 'm' | 'l' | 'xl';
export type DisclosureDensity = 'compact' | 'regular' | 'spacious';

export interface DisclosureStateProps {
	readonly size: DisclosureSize;
	readonly density: DisclosureDensity;
	readonly isQuiet: boolean;
	readonly isDisabled: boolean;
}

// ── State ───────────────────────────────────────

export class DisclosureState {
	#props: DisclosureStateProps;

	constructor(props: DisclosureStateProps) {
		this.#props = props;
	}

	get size() {
		return this.#props.size;
	}
	get density() {
		return this.#props.density;
	}
	get isQuiet() {
		return this.#props.isQuiet;
	}
	get isDisabled() {
		return this.#props.isDisabled;
	}
}

// ── Context ─────────────────────────────────────

export const [getDisclosureContext, setDisclosureContext] = createContext<DisclosureState>();
