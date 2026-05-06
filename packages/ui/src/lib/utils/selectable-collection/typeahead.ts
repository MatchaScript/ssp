import type { ItemRegistration } from './selectable-collection.svelte.js';

const TYPEAHEAD_RESET_MS = 500;

export class Typeahead {
	#search = '';
	#timer: ReturnType<typeof setTimeout> | null = null;
	#getItems: () => ItemRegistration[];
	#onMatch: (domId: string) => void;

	constructor(getItems: () => ItemRegistration[], onMatch: (domId: string) => void) {
		this.#getItems = getItems;
		this.#onMatch = onMatch;
	}

	search(char: string) {
		this.#search += char;
		if (this.#timer !== null) clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.#search = '';
		}, TYPEAHEAD_RESET_MS);

		const items = this.#getItems().filter((i) => !i.disabled);
		const match = items.find((i) =>
			i.textValue.toLowerCase().startsWith(this.#search.toLowerCase())
		);
		if (match) this.#onMatch(match.domId);
	}

	reset() {
		this.#search = '';
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
	}
}
