import { createContext } from 'svelte';
import type { TooltipPlacement, TooltipVariant } from './types.js';

export interface TooltipStateProps {
	readonly anchorId: string;
	readonly placement: TooltipPlacement;
	readonly variant: TooltipVariant;
	readonly hasIcon: boolean;
	readonly maxWidth: number;
	readonly shouldFlip: boolean;
	readonly offset: number;
}

export class TooltipState {
	#props: TooltipStateProps;

	constructor(props: TooltipStateProps) {
		this.#props = props;
	}

	get anchorId() {
		return this.#props.anchorId;
	}
	get placement() {
		return this.#props.placement;
	}
	get variant() {
		return this.#props.variant;
	}
	get hasIcon() {
		return this.#props.hasIcon;
	}
	get maxWidth() {
		return this.#props.maxWidth;
	}
	get shouldFlip() {
		return this.#props.shouldFlip;
	}
	get offset() {
		return this.#props.offset;
	}
}

export const [getTooltipContext, setTooltipContext] = createContext<TooltipState>();
