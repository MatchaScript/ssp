/** Smallest and largest contrast ratio the UI lets a target take. */
const MIN_RATIO = 1;
const MAX_RATIO = 21;

export interface LightnessStop {
	ratio: number;
	/** L* of the swatch this ratio produced, in the chart's 0–100 range. */
	lightness: number;
}

function round(value: number): number {
	return Math.round(value * 1000) / 1000;
}

function clamp(value: number): number {
	return Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/**
 * Contrast ratios spread linearly between the current smallest and largest.
 *
 * Even steps in ratio, not in perceived lightness — WCAG contrast grows far
 * faster than L* does, so the resulting scale bunches up at the light end.
 */
export function evenlySpacedRatios(targets: number[]): number[] {
	if (targets.length < 2) return [...targets];

	const min = Math.min(...targets);
	const max = Math.max(...targets);

	return targets.map((_, i) => round(lerp(min, max, i / (targets.length - 1))));
}

/**
 * The ratio that produced a given L*, read off the scale's own samples.
 *
 * `samples` must be sorted by ascending lightness. Outside the sampled range
 * the nearest end is used: extrapolating a contrast curve invents values the
 * scale never demonstrated.
 */
function ratioAtLightness(samples: LightnessStop[], lightness: number): number {
	const first = samples[0];
	const last = samples[samples.length - 1];
	if (lightness <= first.lightness) return first.ratio;
	if (lightness >= last.lightness) return last.ratio;

	for (let i = 1; i < samples.length; i++) {
		const hi = samples[i];
		if (lightness > hi.lightness) continue;

		const lo = samples[i - 1];
		const span = hi.lightness - lo.lightness;
		return span === 0 ? lo.ratio : lerp(lo.ratio, hi.ratio, (lightness - lo.lightness) / span);
	}

	return last.ratio;
}

/**
 * Contrast ratios chosen so the generated swatches land on evenly spaced L*.
 *
 * Inverts the scale's own ratio→L* samples rather than assuming a shape, so it
 * follows whatever curve Leonardo produced for this particular hue. The range
 * is the current first and last stop's lightness; only the spacing changes.
 */
export function ratiosForEvenLightness(stops: LightnessStop[]): number[] {
	if (stops.length < 2) return stops.map((s) => s.ratio);

	const from = stops[0].lightness;
	const to = stops[stops.length - 1].lightness;
	const samples = [...stops].sort((a, b) => a.lightness - b.lightness);

	return stops.map((_, i) =>
		round(clamp(ratioAtLightness(samples, lerp(from, to, i / (stops.length - 1)))))
	);
}
