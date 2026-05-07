export type Direction = 'ltr' | 'rtl';

/**
 * Reads the computed text direction at the given element. Picks up the closest
 * `dir` attribute, an inherited `direction` CSS property, or any combination of
 * both. Returns `'ltr'` when `el` is `null` or `getComputedStyle` is unavailable.
 *
 * Modeled on bits-ui's `getElemDirection`. No state, no MutationObserver — the
 * caller invokes this at the moment a key is pressed.
 */
export function getElementDirection(el: HTMLElement | null): Direction {
	if (!el || typeof window === 'undefined') return 'ltr';
	return window.getComputedStyle(el).direction === 'rtl' ? 'rtl' : 'ltr';
}
