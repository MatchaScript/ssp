import type { CssColor } from '@adobe/leonardo-contrast-colors';
import type { ColorConfig } from '$lib/types/spectrum-config';

export function buildColorKeys(color: ColorConfig): CssColor[] {
	const anchorValues = Object.values(color.scaleAnchors) as CssColor[];
	const baseAlreadyIncluded = anchorValues.some(
		(v) => v.toLowerCase() === color.baseHex.toLowerCase()
	);
	return baseAlreadyIncluded ? anchorValues : [color.baseHex as CssColor, ...anchorValues];
}
