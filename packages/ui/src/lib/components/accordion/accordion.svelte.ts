import { createContext } from 'svelte';

// ── Types ───────────────────────────────────────

export type AccordionSize = 's' | 'm' | 'l' | 'xl';
export type AccordionDensity = 'compact' | 'regular' | 'spacious';

export interface AccordionStateProps {
	readonly size: AccordionSize;
	readonly density: AccordionDensity;
	readonly isQuiet: boolean;
}

// ── State ───────────────────────────────────────

export class AccordionState {
	#props: AccordionStateProps;

	constructor(props: AccordionStateProps) {
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
}

// ── Context ─────────────────────────────────────

export const [getAccordionContext, setAccordionContext] = createContext<AccordionState>();
