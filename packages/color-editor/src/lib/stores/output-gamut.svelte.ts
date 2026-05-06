import { browser } from '$app/environment';

export type OutputGamut = 'srgb' | 'display-p3';

const STORAGE_KEY = 'output-gamut';
const VALID: readonly OutputGamut[] = ['srgb', 'display-p3'];

function isValid(value: unknown): value is OutputGamut {
	return typeof value === 'string' && VALID.includes(value as OutputGamut);
}

class OutputGamutState {
	id = $state<OutputGamut>('srgb');

	constructor() {
		if (browser) {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (isValid(stored)) {
				this.id = stored;
			}
		}
	}

	setId(value: OutputGamut) {
		this.id = value;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, value);
		}
	}
}

export const outputGamutState = new OutputGamutState();
