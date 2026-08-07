/**
 * Strip a scale's own name off a generated swatch name: `"blue 100"` → `"100"`.
 *
 * Scale names come from the config and are user-editable, so they are matched
 * literally — building a regex out of one turns `blue(` into a syntax error and
 * `b.ue` into a wildcard.
 */
export function stripScaleName(valueName: string, scaleName: string): string {
	if (!scaleName || !valueName.toLowerCase().startsWith(scaleName.toLowerCase())) {
		return valueName;
	}
	return valueName.slice(scaleName.length).trimStart();
}
