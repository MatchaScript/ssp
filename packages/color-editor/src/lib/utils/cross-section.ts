import type { ColorSpaceConfig } from '$lib/types/color-space';

/**
 * Slider positions (0–100) for each scale level, taken from the level's mean
 * lightness across the given scales in the display color space.
 *
 * Non-uniform by nature: Leonardo picks a different lightness per hue for the
 * same contrast ratio, so the levels do not sit at even intervals.
 */
export function crossSectionTicks(
	scales: { swatches: string[] }[],
	levelCount: number,
	space: ColorSpaceConfig
): number[] {
	if (!scales.length || !levelCount) return [];

	const maxLightness = space.channels[2].max;
	const ticks: number[] = [];

	for (let level = 0; level < levelCount; level++) {
		let sum = 0;
		let count = 0;
		for (const scale of scales) {
			const hex = scale.swatches[level];
			if (!hex) continue;
			sum += space.extract(hex)[2];
			count++;
		}
		if (count > 0) ticks.push((sum / count / maxLightness) * 100);
	}

	return ticks;
}

/** Index of the tick closest to `value`; 0 when there are no ticks. */
export function nearestTickIndex(value: number, ticks: number[]): number {
	let best = 0;
	let bestDistance = Infinity;

	for (let i = 0; i < ticks.length; i++) {
		const distance = Math.abs(ticks[i] - value);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = i;
		}
	}

	return best;
}
