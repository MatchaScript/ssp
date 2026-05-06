// Augment lib.dom's FocusOptions with the `focusVisible` member defined in the
// HTML spec (whatwg/html#7810). Supported in Chrome 124+, Firefox 134+, Safari
// 18.4+ — TypeScript's lib.dom has not picked it up yet. Used to force the
// :focus-visible heuristic when programmatically moving roving focus (Safari
// does not infer modality across .focus() calls).
interface FocusOptions {
	focusVisible?: boolean;
}
