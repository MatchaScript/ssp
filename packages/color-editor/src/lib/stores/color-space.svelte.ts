import { browser } from '$app/environment';
import { COLOR_SPACE_IDS, type ColorSpaceId } from '$lib/types/color-space';

const STORAGE_KEY = 'color-space';

function isValidId(value: unknown): value is ColorSpaceId {
	return typeof value === 'string' && COLOR_SPACE_IDS.includes(value as ColorSpaceId);
}

class ColorSpaceState {
	id = $state<ColorSpaceId>('oklch');

	constructor() {
		if (browser) {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (isValidId(stored)) {
				this.id = stored;
			}
		}
	}

	setId(value: ColorSpaceId) {
		this.id = value;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, value);
		}
	}
}

export const colorSpaceState = new ColorSpaceState();
