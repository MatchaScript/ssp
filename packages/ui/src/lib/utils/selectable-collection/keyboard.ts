/**
 * Minimal keyboard-event interface consumed by the shared keyboard helpers.
 * Satisfied by the browser's `KeyboardEvent` and by plain objects in tests.
 */
export interface KeyboardEventLike {
	readonly key: string;
	readonly ctrlKey: boolean;
	readonly metaKey: boolean;
	readonly altKey: boolean;
}

/**
 * True when a key event represents a single printable character with no
 * command modifier — i.e. a candidate for typeahead. Shift is allowed (it
 * produces uppercase / shifted glyphs); Ctrl / Meta / Alt are not.
 */
export function isPrintable(e: KeyboardEventLike): boolean {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
}
